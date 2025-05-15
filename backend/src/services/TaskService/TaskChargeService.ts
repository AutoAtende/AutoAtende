import Task from '../../models/Task';
import User from '../../models/User';
import ContactEmployer from '../../models/ContactEmployer';
import TaskTimeline from '../../models/TaskTimeline';
import { logger } from '../../utils/logger';
import { Op, Sequelize } from 'sequelize';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import PDFDocument from 'pdfkit';
import moment from 'moment';
import EmailService from '../EmailService';
import { getIO, emitTaskUpdate } from '../../libs/socket';

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

class TaskChargeService {
  // Método para buscar uma tarefa por ID
  public static async getTaskById(taskId: number, companyId: number): Promise<Task | null> {
    try {
      const task = await Task.findOne({
        where: { id: taskId, companyId },
        include: [
          {
            model: ContactEmployer,
            as: 'employer',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'responsible',
            attributes: ['id', 'name']
          }
        ]
      });

      return task;
    } catch (error) {
      logger.error('Erro ao buscar tarefa por ID:', error);
      throw error;
    }
  }

  // Método para adicionar cobrança à tarefa
  public static async addCharge(
    taskId: number,
    userId: number,
    companyId: number,
    chargeValue: number
  ): Promise<Task> {
    try {
      logger.info('Adicionando cobrança à tarefa', {
        taskId,
        userId,
        companyId,
        chargeValue
      });

      // Buscar a tarefa
      const task = await this.getTaskById(taskId, companyId);

      if (!task) {
        throw new Error('Tarefa não encontrada');
      }

      // Atualizar a tarefa com os dados de cobrança
      const updatedTask = await task.update({
        hasCharge: true,
        chargeValue: parseFloat(String(chargeValue)),
        isPaid: false
      });

      // Adicionar à timeline
      await TaskTimeline.create({
        taskId: task.id,
        userId,
        action: 'charge_added',
        details: {
          chargeValue,
          addedAt: new Date(),
          addedBy: userId
        }
      });

      // Emitir evento
      emitTaskUpdate(companyId, {
        type: 'task-charge-added',
        taskId,
        chargeValue,
        responsibleUserId: task.responsibleUserId,
        updatedBy: userId
      });

      return updatedTask;
    } catch (error) {
      logger.error('Erro ao adicionar cobrança:', {
        error: error.message,
        taskId,
        userId,
        companyId
      });
      throw error;
    }
  }

