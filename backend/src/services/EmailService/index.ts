import nodemailer from 'nodemailer';
import sequelize from 'sequelize';
import { hash } from 'bcryptjs';
import { Transaction, Op } from 'sequelize';
import moment from 'moment';
import path from 'path';

// Database and Models
import database from '../../database';
import Setting from '../../models/Setting';
import Company from '../../models/Company';
import Email from '../../models/Email';

// Utils and Errors
import AppError from '../../errors/AppError';
import { logger } from '../../utils/logger';

// Interfaces
interface EmailConfig {
host: string;
port: number;
secure: boolean;
auth: {
  user: string;
  pass: string;
};
}

interface UserData {
companyId: number;
email: string;
[key: string]: any;
}

export interface EmailAttachment {
filename: string;
content: Buffer;
contentType: string;
path?: string;
}

export interface EmailMetadata {
isPasswordReset?: boolean;
isWelcomeEmail?: boolean;
isTicketEmail?: boolean;
token?: string;
userName?: string;
loginUrl?: string;
ticketId?: string | number;
attachments?: EmailAttachment[];
templateData?: Record<string, any>;
taskId?: number;
paymentId?: string;
type?: string;
}

interface SendMailResponse {
success: boolean;
messageId?: string;
scheduled?: boolean;
emailId?: number;
}

/**
* Serviço para gerenciamento de emails
*/
class EmailService {
private readonly MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB
private readonly EMAIL_STATUSES = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SENT: 'SENT',
  ERROR: 'ERROR',
  CANCELLED: 'CANCELLED'
};


/**
   * Cria um transportador SMTP para envio de emails
   * @param companyId ID da empresa
   * @returns Transportador SMTP configurado
   */
private async createTransporter(companyId: number): Promise<nodemailer.Transporter> {
  logger.info(`Creating email transporter for company ${companyId}`);
  
  try {
    const config = await this.getSmtpConfig(companyId);
    
    // Validação adicional das configurações SMTP
    if (!this.validateSmtpConfig(config)) {
      throw new AppError('Invalid SMTP configuration', 400);
    }

    // Ajuste nas configurações do transporter
    const transporter = nodemailer.createTransport({
      ...config,
      secure: config.port === 465, // Ajusta secure baseado na porta
      tls: {
        rejectUnauthorized: false // Permite certificados auto-assinados
      },
      pool: true, // Habilita pool de conexões
      maxConnections: 5,
      maxMessages: 100
    });
    
    // Tenta verificar a conexão com timeout
    await Promise.race([
      transporter.verify(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SMTP verification timeout')), 5000)
      )
    ]);

    logger.info('Email transporter verified successfully');
    return transporter;

  } catch (error) {
    logger.error('Failed to create email transporter:', {
      error: error.message,
      stack: error.stack,
      companyId,
      context: 'createTransporter'
    });
    throw new AppError(`Failed to create email transporter: ${error.message}`, 500);
  }
}

/**
 * Valida a configuração SMTP
 * @param config Configuração SMTP
 * @returns Indicador se a configuração é válida
 */
private validateSmtpConfig(config: EmailConfig): boolean {
  return !!(
    config &&
    config.host &&
    config.port &&
    typeof config.port === 'number' &&
    config.auth &&
    config.auth.user &&
    config.auth.pass &&
    config.port > 0 &&
    config.port < 65536
  );
}

/**
 * Obtém a configuração SMTP de uma empresa
 * @param companyId ID da empresa
 * @returns Configuração SMTP
 */
private async getSmtpConfig(companyId: number): Promise<EmailConfig> {
  logger.info(`Fetching SMTP config for company ${companyId}`);
  
  try {
    const settings = await Setting.findAll({ 
      where: { 
        companyId, 
        key: {
          [Op.in]: ['smtpauth', 'usersmtpauth', 'clientsecretsmtpauth', 'smtpport']
        }
      }
    });

    const getSettingValue = (key: string) => {
      const setting = settings.find(s => s.key === key);
      return setting?.value?.trim();
    };

    const host = getSettingValue('smtpauth');
    const user = getSettingValue('usersmtpauth');
    const pass = getSettingValue('clientsecretsmtpauth');
    const port = getSettingValue('smtpport');

    if (!host || !user || !pass || !port) {
      logger.error('Incomplete SMTP configuration:', {
        companyId,
        hasHost: !!host,
        hasUser: !!user,
        hasPass: !!pass,
        hasPort: !!port
      });
      throw new AppError('SMTP configuration incomplete', 400);
    }

    const config: EmailConfig = {
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass }
    };

    return config;

  } catch (error) {
    logger.error('Failed to get SMTP config:', {
      error: error.message,
      companyId,
      context: 'getSmtpConfig'
    });
    throw error instanceof AppError ? error : new AppError('Failed to get SMTP configuration', 500);
  }
}

