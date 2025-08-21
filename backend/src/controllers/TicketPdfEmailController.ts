import { Request, Response } from 'express';
import EmailService from '../services/EmailService';
import { logger } from '../utils/logger';
import AppError from '../errors/AppError';
import Company from '../models/Company';
import Email from '../models/Email';

class TicketPdfEmailController {
  public async sendTicketPdf(req: Request, res: Response): Promise<Response> {
    try {
      const companyId = req.user.companyId;
      const { ticketId } = req.params;
      const { email, subject, message } = req.body;
      const pdfFile = req.file;

      logger.info('Received request to send ticket PDF', {
        ticketId,
        email,
        hasFile: !!pdfFile
      });

      if (!email || !subject || !message) {
        logger.error('Missing required fields', { email, subject, hasMessage: !!message });
        throw new AppError('Email, subject and message are required', 400);
      }

      if (!pdfFile) {
        logger.error('No PDF file provided');
        throw new AppError('PDF file is required', 400);
      }

      const company = await Company.findByPk(companyId);
      if (!company) {
        logger.error(`Company not found: ${companyId}`);
        throw new AppError('Company not found', 404);
      }

      const hasSmtp = await EmailService.checkSmtpConfig(companyId);
      if (!hasSmtp) {
        throw new AppError('SMTP not configured for company', 400);
      }

      const emailRecord = await Email.create({
        sender: email,
        subject,
        message,
        companyId,
        status: 'PENDING',
        hasAttachments: true,
        metadata: JSON.stringify({ ticketId })
      });

      try {
        const result = await EmailService.sendTicketPdf(
          companyId,
          email,
          subject,
          message,
          pdfFile.buffer,
          ticketId
        );

        await emailRecord.update({ 
          status: 'SENT',
          sentAt: new Date()
        });

        logger.info('Ticket PDF sent successfully', {
          ticketId,
          email,
          companyId,
          emailId: emailRecord.id
        });

        return res.status(200).json({
          success: true,
          message: 'Ticket PDF sent successfully'
        });

      } catch (error) {
        await emailRecord.update({
          status: 'ERROR',
          error: error.message
        });
        throw error;
      }

    } catch (error) {
      logger.error('Error sending ticket PDF:', {
        error: error instanceof AppError ? error.message : error,
        stack: error.stack
      });

      return res.status(error instanceof AppError ? error.statusCode : 500)
        .json({
          success: false,
          error: error instanceof AppError ? error.message : 'Failed to send ticket PDF'
        });
    }
  }
}

export default new TicketPdfEmailController();