  // Função para registrar pagamento
  public static async registerPayment(
    taskId: number,
    userId: number,
    companyId: number,
    paymentData: {
      paymentDate: Date;
      paymentNotes?: string;
      sendReceipt?: boolean;
    }
  ): Promise<Task> {
    try {
      logger.info('Registrando pagamento de tarefa', {
        taskId,
        userId,
        companyId,
        paymentData
      });

      // Buscar a tarefa
      const task = await Task.findOne({
        where: { id: taskId, companyId },
        include: [
          {
            model: ContactEmployer,
            as: 'employer',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'responsible',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!task) {
        throw new Error('Tarefa não encontrada');
      }

      if (!task.hasCharge) {
        throw new Error('Tarefa não possui cobrança');
      }

      if (task.isPaid) {
        throw new Error('Cobrança já está paga');
      }

      // Atualizar a tarefa
      const updatedTask = await task.update({
        isPaid: true,
        paymentDate: paymentData.paymentDate || new Date(),
        paymentNotes: paymentData.paymentNotes || null,
        paidBy: userId
      });

      // Registrar na timeline
      await TaskTimeline.create({
        taskId,
        userId,
        action: 'payment_registered',
        details: {
          paymentDate: paymentData.paymentDate || new Date(),
          paymentNotes: paymentData.paymentNotes || null,
          chargeValue: task.chargeValue
        }
      });

      // Emitir evento de atualização
      emitTaskUpdate(companyId, {
        type: 'task-payment-registered',
        taskId,
        updatedBy: userId,
        responsibleUserId: task.responsibleUserId,
        paymentDate: paymentData.paymentDate || new Date()
      });

      // Enviar recibo por email se solicitado
      if (paymentData.sendReceipt && task.requesterEmail) {
        await this.sendPaymentReceipt(task, userId);
      }

      return updatedTask;
    } catch (error) {
      logger.error('Erro ao registrar pagamento', {
        error: error.message,
        taskId,
        userId,
        companyId
      });
      throw error;
    }
  }

  // Função para gerar PDF da cobrança
// Função para gerar PDF da cobrança
public static async generateChargePDF(
  taskId: number,
  companyId: number
): Promise<string> {
  try {
    // Buscar tarefa com informações relacionadas
    const task = await Task.findOne({
      where: { id: taskId, companyId },
      include: [
        {
          model: ContactEmployer,
          as: 'employer',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'responsible',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!task) {
      logger.error('Tarefa não encontrada', { taskId, companyId });
      throw new Error('Tarefa não encontrada');
    }
    
    if (!task.hasCharge) {
      logger.error('Tarefa não possui cobrança', { taskId, companyId });
      throw new Error('Tarefa não possui cobrança');
    }

    // Verificar se o diretório público existe
    const publicPath = process.env.BACKEND_PUBLIC_PATH || 'public';
    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath, { recursive: true });
      logger.info(`Diretório público criado: ${publicPath}`);
    }

    // Criar diretório para salvar os PDFs
    const companyDir = path.join(publicPath, `company${companyId}`);
    if (!fs.existsSync(companyDir)) {
      fs.mkdirSync(companyDir, { recursive: true });
      logger.info(`Diretório da empresa criado: ${companyDir}`);
    }

    const pdfDir = path.join(companyDir, 'charges');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
      logger.info(`Diretório de cobranças criado: ${pdfDir}`);
    }

    // Criar nome de arquivo único
    const fileName = `charge_${taskId}_${uuidv4()}.pdf`;
    const filePath = path.join(pdfDir, fileName);

    // Gerar o PDF
    const doc = new PDFDocument();
    
    // Garantir que o stream seja fechado adequadamente em caso de erro
    let streamClosed = false;
    const stream = fs.createWriteStream(filePath);
    
    // Adicionar manipulação de erros ao stream
    stream.on('error', (err) => {
      logger.error('Erro no stream de escrita do PDF:', {
        error: err.message,
        filePath
      });
      
      if (!streamClosed) {
        streamClosed = true;
        // Aqui vamos tentar finalizar o documento se ainda não foi finalizado
        try {
          doc.end();
        } catch (e) {
          logger.error('Erro ao finalizar documento PDF após erro no stream:', e);
        }
      }
    });
    
    doc.on('error', (err) => {
      logger.error('Erro na geração do PDF:', {
        error: err.message,
        filePath
      });
      
      if (!streamClosed) {
        streamClosed = true;
        stream.end();
      }
    });
    
    // Finalizar o stream quando o documento estiver completo
    doc.on('end', () => {
      if (!streamClosed) {
        streamClosed = true;
        stream.end();
      }
    });
    
    // Pipe ao stream
    doc.pipe(stream);

    // Cabeçalho
    doc.fontSize(20).text('FATURA', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Fatura #: ${taskId}`, { align: 'right' });
    doc.fontSize(12).text(`Data: ${moment().format('DD/MM/YYYY')}`, { align: 'right' });
    doc.moveDown();

    // Informações da empresa (mock)
    doc.fontSize(14).text('Empresa:');
    doc.fontSize(12).text('AutoAtende');
    doc.fontSize(12).text('CNPJ: XX.XXX.XXX/0001-XX');
    doc.fontSize(12).text('Endereço: Rua da Empresa, 123');
    doc.moveDown();

    // Informações do cliente
    doc.fontSize(14).text('Cliente:');
    if (task.employer) {
      doc.fontSize(12).text(task.employer.name);
    } else if (task.requesterName) {
      doc.fontSize(12).text(task.requesterName);
      if (task.requesterEmail) {
        doc.fontSize(12).text(`Email: ${task.requesterEmail}`);
      }
    } else {
      doc.fontSize(12).text('Cliente não especificado');
    }
    doc.moveDown();

    // Detalhes da tarefa
    doc.fontSize(14).text('Detalhes:');
    doc.fontSize(12).text(`Tarefa: ${task.title}`);
    if (task.text) {
      doc.fontSize(12).text(`Descrição: ${task.text}`);
    }
    if (task.responsible) {
      doc.fontSize(12).text(`Responsável: ${task.responsible.name}`);
    }
    doc.moveDown();

    // Valores
    doc.fontSize(14).text('Valor:');
    doc.fontSize(16).text(`R$ ${task.chargeValue.toFixed(2)}`, { align: 'right' });
    doc.moveDown();

    // Status
    doc.fontSize(14).text('Status:');
    doc.fontSize(12).text(task.isPaid ? 'PAGO' : 'PENDENTE', { align: 'right' });
    doc.moveDown();

    // Instruções de pagamento (mock)
    doc.fontSize(14).text('Instruções de Pagamento:');
    doc.fontSize(12).text('Banco: XXX');
    doc.fontSize(12).text('Agência: XXXX-X');
    doc.fontSize(12).text('Conta: XXXXX-X');
    doc.fontSize(12).text('PIX: XX.XXX.XXX/0001-XX');
    doc.moveDown();

    // Observações
    doc.fontSize(10).text('Observações:', { underline: true });
    doc.fontSize(8).text('Este documento não possui valor fiscal.');
    doc.end();

    // Aguardar a finalização da escrita do PDF
    await new Promise<void>((resolve, reject) => {
      stream.on('finish', () => resolve());
      stream.on('error', (error) => reject(error));
    });

    // Atualizar link da cobrança na tarefa
    const baseUrl = process.env.BACKEND_URL;
    const chargeLink = `${baseUrl}/public/company${companyId}/charges/${fileName}`;
    await task.update({ chargeLink });
    logger.info('Task atualizada com chargeLink:', task.chargeLink);
    // Salvar na timeline
    await TaskTimeline.create({
      taskId,
      action: 'charge_pdf_generated',
      details: {
        fileName,
        filePath: chargeLink,
        generatedAt: new Date()
      }
    });

    // Emitir evento de PDF gerado
    emitTaskUpdate(companyId, {
      type: 'task-charge-pdf-generated',
      taskId,
      chargeLink,
      responsibleUserId: task.responsibleUserId
    });

    logger.info('PDF de cobrança gerado com sucesso', {
      taskId,
      fileName,
      chargeLink
    });

    // Retornar o caminho do arquivo
    return chargeLink;
  } catch (error) {
    logger.error('Erro ao gerar PDF de cobrança', {
      error: error.message,
      stack: error.stack,
      taskId,
      companyId
    });
    throw error;
  }
}

  // Função para enviar recibo por email
  private static async sendPaymentReceipt(task: Task, userId: number): Promise<boolean> {
    try {
      const emailTo = task.requesterEmail;
      
      if (!emailTo) {
        logger.warn('Não foi possível enviar recibo: Email do destinatário não encontrado', {
          taskId: task.id,
          userId
        });
        return false;
      }

      const emailSubject = `Recibo de Pagamento - ${task.title}`;
      const emailContent = `
        <h1>Recibo de Pagamento</h1>
        <p>Prezado(a),</p>
        <p>Informamos que o pagamento referente à tarefa "${task.title}" foi confirmado.</p>
        <p><strong>Detalhes do pagamento:</strong></p>
        <ul>
          <li>Data: ${moment(task.paymentDate).format('DD/MM/YYYY')}</li>
          <li>Valor: R$ ${task.chargeValue?.toFixed(2) || '0.00'}</li>
          <li>Identificação: #${task.id}</li>
        </ul>
        <p>Em caso de dúvidas, entre em contato conosco.</p>
        <p>Atenciosamente,<br>Equipe AutoAtende</p>
      `;

      await EmailService.sendMail(
        task.companyId,
        emailTo,
        emailSubject,
        emailContent
      );

      await TaskTimeline.create({
        taskId: task.id,
        userId,
        action: 'receipt_email_sent',
        details: {
          email: emailTo,
          sentAt: new Date()
        }
      });

      // Emitir evento de email enviado
      emitTaskUpdate(task.companyId, {
        type: 'task-receipt-email-sent',
        taskId: task.id,
        email: emailTo,
        sentAt: new Date(),
        responsibleUserId: task.responsibleUserId
      });

      return true;
    } catch (error) {
      logger.error('Erro ao enviar recibo por email', {
        error: error.message,
        taskId: task.id,
        userId
      });
      return false;
    }
  }

  // Função para enviar cobrança por email
  public static async sendChargeEmail(
    taskId: number,
    userId: number,
    companyId: number
  ): Promise<boolean> {
    try {
      // Buscar tarefa com informações relacionadas
      const task = await Task.findOne({
        where: { id: taskId, companyId },
        include: [
          {
            model: ContactEmployer,
            as: 'employer',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!task) {
        throw new Error('Tarefa não encontrada');
      }

      if (!task.hasCharge) {
        throw new Error('Tarefa não possui cobrança');
      }

      const emailTo = task.requesterEmail;
      if (!emailTo) {
        throw new Error('Não há email de destino para enviar a cobrança');
      }

      // Garantir que temos um PDF gerado
      if (!task.chargeLink) {
        await this.generateChargePDF(taskId, companyId);
        // Recarregar a tarefa para obter o link atualizado
        await task.reload();
      }

      // Preparar o email
      const emailSubject = `Fatura - ${task.title}`;
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const pdfUrl = `${baseUrl}${task.chargeLink}`;

      const emailContent = `
        <h1>Fatura</h1>
        <p>Prezado(a),</p>
        <p>Segue a fatura referente à tarefa "${task.title}".</p>
        <p><strong>Detalhes:</strong></p>
        <ul>
          <li>Tarefa: ${task.title}</li>
          <li>Valor: R$ ${task.chargeValue?.toFixed(2) || '0.00'}</li>
          <li>Vencimento: ${task.dueDate ? moment(task.dueDate).format('DD/MM/YYYY') : 'Não especificado'}</li>
        </ul>
        <p>Você pode acessar a fatura pelo seguinte link:</p>
        <p><a href="${pdfUrl}" target="_blank">Visualizar Fatura</a></p>
        <p>Em caso de dúvidas, entre em contato conosco.</p>
        <p>Atenciosamente,<br>Equipe AutoAtende</p>
      `;

      // Verificar se o arquivo PDF existe
      const pdfFilePath = path.join(process.env.BACKEND_PUBLIC_PATH || 'public', task.chargeLink.slice(8));
      
      if (!fs.existsSync(pdfFilePath)) {
        logger.warn('Arquivo PDF não encontrado. Gerando novamente...', {
          pdfFilePath,
          taskId
        });
        
        // Se o arquivo não existir, gera novamente
        await this.generateChargePDF(taskId, companyId);
        await task.reload();
      }

      // Preparar os anexos
      const metadata: EmailMetadata = {
        templateData: {
          taskId: task.id,
          taskTitle: task.title
        }
      };

      // Adicionar o arquivo PDF como anexo apenas se ele existir
      if (fs.existsSync(pdfFilePath)) {
        metadata.attachments = [{
          filename: `fatura_${taskId}.pdf`,
          path: pdfFilePath,
          content: fs.readFileSync(pdfFilePath),
          contentType: 'application/pdf'
        }];
      }

      await EmailService.sendMail(
        companyId,
        emailTo,
        emailSubject,
        emailContent,
        null, // sendAt é null pois não é um email agendado
        metadata // passando os anexos como metadados
      );

      await TaskTimeline.create({
        taskId: task.id,
        userId,
        action: 'charge_email_sent',
        details: {
          email: emailTo,
          sentAt: new Date()
        }
      });

      // Emitir evento de email enviado
      emitTaskUpdate(companyId, {
        type: 'task-charge-email-sent',
        taskId: task.id,
        email: emailTo,
        sentAt: new Date(),
        responsibleUserId: task.responsibleUserId
      });

      return true;
    } catch (error) {
      logger.error('Erro ao enviar cobrança por email', {
        error: error.message,
        stack: error.stack,
        taskId,
        userId,
        companyId
      });
      throw error;
    }
  }

  // Função para buscar cobranças pendentes
public static async getPendingCharges(
  companyId: number,
  options?: {
    employerId?: number;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }
): Promise<{ charges: Task[]; count: number }> {
  try {
    const whereClause: any = {
      companyId,
      hasCharge: true,
      isPaid: false,
      deleted: false // Garantir que tarefas excluídas não apareçam
    };

    if (options?.employerId) {
      whereClause.employerId = options.employerId;
    }

    // Ajuste na lógica de filtro de data para usar o intervalo correto
    if (options?.startDate || options?.endDate) {
      whereClause.createdAt = {};
      
      if (options.startDate) {
        whereClause.createdAt[Op.gte] = options.startDate;
      }
      
      if (options.endDate) {
        // Ajuste para incluir o dia inteiro até o final
        const endDate = new Date(options.endDate);
        endDate.setHours(23, 59, 59, 999);
        whereClause.createdAt[Op.lte] = endDate;
      }
    }

    // Adicionando log para depuração
    logger.debug('Consulta de cobranças pendentes:', {
      whereClause,
      limit: options?.limit,
      offset: options?.offset
    });

    const { rows, count } = await Task.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: ContactEmployer,
          as: 'employer',
          attributes: ['id', 'name', 'email'],
          required: false
        },
        {
          model: User,
          as: 'responsible',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name']
        }
      ],
      limit: options?.limit,
      offset: options?.offset,
      order: [['dueDate', 'ASC']]
    });

    return {
      charges: rows,
      count
    };
  } catch (error) {
    logger.error('Erro ao buscar cobranças pendentes', {
      error: error.message,
      stack: error.stack,
      companyId,
      options
    });
    throw error;
  }
}

  // Função para buscar cobranças pagas
  public static async getPaidCharges(
    companyId: number,
    options?: {
      employerId?: number;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ charges: Task[]; count: number }> {
    try {
      const whereClause: any = {
        companyId,
        hasCharge: true,
        isPaid: true,
        deleted: false // Adicionado para não mostrar tarefas deletadas
      };

      if (options?.employerId) {
        whereClause.employerId = options.employerId;
      }

      if (options?.startDate || options?.endDate) {
        whereClause.paymentDate = {};
        
        if (options.startDate) {
          whereClause.paymentDate[Op.gte] = options.startDate;
        }
        
        if (options.endDate) {
          whereClause.paymentDate[Op.lte] = options.endDate;
        }
      }

      const { rows, count } = await Task.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: ContactEmployer,
            as: 'employer',
            attributes: ['id', 'name', 'email'],
            required: false
          },
          {
            model: User,
            as: 'responsible',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'paymentRegisteredBy',
            attributes: ['id', 'name']
          }
        ],
        limit: options?.limit,
        offset: options?.offset,
        order: [['paymentDate', 'DESC']]
      });

      return {
        charges: rows,
        count
      };
    } catch (error) {
      logger.error('Erro ao buscar cobranças pagas', {
        error: error.message,
        companyId,
        options
      });
      throw error;
    }
  }