/**
 * Busca um usuário pelo email
 * @param email Email do usuário
 * @param transaction Transação do banco de dados
 * @returns Dados do usuário
 */
public async findUserByEmail(email: string, transaction?: Transaction): Promise<UserData | null> {
  try {
    const sql = `
      SELECT u.*, c.name as "companyName" 
      FROM "Users" u
      JOIN "Companies" c ON c.id = u."companyId"
      WHERE u.email = ?
    `;
    
    const [result] = await database.query(sql, {
      type: sequelize.QueryTypes.SELECT,
      replacements: [email],
      transaction
    });

    return result as UserData;
  } catch (error) {
    logger.error('Error finding user by email:', {
      error: error.message,
      email
    });
    throw error;
  }
}

/**
 * Atualiza o token de redefinição de senha de um usuário
 * @param email Email do usuário
 * @param token Token de redefinição
 * @param transaction Transação do banco de dados
 * @returns Indicador de sucesso
 */
private async updateUserResetToken(email: string, token: string, transaction?: Transaction): Promise<boolean> {
  try {
    const [, affectedRows] = await database.query(
      `UPDATE "Users" SET "resetPassword" = ?, "updatedAt" = NOW() WHERE email = ?`,
      {
        replacements: [token, email],
        type: sequelize.QueryTypes.UPDATE,
        transaction
      }
    );
    return affectedRows > 0;
  } catch (error) {
    logger.error('Error updating user reset token:', {
      error: error.message,
      email
    });
    throw error;
  }
}

/**
 * Atualiza a senha de um usuário após redefinição
 * @param email Email do usuário
 * @param token Token de redefinição
 * @param newPassword Nova senha
 * @param transaction Transação do banco de dados
 * @returns Indicador de sucesso
 */
private async updateUserPassword(
  email: string, 
  token: string, 
  newPassword: string, 
  transaction?: Transaction
): Promise<boolean> {
  try {
    const hashedPassword = await hash(newPassword, 8);
    const [, affectedRows] = await database.query(
      `UPDATE "Users" 
       SET "passwordHash" = ?, 
           "resetPassword" = '', 
           "updatedAt" = NOW() 
       WHERE email = ? AND "resetPassword" = ?`,
      {
        replacements: [hashedPassword, email, token],
        type: sequelize.QueryTypes.UPDATE,
        transaction
      }
    );
    return affectedRows > 0;
  } catch (error) {
    logger.error('Error updating user password:', {
      error: error.message,
      email
    });
    throw error;
  }
}

/**
 * Gera o conteúdo de um email de redefinição de senha
 * @param companyName Nome da empresa
 * @param token Token de redefinição
 * @returns Conteúdo do email
 */
private generatePasswordResetEmail(companyName: string, token: string): string {
  return `
    Olá,

    Você solicitou a redefinição de senha para sua conta no ${companyName}. 
    
    Seu código de verificação é: ${token}

    Este código expira em 1 hora.

    Se você não solicitou esta redefinição, por favor ignore este email.

    Atenciosamente,
    Equipe ${companyName}
  `.trim();
}

/**
 * Gera o conteúdo de um email de boas-vindas
 * @param userName Nome do usuário
 * @param companyName Nome da empresa
 * @param loginUrl URL de login
 * @returns Conteúdo do email
 */
private generateWelcomeEmail(userName: string, companyName: string, loginUrl: string): string {
  return `
    Olá ${userName},

    Bem-vindo(a) ao ${companyName}!

    Sua conta foi criada com sucesso. Acesse através do link:
    ${loginUrl}

    Por segurança, recomendamos que você:
    1. Altere sua senha no primeiro acesso
    2. Complete seu perfil
    3. Configure suas preferências

    Precisando de ajuda, estamos à disposição.

    Atenciosamente,
    Equipe ${companyName}
  `.trim();
}

/**
 * Valida anexos de email
 * @param attachments Lista de anexos
 */
private validateAttachments(attachments?: EmailAttachment[]): void {
  if (!attachments) return;

  for (const attachment of attachments) {
    if (attachment.content.length > this.MAX_ATTACHMENT_SIZE) {
      throw new AppError(
        `Attachment ${attachment.filename} exceeds maximum size of 10MB`,
        400
      );
    }
  }
}

/**
 * Salva anexos de email
 * @param emailId ID do email
 * @param attachments Lista de anexos
 * @param companyId ID da empresa
 */
private async saveAttachments(
  emailId: number,
  attachments: EmailAttachment[],
  companyId: number
): Promise<void> {
  // Implementar salvamento de anexos se necessário
  // Por exemplo, salvar em disco ou S3
}

