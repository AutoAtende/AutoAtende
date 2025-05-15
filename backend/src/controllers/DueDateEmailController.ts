import { Request, Response } from 'express';
import { Readable } from 'stream';
import moment from 'moment';
import Company from '../models/Company';
import Invoices from '../models/Invoices';
import EmailService from '../services/EmailService';
import Email from '../models/Email';
import { Op } from 'sequelize';
import { logger } from '../utils/logger';
import AppError from '../errors/AppError';

class DueDateEmailController {
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private createSSEResponse(res: Response): void {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
  }

  private sendSSEMessage(res: Response, data: any): void {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  public async sendDueDateEmails(req: Request, res: Response): Promise<void> {
    try {
      this.createSSEResponse(res);

      const companies = await Company.findAll({
        where: { status: true },
        include: ['plan']
      });

      let processedCount = 0;
      let successCount = 0;
      let errorCount = 0;
      const totalCompanies = companies.length;

      for (const company of companies) {
        try {
          const hasSmtp = await EmailService.checkSmtpConfig(company.id);
          if (!hasSmtp) {
            logger.warn(`Skipping company ${company.id} - SMTP not configured`);
            errorCount++;
            continue;
          }

          const { dueDate, plan } = company;
          const hoje = moment().format("YYYY-MM-DD");
          const vencimento = moment(dueDate).format("YYYY-MM-DD");
          const dias = moment(vencimento).diff(moment(hoje), 'days');

          if (dias < 20) {
            const startOfMonth = moment(vencimento).startOf('month').valueOf();
            const endOfMonth = moment(vencimento).endOf('month').valueOf();
            
            const existingInvoice = await Invoices.findOne({
              where: {
                companyId: company.id,
                dueDate: {
                  [Op.between]: [startOfMonth, endOfMonth]
                }
              }
            });

            if (existingInvoice && dias <= 5) {
              await this.sendDueDateEmail(
                company,
                vencimento,
                plan.name,
                plan.value
              );
              successCount++;
            }
          }

          processedCount++;
          this.sendSSEMessage(res, {
            progress: (processedCount / totalCompanies) * 100,
            message: `Processando empresa ${processedCount} de ${totalCompanies}`,
            success: successCount,
            errors: errorCount
          });

          await this.sleep(500);

        } catch (error) {
          logger.error(`Erro ao processar empresa ${company.id}:`, {
            error: error.message,
            stack: error.stack
          });
          errorCount++;
          continue;
        }
      }

      this.sendSSEMessage(res, {
        progress: 100,
        message: `Processamento concluído. ${successCount} emails enviados, ${errorCount} falhas.`,
        success: successCount,
        errors: errorCount,
        completed: true
      });

      res.end();

    } catch (error) {
      logger.error('Erro ao enviar emails de vencimento:', {
        error: error.message,
        stack: error.stack
      });
      this.sendSSEMessage(res, {
        error: 'Erro ao processar emails de vencimento',
        completed: true
      });
      res.end();
    }
  }

  private async sendDueDateEmail(company: Company, dueDate: string, planName: string, planValue: number): Promise<void> {
    const message = this.generateDueDateMessage(company.name, dueDate, planName, planValue);
    
    const email = await Email.create({
      sender: company.email,
      subject: `Lembrete de Vencimento - ${company.name}`,
      message,
      companyId: company.id,
      status: 'PENDING',
      hasAttachments: false
    });
  
    try {
      await EmailService.sendMail(
        company.id,
        company.email,
        `Lembrete de Vencimento - ${company.name}`,
        message
      );

      await email.update({ status: 'SENT', sentAt: new Date() });
    } catch (error) {
      await email.update({ 
        status: 'ERROR',
        error: error.message
      });
      throw error;
    }
  }

  private generateDueDateMessage(companyName: string, dueDate: string, planName: string, planValue: number): string {
    return `
    Prezado cliente ${companyName},

    Este é um lembrete importante sobre sua fatura:

    Plano: ${planName}
    Valor: R$ ${planValue.toFixed(2)}
    Data de Vencimento: ${moment(dueDate).format('DD/MM/YYYY')}

    Para evitar qualquer interrupção em seus serviços, por favor, efetue o pagamento até a data de vencimento.

    Se você já realizou o pagamento, por favor, desconsidere este aviso.

    Em caso de dúvidas, entre em contato com nosso suporte.

    Atenciosamente,
    Equipe de Suporte
    `;
  }
}

export default new DueDateEmailController();