  public static async getFinancialReport(
    companyId: number,
    options?: {
      startDate?: Date | string;
      endDate?: Date | string;
      employerId?: number;
    }
  ): Promise<any> {
    try {
      // Validar companyId
      if (!companyId) {
        throw new Error('ID da empresa é obrigatório');
      }
  
      // Normalizar datas de entrada
      const startDate = options?.startDate ? new Date(options.startDate) : new Date(new Date().getFullYear(), 0, 1);
      const endDate = options?.endDate ? new Date(options.endDate) : new Date();
  
      // Verificar se as datas são válidas
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Datas inválidas fornecidas');
      }
  
      const whereClause: any = {
        companyId,
        hasCharge: true,
        deleted: false
      };
  
      // Adicionar filtro de empresa se fornecido
      if (options?.employerId) {
        whereClause.employerId = options.employerId;
      }
  
      // Busca segura com tratamento de erros para cada consulta
      let totalCharges = 0, pendingCharges = 0, paidCharges = 0;
      let totalValue = 0, pendingValue = 0, paidValue = 0, paidInPeriodValue = 0;
      let chargesByEmployer = [], chargesByMonth = [], paymentsByMonth = [];
  
      try {
        // Total de cobranças
        totalCharges = (await Task.count({
          where: whereClause
        })) || 0;
      } catch (countError) {
        logger.error('Erro ao contar cobranças totais:', countError);
      }
  
      try {
        // Total de cobranças pendentes
        pendingCharges = (await Task.count({
          where: {
            ...whereClause,
            isPaid: false
          }
        })) || 0;
      } catch (countError) {
        logger.error('Erro ao contar cobranças pendentes:', countError);
      }
  
      try {
        // Total de cobranças pagas
        paidCharges = (await Task.count({
          where: {
            ...whereClause,
            isPaid: true
          }
        })) || 0;
      } catch (countError) {
        logger.error('Erro ao contar cobranças pagas:', countError);
      }
  
      try {
        // Valor total de cobranças
        const totalValueResult = await Task.sum('chargeValue', {
          where: whereClause
        });
        totalValue = totalValueResult || 0;
      } catch (sumError) {
        logger.error('Erro ao somar valores de cobranças:', sumError);
      }
  
      try {
        // Valor total pendente
        const pendingValueResult = await Task.sum('chargeValue', {
          where: {
            ...whereClause,
            isPaid: false
          }
        });
        pendingValue = pendingValueResult || 0;
      } catch (sumError) {
        logger.error('Erro ao somar valores de cobranças pendentes:', sumError);
      }
  
      try {
        // Valor total recebido
        const paidValueResult = await Task.sum('chargeValue', {
          where: {
            ...whereClause,
            isPaid: true
          }
        });
        paidValue = paidValueResult || 0;
      } catch (sumError) {
        logger.error('Erro ao somar valores de cobranças pagas:', sumError);
      }
  
      try {
        // Valor recebido no período
        const paidInPeriodValueResult = await Task.sum('chargeValue', {
          where: {
            ...whereClause,
            isPaid: true,
            paymentDate: {
              [Op.between]: [startDate, endDate]
            }
          }
        });
        paidInPeriodValue = paidInPeriodValueResult || 0;
      } catch (sumError) {
        logger.error('Erro ao somar valores pagos no período:', sumError);
      }
  
      try {
        // Cobranças por empresa cliente (top 5) - com tratamento mais robusto
        const chargesByEmployerResult = await Task.findAll({
          attributes: [
            'employerId',
            [Sequelize.fn('SUM', Sequelize.col('chargeValue')), 'total'],
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
          ],
          where: {
            ...whereClause,
            employerId: { [Op.ne]: null }
          },
          include: [{
            model: ContactEmployer,
            as: 'employer',
            attributes: ['name'],
            required: false // Alterar para false para evitar exclusão de registros sem employer
          }],
          group: ['employerId', 'employer.id', 'employer.name'],
          order: [[Sequelize.literal('total'), 'DESC']],
          limit: 5
        });
  
        // Processar resultados de forma segura
        chargesByEmployer = chargesByEmployerResult.map(item => {
          let totalValue;
          try {
            totalValue = parseFloat(item.get('total') as string) || 0;
          } catch (e) {
            totalValue = 0;
          }
          
          let count;
          try {
            count = parseInt(item.get('count') as string) || 0;
          } catch (e) {
            count = 0;
          }
          
          return {
            employerId: item.employerId,
            employerName: item.employer?.name || 'Empresa não informada',
            totalValue: totalValue,
            count: count
          };
        });
      } catch (employerError) {
        logger.error('Erro ao buscar cobranças por empresa:', employerError);
      }
  
      try {
        // Cobranças mensais do período com tratamento de erros e formatação segura
        const chargesByMonthResult = await Task.findAll({
          attributes: [
            [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('createdAt')), 'month'],
            [Sequelize.fn('SUM', Sequelize.col('chargeValue')), 'total'],
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
          ],
          where: {
            ...whereClause,
            createdAt: {
              [Op.between]: [startDate, endDate]
            }
          },
          group: [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('createdAt'))],
          order: [[Sequelize.literal('month'), 'ASC']]
        });
  