/**
 * Obtém anexos de um email
 * @param emailId ID do email
 * @returns Lista de anexos
 */
private async getEmailAttachments(emailId: number): Promise<EmailAttachment[]> {
  // Implementar recuperação de anexos se necessário
  return [];
}

/**
 * Envia ou agenda um email
 * @param companyId ID da empresa
 * @param to Destinatário
 * @param subject Assunto
 * @param message Mensagem
 * @param sendAt Data de envio (para agendamento)
 * @param metadata Metadados adicionais
 * @returns Resposta do envio
 */
public async sendMail(
  companyId: number,
  to: string,
  subject: string,
  message: string,
  sendAt?: Date,
  metadata?: EmailMetadata
): Promise<SendMailResponse> {
  const transaction = await database.transaction();
  
  try {
    logger.info(`Processing email request`, {
      companyId,
      to,
      isScheduled: !!sendAt,
      hasAttachments: !!metadata?.attachments,
      isSystemEmail: metadata?.isPasswordReset || metadata?.isWelcomeEmail
    });

    // Validar anexos
    if (metadata?.attachments) {
      this.validateAttachments(metadata.attachments);
    }

    // Se for agendado
    if (sendAt && moment(sendAt).isAfter(moment())) {
      const email = await Email.create({
        sender: to,
        subject,
        message,
        companyId,
        scheduled: true,
        sendAt,
        status: this.EMAIL_STATUSES.PENDING,
        hasAttachments: !!metadata?.attachments
      }, { transaction });

      if (metadata?.attachments) {
        await this.saveAttachments(email.id, metadata.attachments, companyId);
      }

      await transaction.commit();
      
      logger.info(`Email scheduled successfully`, {
        emailId: email.id,
        scheduledFor: sendAt
      });

      return { 
        success: true, 
        scheduled: true,
        emailId: email.id 
      };
    }

    // Determinar qual companyId usar para o SMTP
    const smtpCompanyId = (metadata?.isPasswordReset || metadata?.isWelcomeEmail) ? 1 : companyId;
    
    // Envio imediato
    const transporter = await this.createTransporter(smtpCompanyId);
    
    // Buscar dados das empresas necessárias
    const company = await Company.findByPk(companyId);
    const smtpCompany = smtpCompanyId !== companyId ? await Company.findByPk(smtpCompanyId) : company;
    
    if (!company || !smtpCompany) {
      throw new AppError('Company not found', 404);
    }

    const smtpConfig = await this.getSmtpConfig(smtpCompanyId);

    // Processar template se necessário
    let emailText = message;
    let emailSubject = subject;

    if (metadata?.isPasswordReset) {
      emailText = this.generatePasswordResetEmail(company.name, metadata.token!);
      emailSubject = `Redefinição de Senha - ${company.name}`;
    } else if (metadata?.isWelcomeEmail) {
      emailText = this.generateWelcomeEmail(
        metadata.userName!,
        company.name,
        metadata.loginUrl!
      );
    }

    // Configurar email
    const mailOptions = {
      from: smtpConfig.auth.user,
      to,
      subject: emailSubject,
      text: emailText,
      attachments: metadata?.attachments
    };

    // Enviar
    const info = await transporter.sendMail(mailOptions);

    // Registrar
    const email = await Email.create({
      sender: to,
      subject: emailSubject,
      message: emailText,
      companyId, // Mantém o registro vinculado à empresa original
      scheduled: false,
      status: this.EMAIL_STATUSES.SENT,
      sentAt: new Date(),
      messageId: info.messageId,
      hasAttachments: !!metadata?.attachments
    }, { transaction });

    if (metadata?.attachments) {
      await this.saveAttachments(email.id, metadata.attachments, companyId);
    }

    await transaction.commit();

    logger.info(`Email sent successfully`, {
      emailId: email.id,
      messageId: info.messageId,
      smtpCompanyId
    });

    return { 
      success: true,
      messageId: info.messageId,
      emailId: email.id
    };

  } catch (error) {
    await transaction.rollback();
    
    logger.error(`Email sending failed:`, {
      error: error.message,
      stack: error.stack,
      isSystemEmail: metadata?.isPasswordReset || metadata?.isWelcomeEmail
    });
    
    throw new AppError(
      `Failed to ${sendAt ? 'schedule' : 'send'} email: ${error.message}`,
      500
    );
  }
}

/**
 * Envia um email com anexo
 * @param companyId ID da empresa
 * @param to Destinatário
 * @param subject Assunto
 * @param message Mensagem
 * @param attachment Anexo
 * @param sendAt Data de envio (para agendamento)
 * @returns Resposta do envio
 */
