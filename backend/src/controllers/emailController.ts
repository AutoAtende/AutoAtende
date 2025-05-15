import * as Yup from "yup";
import { Request, Response } from "express";
import EmailService from '../services/EmailService';
import Email from '../models/Email';
import Company from "../models/Company";
import moment from 'moment';
import cron from 'node-cron';
import { Op } from 'sequelize';
import AppError from '../errors/AppError';
import { logger } from "../utils/logger";
import nodemailer from 'nodemailer';

// Schemas de validação
const emailSchema = Yup.object().shape({
  email: Yup.string().email().required(),
  assunto: Yup.string().required(),
  mensagem: Yup.string().required(),
});

const rescheduleSchema = Yup.object().shape({
  sendAt: Yup.date().required().min(new Date(), 'A data de envio deve estar no futuro')
});

const exportSchema = Yup.object().shape({
  startDate: Yup.date(),
  endDate: Yup.date(),
  format: Yup.string().oneOf(['json', 'csv', 'pdf']).default('json')
});

/**
 * Envia um email imediatamente
 */
export const send = async (req: Request, res: Response): Promise<Response> => {
  try {
    logger.info('Attempting to send email', { 
      body: req.body,
      companyId: req.user.companyId 
    });

    // Validate request body
    try {
      await emailSchema.validate(req.body);
    } catch (validationError) {
      logger.warn('Email validation failed:', validationError);
      return res.status(400).json({ error: validationError.message });
    }

    const companyId = req.user.companyId;
    const { email, assunto: subject, mensagem: message } = req.body;

    // Verificar se empresa tem SMTP configurado
    const hasSmtpConfig = await EmailService.checkSmtpConfig(companyId);
    if (!hasSmtpConfig) {
      throw new AppError('SMTP not configured for company', 400);
    }

    const result = await EmailService.sendMail(
      companyId,
      email,
      subject,
      message
    );

    logger.info(`Email sent successfully to ${email}`);
    return res.status(200).json({ 
      message: 'Email sent successfully',
      emailId: result.emailId
    });
  } catch (error) {
    logger.error('Error in send email:', {
      error: error instanceof AppError ? error.message : error,
      stack: error.stack,
      body: req.body
    });
    
    return res.status(error instanceof AppError ? error.statusCode : 500)
      .json({ error: error instanceof AppError ? error.message : 'Failed to send email' });
  }
};

/**
 * Lista emails enviados
 */
export const list = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { page = 1, limit = 20, searchTerm, status } = req.query;
    
    const options = {
      page: Number(page),
      limit: Number(limit),
      searchTerm: searchTerm as string,
      status: status as string
    };

    const result = await EmailService.findEmails(req.user.companyId, {
      ...options,
      scheduled: false
    });

    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error listing emails: ${error}`);
    return res.status(500).json({ error: 'Failed to list emails' });
  }
};

/**
 * Lista emails agendados
 */
export const listScheduled = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { page = 1, limit = 20, searchTerm, status } = req.query;
    
    const options = {
      page: Number(page),
      limit: Number(limit),
      searchTerm: searchTerm as string,
      status: status as string
    };

    const result = await EmailService.findEmails(req.user.companyId, {
      ...options,
      scheduled: true
    });

    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error listing scheduled emails: ${error}`);
    return res.status(500).json({ error: 'Failed to list scheduled emails' });
  }
};

/**
 * Agenda um email para envio futuro
 */
export const scheduleAdd = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyId = req.user.companyId;
    const { email, assunto: subject, mensagem: message, sendAt } = req.body;

    // Validar dados
    try {
      await emailSchema.validate({ email, assunto: subject, mensagem: message });
    } catch (validationError) {
      logger.warn('Email validation failed:', validationError);
      return res.status(400).json({ error: validationError.message });
    }

    // Verificar SMTP configurado
    const hasSmtpConfig = await EmailService.checkSmtpConfig(companyId);
    if (!hasSmtpConfig) {
      throw new AppError('SMTP not configured for company', 400);
    }

    const sendAtDate = new Date(sendAt);
    if (sendAtDate <= new Date()) {
      return res.status(400).json({ error: 'Send date must be in the future' });
    }

    const result = await EmailService.sendMail(
      companyId,
      email,
      subject,
      message,
      sendAtDate
    );

    logger.info(`Email scheduled successfully for ${email} at ${sendAt}`);
    return res.status(201).json({ 
      message: 'Email scheduled successfully',
      emailId: result.emailId
    });
  } catch (error) {
    logger.error(`Error scheduling email: ${error}`);
    return res.status(500).json({ error: 'Failed to schedule email' });
  }
};