        // Processar resultados de forma segura
        chargesByMonth = chargesByMonthResult.map(item => {
          const monthDate = item.get('month');
          const formattedMonth = monthDate instanceof Date 
            ? monthDate.toISOString().substring(0, 10) 
            : (typeof monthDate === 'string' ? monthDate.substring(0, 10) : new Date().toISOString().substring(0, 10));
          
          let totalValue;
          try {
            totalValue = parseFloat(item.get('total') as string) || 0;
          } catch (e) {
            totalValue = 0;
          }
          
          let count;
          try {
            count = parseInt(item.get('count') as string) || 0;
          } catch (e) {
            count = 0;
          }
            
          return {
            month: formattedMonth,
            totalValue: totalValue,
            count: count
          };
        });
      } catch (monthError) {
        logger.error('Erro ao buscar cobranças por mês:', monthError);
      }
  
      try {
        // Pagamentos mensais do período com tratamento de erros e formatação segura
        const paymentsByMonthResult = await Task.findAll({
          attributes: [
            [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('paymentDate')), 'month'],
            [Sequelize.fn('SUM', Sequelize.col('chargeValue')), 'total'],
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
          ],
          where: {
            ...whereClause,
            isPaid: true,
            paymentDate: {
              [Op.between]: [startDate, endDate]
            }
          },
          group: [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('paymentDate'))],
          order: [[Sequelize.literal('month'), 'ASC']]
        });
  
        // Processar resultados de forma segura
        paymentsByMonth = paymentsByMonthResult.map(item => {
          const monthDate = item.get('month');
          const formattedMonth = monthDate instanceof Date 
            ? monthDate.toISOString().substring(0, 10) 
            : (typeof monthDate === 'string' ? monthDate.substring(0, 10) : new Date().toISOString().substring(0, 10));
          
          let totalValue;
          try {
            totalValue = parseFloat(item.get('total') as string) || 0;
          } catch (e) {
            totalValue = 0;
          }
          
          let count;
          try {
            count = parseInt(item.get('count') as string) || 0;
          } catch (e) {
            count = 0;
          }
            
          return {
            month: formattedMonth,
            totalValue: totalValue,
            count: count
          };
        });
      } catch (paymentError) {
        logger.error('Erro ao buscar pagamentos por mês:', paymentError);
      }
  
      // Registrar na timeline a geração do relatório
      try {
        await TaskTimeline.create({
          action: 'financial_report_generated',
          details: {
            startDate,
            endDate,
            employerId: options?.employerId || null,
            summary: {
              totalCharges,
              pendingCharges,
              paidCharges,
              totalValue,
              pendingValue,
              paidValue
            },
            generatedAt: new Date()
          }
        });
      } catch (timelineError) {
        logger.warn('Erro ao registrar geração de relatório na timeline:', timelineError);
      }
  
      logger.info('Relatório financeiro gerado com sucesso', {
        companyId,
        startDate,
        endDate,
        totalCharges,
        pendingCharges,
        paidCharges
      });
  
      return {
        summary: {
          totalCharges: totalCharges || 0,
          pendingCharges: pendingCharges || 0,
          paidCharges: paidCharges || 0,
          totalValue: totalValue || 0,
          pendingValue: pendingValue || 0,
          paidValue: paidValue || 0,
          paidInPeriodValue: paidInPeriodValue || 0,
          currency: 'BRL'
        },
        period: {
          startDate,
          endDate
        },
        byEmployer: chargesByEmployer,
        byMonth: {
          charges: chargesByMonth,
          payments: paymentsByMonth
        }
      };
    } catch (error) {
      logger.error('Erro ao gerar relatório financeiro', {
        error: error.message,
        stack: error.stack,
        companyId,
        options
      });
      
      // Retornar estrutura vazia mas compatível com os gráficos
      return {
        summary: {
          totalValue: 0,
          pendingValue: 0,
          paidValue: 0,
          totalCharges: 0,
          pendingCharges: 0,
          paidCharges: 0,
          paidInPeriodValue: 0,
          currency: 'BRL'
        },
        period: {
          startDate: options?.startDate ? new Date(options.startDate) : new Date(),
          endDate: options?.endDate ? new Date(options.endDate) : new Date()
        },
        byEmployer: [],
        byMonth: {
          charges: [],
          payments: []
        }
      };
    }
  }