public async sendMailWithAttachment(
  companyId: number,
  to: string,
  subject: string,
  message: string,
  attachment: EmailAttachment,
  sendAt?: Date
): Promise<SendMailResponse> {
  return this.sendMail(
    companyId,
    to,
    subject,
    message,
    sendAt,
    { attachments: [attachment] }
  );
}

/**
 * Envia um ticket PDF por email
 * @param companyId ID da empresa
 * @param to Destinatário
 * @param subject Assunto
 * @param message Mensagem
 * @param pdfBuffer Buffer do arquivo PDF
 * @param ticketId ID do ticket
 * @returns Resposta do envio
 */
public async sendTicketPdf(
  companyId: number,
  to: string,
  subject: string,
  message: string,
  pdfBuffer: Buffer,
  ticketId: string | number
): Promise<SendMailResponse> {
  if (pdfBuffer.length > this.MAX_ATTACHMENT_SIZE) {
    throw new AppError('PDF file is too large. Maximum size is 10MB', 400);
  }

  return this.sendMail(
    companyId,
    to,
    subject,
    message,
    undefined,
    {
      isTicketEmail: true,
      ticketId,
      attachments: [{
        filename: `ticket_${ticketId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    }
  );
}

/**
 * Gera um token para redefinição de senha
 * @returns Token gerado
 */
private generateResetToken(): string {
  // Gerar token mais seguro com 8 caracteres
  return Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase()
    .replace(/O/g, 'A') // Evitar confusão O/0
    .replace(/I/g, 'X') // Evitar confusão I/l
    .replace(/L/g, 'Y'); // Evitar confusão I/l
}

/**
 * Inicia processo de redefinição de senha
 * @param email Email do usuário
 * @returns Resultado da operação
 */
public async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  const transaction = await database.transaction();

  try {
    const user = await this.findUserByEmail(email, transaction);
    
    if (!user) {
      // Por segurança, não informamos que o email não existe
      return { 
        success: true,
        message: 'Se o email existir, você receberá as instruções de reset'
      };
    }

    const token = this.generateResetToken();
    const updated = await this.updateUserResetToken(email, token, transaction);

    if (!updated) {
      throw new AppError('Erro ao atualizar token de reset', 500);
    }

    await this.sendMail(
      user.companyId,
      email,
      'Redefinição de Senha',
      '',
      undefined,
      { 
        isPasswordReset: true,
        token,
        templateData: {
          companyName: user.companyName
        }
      }
    );

    await transaction.commit();
    
    return { 
      success: true,
      message: 'Instruções de reset enviadas para o email'
    };

  } catch (error) {
    await transaction.rollback();
    logger.error('Erro ao processar reset de senha:', {
      error: error.message,
      email
    });
    throw error;
  }
}

/**
 * Finaliza o processo de redefinição de senha
 * @param email Email do usuário
 * @param token Token de redefinição
 * @param newPassword Nova senha
 * @returns Resultado da operação
 */
public async resetPassword(
  email: string,
  token: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const transaction = await database.transaction();

  try {
    const user = await this.findUserByEmail(email, transaction);
    
    if (!user) {
      throw new AppError('Email not found', 404);
    }

    const updated = await this.updateUserPassword(
      email,
      token,
      newPassword,
      transaction
    );

    if (!updated) {
      throw new AppError('Invalid or expired token', 400);
    }

    await this.sendMail(
      user.companyId,
      email,
      'Senha Alterada com Sucesso',
      `
        Sua senha foi alterada com sucesso.
        
        Se você não realizou esta alteração, entre em contato com o suporte imediatamente.
        
        Atenciosamente,
        Equipe ${user.companyName}
      `.trim(),
      undefined,
      { templateData: { companyName: user.companyName } }
    );

    await transaction.commit();
    
    return { 
      success: true,
      message: 'Password reset successful'
    };

  } catch (error) {
    await transaction.rollback();
    logger.error('Password reset failed:', {
      error: error.message,
      email
    });
    throw error;
  }
}

/**
 * Processa um email agendado
 * @param emailRecord Registro do email
 * @returns Indicador de sucesso
 */
public async processScheduledEmail(emailRecord: Email): Promise<boolean> {
  logger.info(`Processing scheduled email ID: ${emailRecord.id}`, {
    recipient: emailRecord.sender,
    scheduledFor: emailRecord.sendAt
  });

  const transaction = await database.transaction();

  try {
    // Atualizar status para processando
    await emailRecord.update({
      status: this.EMAIL_STATUSES.PROCESSING
    }, { transaction });

    const transporter = await this.createTransporter(emailRecord.companyId);
    const smtpConfig = await this.getSmtpConfig(emailRecord.companyId);
    
    // Recuperar anexos se houver
    const attachments = emailRecord.hasAttachments ? 
      await this.getEmailAttachments(emailRecord.id) : 
      undefined;

    const mailOptions = {
      from: smtpConfig.auth.user,
      to: emailRecord.sender,
      subject: emailRecord.subject,
      text: emailRecord.message,
      attachments
    };

    // Enviar email
    const info = await transporter.sendMail(mailOptions);
    
    // Atualizar registro com sucesso
    await emailRecord.update({
      status: this.EMAIL_STATUSES.SENT,
      sentAt: new Date(),
      messageId: info.messageId,
      error: null
    }, { transaction });

    await transaction.commit();

    logger.info(`Scheduled email sent successfully`, {
      emailId: emailRecord.id,
      messageId: info.messageId
    });

    return true;

  } catch (error) {
    await transaction.rollback();
    
    logger.error(`Failed to process scheduled email:`, {
      emailId: emailRecord.id,
      error: error.message,
      stack: error.stack
    });

    // Atualizar registro com erro
    await emailRecord.update({
      status: this.EMAIL_STATUSES.ERROR,
      error: error.message
    });
    
    throw error;
  }
}

/**
 * Obtém emails agendados pendentes
 * @param companyId ID da empresa
 * @returns Lista de emails
 */
public async getScheduledEmails(companyId: number): Promise<Email[]> {
  try {
    return await Email.findAll({
      where: {
        companyId,
        scheduled: true,
        status: this.EMAIL_STATUSES.PENDING,
        sendAt: {
          [Op.lte]: new Date()
        }
      },
      order: [['sendAt', 'ASC']]
    });
  } catch (error) {
    logger.error('Error fetching scheduled emails:', {
      error: error.message,
      companyId
    });
    throw error;
  }
}

/**
 * Cancela um email agendado
 * @param emailId ID do email
 * @param companyId ID da empresa
 * @returns Indicador de sucesso
 */
public async cancelScheduledEmail(emailId: number, companyId: number): Promise<boolean> {
  try {
    const email = await Email.findOne({
      where: {
        id: emailId,
        companyId,
        scheduled: true,
        status: this.EMAIL_STATUSES.PENDING
      }
    });

    if (!email) {
      throw new AppError('Scheduled email not found', 404);
    }

    await email.update({
      status: this.EMAIL_STATUSES.CANCELLED,
      error: 'Cancelled by user'
    });

    logger.info(`Scheduled email cancelled`, {
      emailId,
      companyId
    });

    return true;
  } catch (error) {
    logger.error('Error cancelling scheduled email:', {
      error: error.message,
      emailId,
      companyId
    });
    throw error;
  }
}

/**
 * Reagenda um email
 * @param emailId ID do email
 * @param companyId ID da empresa
 * @param newSendAt Nova data de envio
 * @returns Indicador de sucesso
 */
public async rescheduleMail(
  emailId: number,
  companyId: number,
  newSendAt: Date
): Promise<boolean> {
  if (moment(newSendAt).isBefore(moment())) {
    throw new AppError('New schedule date must be in the future', 400);
  }

  try {
    const email = await Email.findOne({
      where: {
        id: emailId,
        companyId,
        scheduled: true,
        status: this.EMAIL_STATUSES.PENDING
      }
    });

    if (!email) {
      throw new AppError('Scheduled email not found', 404);
    }

    await email.update({
      sendAt: newSendAt
    });

    logger.info(`Email rescheduled successfully`, {
      emailId,
      newSendAt
    });

    return true;
  } catch (error) {
    logger.error('Error rescheduling email:', {
      error: error.message,
      emailId,
      companyId
    });
    throw error;
  }
}

/**
 * Obtém estatísticas básicas de email
 * @param companyId ID da empresa
 * @returns Estatísticas
 */
public async getEmailStats(companyId: number): Promise<any> {
  try {
    const [totalSent, totalScheduled, totalFailed] = await Promise.all([
      Email.count({
        where: {
          companyId,
          status: this.EMAIL_STATUSES.SENT
        }
      }),
      Email.count({
        where: {
          companyId,
          scheduled: true,
          status: this.EMAIL_STATUSES.PENDING
        }
      }),
      Email.count({
        where: {
          companyId,
          status: this.EMAIL_STATUSES.ERROR
        }
      })
    ]);

    return {
      totalSent,
      totalScheduled,
      totalFailed,
      successRate: totalSent / (totalSent + totalFailed) * 100 || 0
    };
  } catch (error) {
    logger.error('Error getting email stats:', {
      error: error.message,
      companyId
    });
    throw error;
  }
}

/**
 * Verifica se a empresa tem configuração SMTP
 * @param companyId ID da empresa
 * @returns Indicador de configuração
 */
public async checkSmtpConfig(companyId: number): Promise<boolean> {
  try {
    const [urlSmtp, userSmtp, passwordSmtp, portSmtp] = await Promise.all([
      Setting.findOne({ where: { companyId, key: 'smtpauth' } }),
      Setting.findOne({ where: { companyId, key: 'usersmtpauth' } }),
      Setting.findOne({ where: { companyId, key: 'clientsecretsmtpauth' } }),
      Setting.findOne({ where: { companyId, key: 'smtpport' } })
    ]);

    return !!(urlSmtp?.value && userSmtp?.value && passwordSmtp?.value && portSmtp?.value);
  } catch (error) {
    logger.error('Error checking SMTP config:', {
      error: error.message,
      companyId
    });
    return false;
  }
}

/**
 * Obtém estatísticas detalhadas de email
 * @param companyId ID da empresa
 * @param options Opções de filtragem
 * @returns Estatísticas detalhadas
 */
// Correção para os erros de TypeScript no EmailService

// Modificações na função getDetailedStats

/**
 * Obtém estatísticas detalhadas de email
 * @param {number} companyId - ID da empresa
 * @param {Object} options - Opções de filtragem
 * @returns {Promise<Object>} Estatísticas de emails
 */
public async getDetailedStats(companyId: number, options: any = {}): Promise<any> {
  try {
    logger.info(`Obtendo estatísticas detalhadas para empresa ${companyId}`);
    
    // Período de datas
    const startDate = options.startDate ? new Date(options.startDate) : moment().subtract(30, 'days').toDate();
    const endDate = options.endDate ? new Date(options.endDate) : new Date();
    
    // Filtros base
    const baseWhere = {
      companyId,
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    };
    
    // Agregações - Corrigido o tipo para aceitar 5 itens no array
    const results = await Promise.all([
      // Total enviados
      Email.count({
        where: {
          ...baseWhere,
          scheduled: false
        }
      }),
      
      // Total agendados
      Email.count({
        where: {
          ...baseWhere,
          scheduled: true
        }
      }),
      
      // Total por dia
      Email.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('sentAt')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: {
          ...baseWhere,
          sentAt: { [Op.not]: null }
        },
        group: [sequelize.fn('DATE', sequelize.col('sentAt'))],
        order: [[sequelize.fn('DATE', sequelize.col('sentAt')), 'ASC']]
      }),
      
      // Contagem por status
      Email.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: baseWhere,
        group: ['status']
      }),
      
      // Tempo médio entre criação e envio
      Email.findAll({
        attributes: [
          [sequelize.fn('AVG', 
            sequelize.fn('EXTRACT', sequelize.literal('EPOCH FROM ("sentAt" - "createdAt")'))
          ), 'avgTime']
        ],
        where: {
          ...baseWhere,
          sentAt: { [Op.not]: null },
          scheduled: true // Apenas para emails agendados
        }
      })
    ]);

    // Desestruturar resultados com tipos corretos
    const sent = results[0];
    const scheduled = results[1];
    const totalByDay = results[2];
    const statusCount = results[3];
    const avgDeliveryTime = results[4];
    
    // Formatar resultados
    const byDay = totalByDay.map(record => ({
      date: record.get('date'),
      count: parseInt(record.get('count').toString()) // Convertendo explicitamente para string e depois para número
    }));
    
    // Inicializa byStatus com um objeto vazio tipado
    const byStatus: Record<string, number> = {};
    
    // Preenche byStatus com os resultados da consulta
    statusCount.forEach(record => {
      const status = record.status || 'unknown';
      const count = parseInt(record.get('count').toString());
      byStatus[status] = count;
    });
    
    // Trata caso de avgDeliveryTime ser undefined ou não ter registros
    let avgProcessingTimeSeconds = 0;
    if (avgDeliveryTime && avgDeliveryTime.length > 0) {
      const avgTimeValue = avgDeliveryTime[0].get('avgTime');
      avgProcessingTimeSeconds = avgTimeValue ? parseFloat(avgTimeValue.toString()) : 0;
    }
    
    const avgProcessingTimeMinutes = Math.round(avgProcessingTimeSeconds / 60);
    
    // Calcular percentuais usando acesso seguro a propriedades
    const totalEmails = sent + scheduled;
    const deliveryRate = totalEmails > 0 ? (((byStatus['SENT'] || 0) / totalEmails) * 100).toFixed(1) : '0';
    const errorRate = totalEmails > 0 ? (((byStatus['ERROR'] || 0) / totalEmails) * 100).toFixed(1) : '0';
    
    // Resultados finais
    const result = {
      summary: {
        totalEmails,
        totalSent: sent,
        totalScheduled: scheduled,
        deliveryRate,
        errorRate,
        avgProcessingTimeMinutes
      },
      byDay,
      byStatus,
      period: {
        startDate,
        endDate
      }
    };
    
    logger.info(`Estatísticas recuperadas com sucesso para empresa ${companyId}`);
    return result;
  } catch (error) {
    logger.error('Erro ao obter estatísticas de email:', {
      error: error.message,
      stack: error.stack,
      companyId
    });
    throw error;
  }
}

/**
 * Exporta emails para CSV ou JSON
 * @param companyId ID da empresa
 * @param format Formato de exportação ('csv' ou 'json')
 * @param filters Filtros de busca
 * @returns Dados exportados
 */
public async exportEmails(companyId: number, format: string = 'json', filters: any = {}): Promise<any> {
  try {
    logger.info(`Exportando emails para empresa ${companyId} no formato ${format}`);
    
    // Aplicar filtros
    const where: any = { companyId };
    
    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
      };
    }
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.scheduled !== undefined) {
      where.scheduled = filters.scheduled;
    }
    
    // Buscar emails com filtros
    const emails = await Email.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 5000 // Limitar para evitar sobrecarga
    });
    
    // Transformar dados para export
    const exportData = emails.map(email => ({
      id: email.id,
      recipient: email.sender,
      subject: email.subject,
      status: email.status,
      sentAt: email.sentAt ? moment(email.sentAt).format('YYYY-MM-DD HH:mm:ss') : null,
      scheduledFor: email.sendAt ? moment(email.sendAt).format('YYYY-MM-DD HH:mm:ss') : null,
      createdAt: moment(email.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      isScheduled: email.scheduled,
      hasAttachments: email.hasAttachments
    }));
    
    logger.info(`Exportados ${exportData.length} emails para empresa ${companyId}`);
    
    if (format === 'csv') {
      // Seria implementado usando biblioteca como papaparse
      // para transformar em CSV
      return { format: 'csv', data: exportData };
    }
    
    return { format: 'json', data: exportData };
  } catch (error) {
    logger.error('Erro ao exportar emails:', {
      error: error.message,
      stack: error.stack,
      companyId,
      format
    });
    throw error;
  }
}

/**
 * Busca emails com paginação e filtros avançados
 * @param companyId ID da empresa
 * @param options Opções de busca e paginação
 * @returns Emails paginados e detalhes
 */
public async findEmails(companyId: number, options: any = {}): Promise<any> {
  try {
    const {
      page = 1,
      limit = 20,
      orderBy = 'createdAt',
      orderDir = 'DESC',
      searchTerm = '',
      status,
      scheduled,
      startDate,
      endDate
    } = options;
    
    const offset = (page - 1) * limit;
    
    // Construir cláusula where
    const where: any = { companyId };
    
    // Filtro por status
    if (status) {
      where.status = status;
    }
    
    // Filtro por agendamento
    if (scheduled !== undefined) {
      where.scheduled = scheduled === 'true' || scheduled === true;
    }
    
    // Filtro por período
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    // Busca por termo
    if (searchTerm) {
      where[Op.or] = [
        { subject: { [Op.iLike]: `%${searchTerm}%` } },
        { sender: { [Op.iLike]: `%${searchTerm}%` } },
        { message: { [Op.iLike]: `%${searchTerm}%` } }
      ];
    }
    
    // Executar busca com paginação
    const { count, rows } = await Email.findAndCountAll({
      where,
      limit,
      offset,
      order: [[orderBy, orderDir]],
    });
    
    // Calcular paginação
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    logger.info(`Busca de emails realizada para empresa ${companyId}: ${rows.length} resultados`);
    
    return {
      data: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        status,
        scheduled,
        searchTerm,
        startDate,
        endDate,
        orderBy,
        orderDir
      }
    };
  } catch (error) {
    logger.error('Erro ao buscar emails:', {
      error: error.message,
      stack: error.stack,
      companyId,
      options
    });
    throw error;
  }
}

/**
 * Realiza reenvio de um email que falhou
 * @param emailId ID do email
 * @param companyId ID da empresa
 * @returns Indicador de sucesso
 */
public async resendEmail(emailId: number, companyId: number): Promise<boolean> {
  const transaction = await database.transaction();
  
  try {
    logger.info(`Iniciando reenvio do email ${emailId} para empresa ${companyId}`);
    
    // Buscar o email original
    const originalEmail = await Email.findOne({
      where: {
        id: emailId,
        companyId,
        status: 'ERROR' // Apenas emails com erro podem ser reenviados
      }
    });
    
    if (!originalEmail) {
      throw new AppError('Email não encontrado ou não pode ser reenviado', 404);
    }
    
    // Criar novo registro baseado no original
    const newEmail = await Email.create({
      sender: originalEmail.sender,
      subject: originalEmail.subject,
      message: originalEmail.message,
      companyId,
      scheduled: false,
      status: this.EMAIL_STATUSES.PENDING,
      hasAttachments: originalEmail.hasAttachments,
      // Referência ao email original
      relatedEmailId: originalEmail.id
    }, { transaction });
    
    // Se tiver anexos, copiar os anexos do email original
    if (originalEmail.hasAttachments) {
      const attachments = await this.getEmailAttachments(originalEmail.id);
      await this.saveAttachments(newEmail.id, attachments, companyId);
    }
    
    // Criar transportador e enviar email
    const transporter = await this.createTransporter(companyId);
    const smtpConfig = await this.getSmtpConfig(companyId);
    
    const company = await Company.findByPk(companyId);
    
    if (!company) {
      throw new AppError('Empresa não encontrada', 404);
    }
    
    // Configurar email
    const mailOptions = {
      from: smtpConfig.auth.user,
      to: originalEmail.sender,
      subject: originalEmail.subject,
      text: originalEmail.message,
      attachments: originalEmail.hasAttachments ? await this.getEmailAttachments(originalEmail.id) : undefined
    };
    
    // Enviar
    const info = await transporter.sendMail(mailOptions);
    
    // Atualizar registro
    await newEmail.update({
      status: this.EMAIL_STATUSES.SENT,
      sentAt: new Date(),
      messageId: info.messageId,
    }, { transaction });
    
    // Marcar o original como tendo sido reenviado
    await originalEmail.update({
      retriedAt: new Date(),
      retriedEmailId: newEmail.id
    }, { transaction });
    
    await transaction.commit();
    
    logger.info(`Email ${emailId} reenviado com sucesso. Novo ID: ${newEmail.id}`);
    return true;
  } catch (error) {
    await transaction.rollback();
    
    logger.error(`Erro ao reenviar email ${emailId}:`, {
      error: error.message,
      stack: error.stack,
      companyId
    });
    
    throw error;
  }
}

/**
 * Realiza limpeza periódica de emails antigos
 * @param daysToKeep Dias para manter emails
 * @returns Número de emails removidos
 */
public async cleanupOldEmails(daysToKeep: number = 90): Promise<number> {
  try {
    logger.info(`Iniciando limpeza de emails com mais de ${daysToKeep} dias`);
    
    const cutoffDate = moment().subtract(daysToKeep, 'days').toDate();
    
    // Não excluir emails com erro que não foram reenviados
    const deletedCount = await Email.destroy({
      where: {
        createdAt: {
          [Op.lt]: cutoffDate
        },
        [Op.or]: [
          { status: { [Op.ne]: 'ERROR' } },
          { retriedAt: { [Op.ne]: null } }
        ]
      }
    });
    
    logger.info(`Limpeza concluída: ${deletedCount} emails removidos`);
    return deletedCount;
  } catch (error) {
    logger.error('Erro ao limpar emails antigos:', {
      error: error.message,
      stack: error.stack,
      daysToKeep
    });
    throw error;
  }
}

/**
 * Webhook para receber confirmações de entrega e leitura de emails
 * @param payload Payload do webhook
 * @returns Indicador de sucesso
 */
public async processEmailWebhook(payload: any): Promise<boolean> {
  try {
    logger.info('Processando webhook de email');
    
    const { messageId, event, recipient, timestamp } = payload;
    
    if (!messageId || !event) {
      logger.warn('Webhook com dados incompletos');
      return false;
    }
    
    // Buscar email pelo messageId
    const email = await Email.findOne({
      where: { messageId }
    });
    
    if (!email) {
      logger.warn(`Email com messageId ${messageId} não encontrado`);
      return false;
    }
    
    // Atualizar status conforme o evento
    switch (event) {
      case 'delivered':
        await email.update({
          deliveredAt: new Date(timestamp),
          deliveryStatus: 'DELIVERED'
        });
        break;
        
      case 'opened':
        await email.update({
          openedAt: new Date(timestamp),
          openCount: sequelize.literal('COALESCE("openCount", 0) + 1')
        });
        break;
        
      case 'bounced':
        await email.update({
          status: 'ERROR',
          error: payload.reason || 'Email bounced',
          deliveryStatus: 'BOUNCED'
        });
        break;
        
      case 'complaint':
        await email.update({
          deliveryStatus: 'COMPLAINT',
          error: 'Recipient marked as spam'
        });
        break;
    }
    
    logger.info(`Webhook processado: email ${email.id}, evento ${event}`);
    return true;
  } catch (error) {
    logger.error('Erro ao processar webhook de email:', {
      error: error.message,
      stack: error.stack,
      payload
    });
    return false;
  }
}
}

export default new EmailService();