/**
 * Inicia o processo de reset de senha
 */
export const forgotRequest = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body;
    
    if (!email) {
      logger.warn('Tentativa de reset de senha sem email');
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    // Normalizar email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Verificar SMTP configurado
    const hasSmtpConfig = await EmailService.checkSmtpConfig(1);
    if (!hasSmtpConfig) {
      logger.error(`SMTP não configurado para empresa 1`);
      return res.status(400).json({ error: 'Configuração de email não disponível' });
    }

    const result = await EmailService.requestPasswordReset(normalizedEmail);

    logger.info(`Reset de senha solicitado com sucesso para ${normalizedEmail}`);
    return res.status(200).json(result);
    
  } catch (error) {
    logger.error('Erro ao processar solicitação de reset de senha:', {
      error: error instanceof AppError ? error.message : error,
      stack: error.stack
    });
    
    return res.status(error instanceof AppError ? error.statusCode : 500)
      .json({ 
        error: 'Erro ao processar solicitação de reset de senha' 
      });
  }
};

/**
 * Finaliza o processo de reset de senha
 */
export const forgotReset = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, token, password } = req.body;
    
    const hasSmtpConfig = await EmailService.checkSmtpConfig(1);
    if (!hasSmtpConfig) {
      throw new AppError('SMTP not configured for company', 400);
    }

    const result = await EmailService.resetPassword(email, token, password);

    logger.info(`Password reset successful for ${email}`);
    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error in password reset: ${error instanceof AppError ? error.message : error}`);
    return res.status(error instanceof AppError ? error.statusCode : 500)
      .json({ error: error instanceof AppError ? error.message : 'Failed to reset password' });
  }
};

/**
 * Cancela um email agendado
 */
export const cancelScheduledEmail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const emailId = Number(req.params.id);
    const companyId = req.user.companyId;
    
    logger.info(`Cancelando email agendado ID ${emailId} da empresa ${companyId}`);
    
    const result = await EmailService.cancelScheduledEmail(emailId, companyId);
    
    return res.status(200).json({ 
      success: true,
      message: 'Email cancelado com sucesso' 
    });
  } catch (error) {
    logger.error(`Erro ao cancelar email: ${error instanceof AppError ? error.message : error}`, {
      stack: error.stack,
      companyId: req.user.companyId,
      emailId: req.params.id
    });
    
    return res.status(error instanceof AppError ? error.statusCode : 500)
      .json({ error: error instanceof AppError ? error.message : 'Erro ao cancelar email agendado' });
  }
};

/**
 * Reagenda um email
 */
export const rescheduleEmail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const emailId = Number(req.params.id);
    const companyId = req.user.companyId;
    const { sendAt } = req.body;
    
    // Validar dados
    try {
      await rescheduleSchema.validate({ sendAt });
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }
    
    logger.info(`Reagendando email ID ${emailId} da empresa ${companyId} para ${sendAt}`);
    
    const result = await EmailService.rescheduleMail(emailId, companyId, new Date(sendAt));
    
    return res.status(200).json({ 
      success: true,
      message: 'Email reagendado com sucesso' 
    });
  } catch (error) {
    logger.error(`Erro ao reagendar email: ${error instanceof AppError ? error.message : error}`, {
      stack: error.stack,
      companyId: req.user.companyId,
      emailId: req.params.id
    });
    
    return res.status(error instanceof AppError ? error.statusCode : 500)
      .json({ error: error instanceof AppError ? error.message : 'Erro ao reagendar email' });
  }
};

/**
 * Exporta emails
 */
export const exportEmails = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyId = req.user.companyId;
    const { startDate, endDate, format = 'json', status, scheduled } = req.query;
    
    // Validar parâmetros
    try {
      await exportSchema.validate({ startDate, endDate, format });
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }
    
    logger.info(`Exportando emails da empresa ${companyId} no formato ${format}`);
    
    const filters = {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      status: status as string,
      scheduled: scheduled ? scheduled === 'true' : undefined
    };
    
    const result = await EmailService.exportEmails(companyId, format as string, filters);
    
    // Se for CSV, enviar como arquivo para download
    if (format === 'csv' && result.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=emails.csv');
      return res.send(result.data);
    }
    
    // Para outros formatos, retornar JSON
    return res.json(result);
  } catch (error) {
    logger.error(`Erro ao exportar emails: ${error instanceof AppError ? error.message : error}`, {
      stack: error.stack,
      companyId: req.user.companyId
    });
    
    return res.status(error instanceof AppError ? error.statusCode : 500)
      .json({ error: error instanceof AppError ? error.message : 'Erro ao exportar emails' });
  }
};

/**
 * Obtém estatísticas de email
 */
export const getEmailStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyId = req.user.companyId;
    const { startDate, endDate } = req.query;
    
    const options = {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined
    };
    
    const stats = await EmailService.getDetailedStats(companyId, options);
    
    logger.info(`Estatísticas de email recuperadas para empresa ${companyId}`);
    return res.json(stats);
  } catch (error) {
    logger.error(`Erro ao obter estatísticas de email: ${error instanceof AppError ? error.message : error}`, {
      stack: error.stack,
      companyId: req.user.companyId
    });
    
    return res.status(error instanceof AppError ? error.statusCode : 500)
      .json({ error: error instanceof AppError ? error.message : 'Erro ao obter estatísticas de email' });
  }
};

/**
 * Testa configuração SMTP
 */
export const testEmailConfig = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyId = req.user.companyId;
    logger.info(`Testing email configuration for company ${companyId}`);

    const config = await EmailService['getSmtpConfig'](companyId);
    const transporter = nodemailer.createTransport(config);
    
    logger.info('Attempting to verify SMTP connection...');
    await transporter.verify();
    logger.info('SMTP connection verified successfully');
    
    return res.json({
      success: true,
      config: {
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.auth.user
        }
      }
    });
  } catch (error) {
    logger.error('Failed to test email configuration:', {
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Reenvia um email que falhou
 */
export const resendEmail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const emailId = Number(req.params.id);
    const companyId = req.user.companyId;
    
    logger.info(`Reenviando email ID ${emailId} da empresa ${companyId}`);
    
    const result = await EmailService.resendEmail(emailId, companyId);
    
    return res.status(200).json({ 
      success: true,
      message: 'Email reenviado com sucesso' 
    });
  } catch (error) {
    logger.error(`Erro ao reenviar email: ${error instanceof AppError ? error.message : error}`, {
      stack: error.stack,
      companyId: req.user.companyId,
      emailId: req.params.id
    });
    
    return res.status(error instanceof AppError ? error.statusCode : 500)
      .json({ error: error instanceof AppError ? error.message : 'Erro ao reenviar email' });
  }
};

/**
 * Processa emails agendados
 * Este método será executado pelo cron
 */
const processScheduledEmails = async () => {
  logger.info('Starting scheduled emails processing');
  
  try {
    const companies = await Company.findAll({
      where: { status: true },
      attributes: ['id']
    });
 
    for (const company of companies) {
      try {
        // Verificar config SMTP antes de processar
        const hasSmtp = await EmailService.checkSmtpConfig(company.id);
        if (!hasSmtp) {
          logger.warn(`Skipping company ${company.id} - SMTP not configured`);
          continue;
        }

        const pendingEmails = await Email.findAll({
          where: {
            companyId: company.id,
            scheduled: true,
            status: 'PENDING',
            sendAt: {
              [Op.lte]: moment().toDate()
            }
          }
        });
 
        logger.info(`Found ${pendingEmails.length} pending emails for company ${company.id}`);
 
        for (const email of pendingEmails) {
          try {
            logger.info(`Processing scheduled email for company ${company.id}`, {
              emailId: email.id,
              sender: email.sender
            });
 
            await EmailService.processScheduledEmail(email);
            
          } catch (error) {
            logger.error(`Failed to process scheduled email for company ${company.id}:`, {
              emailId: email.id,
              error: error.message
            });
          }
        }
      } catch (companyError) {
        logger.error(`Error processing company ${company.id}:`, companyError);
        continue;
      }
    }
  } catch (error) {
    logger.error('Error processing scheduled emails:', error);
  }
};

// Agenda execução a cada 5 minutos
cron.schedule('*/5 * * * *', processScheduledEmails);