// Função para obter estatísticas de cobrança por empresa
public static async getChargeStatsByEmployer(
employerId: number,
companyId: number
): Promise<any> {
try {
if (!employerId || !companyId) {
  throw new Error('ID da empresa e ID da empresa do sistema são obrigatórios');
}

// Verificar se a empresa existe e pertence à empresa do sistema
const employer = await ContactEmployer.findOne({
  where: {
    id: employerId,
    companyId
  }
});

if (!employer) {
  throw new Error('Empresa não encontrada');
}

const whereClause = {
  employerId,
  companyId,
  hasCharge: true,
  deleted: false // Adicionado para não considerar tarefas deletadas
};

// Buscar estatísticas
const [totalCharges, pendingCharges, paidCharges, totalValue, pendingValue, paidValue] = await Promise.all([
  Task.count({ where: whereClause }),
  Task.count({ where: { ...whereClause, isPaid: false } }),
  Task.count({ where: { ...whereClause, isPaid: true } }),
  Task.sum('chargeValue', { where: whereClause }) || 0,
  Task.sum('chargeValue', { where: { ...whereClause, isPaid: false } }) || 0,
  Task.sum('chargeValue', { where: { ...whereClause, isPaid: true } }) || 0
]);

// Últimos pagamentos
const recentPayments = await Task.findAll({
  where: {
    ...whereClause,
    isPaid: true
  },
  attributes: ['id', 'title', 'chargeValue', 'paymentDate'],
  order: [['paymentDate', 'DESC']],
  limit: 5
});

// Cobranças pendentes
const pendingChargesList = await Task.findAll({
  where: {
    ...whereClause,
    isPaid: false
  },
  attributes: ['id', 'title', 'chargeValue', 'dueDate', 'createdAt'],
  order: [
    ['dueDate', 'ASC'],
    ['createdAt', 'DESC']
  ],
  limit: 5
});

// Registrar consulta na timeline
await TaskTimeline.create({
  action: 'charge_stats_accessed',
  details: {
    employerId,
    employerName: employer.name,
    summary: {
      totalCharges,
      pendingCharges,
      paidCharges,
      totalValue,
      pendingValue,
      paidValue
    },
    accessedAt: new Date()
  }
});

return {
  employerInfo: {
    id: employer.id,
    name: employer.name
  },
  stats: {
    totalCharges,
    pendingCharges,
    paidCharges,
    totalValue,
    pendingValue,
    paidValue,
    averageValue: totalCharges > 0 ? totalValue / totalCharges : 0,
    currency: 'BRL'
  },
  recentPayments: recentPayments.map(payment => ({
    id: payment.id,
    title: payment.title,
    value: payment.chargeValue,
    paymentDate: payment.paymentDate
  })),
  pendingCharges: pendingChargesList.map(charge => ({
    id: charge.id,
    title: charge.title,
    value: charge.chargeValue,
    dueDate: charge.dueDate,
    createdAt: charge.createdAt
  }))
};
} catch (error) {
logger.error('Erro ao buscar estatísticas de cobrança por empresa', {
  error: error.message,
  employerId,
  companyId
});
throw error;
}
}
}

export default TaskChargeService;