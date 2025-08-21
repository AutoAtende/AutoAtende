import * as Yup from "yup";
import Sequelize from "../database";
import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import Invoices from "../models/Invoices";
import InvoiceLogs from "../models/InvoiceLogs";
import Company from "../models/Company";
import Contact from "../models/Contact";
import Whatsapp from "../models/Whatsapp";
import moment from "moment";
import EmailService from "../services/EmailService";
import { logger } from "../utils/logger";

import CreatePlanService from "../services/PlanService/CreatePlanService";
import UpdatePlanService from "../services/PlanService/UpdatePlanService";
import ShowPlanService from "../services/PlanService/ShowPlanService";
import DeletePlanService from "../services/PlanService/DeletePlanService";

import FindAllInvoiceService from "../services/InvoicesService/FindAllInvoiceService";
import ListInvoicesServices from "../services/InvoicesService/ListInvoicesServices";
import ShowInvoiceService from "../services/InvoicesService/ShowInvoiceService";
import UpdateInvoiceService from "../services/InvoicesService/UpdateInvoiceService";

type StorePlanData = {
  name: string;
  id?: number | string;
  users: number | 0;
  connections: number | 0;
  queues: number | 0;
  value: number;
};

type UpdateInvoiceData = {
  status: string;
  id?: string;
};

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  companyId?: string | number;
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId, profile, isSuper } = req.user;
    const { status } = req.query;

    let whereCondition: any = {};

    // Company filter
    if (isSuper) {
      if (companyId) {
        whereCondition.companyId = companyId;
      }
    } else {
      whereCondition.companyId = companyId;
    }

    // Status filter
    if (status && status !== 'all') {
      whereCondition.status = status;
    }

    const invoices = await Invoices.findAll({
      where: whereCondition,
      include: [
        {
          model: Company,
          attributes: ['name', 'email', 'phone']
        }
      ],
      order: [['dueDate', 'ASC']]
    });

    // Tipando corretamente o objeto da fatura
    interface InvoiceAttributes {
      id: number;
      detail: string;
      status: string;
      value: number;
      dueDate: Date | null;
      createdAt: Date;
      updatedAt: Date;
      companyId: number;
      company?: {
        name: string;
        email: string;
        phone: string;
      };
    }

    const formattedInvoices = invoices.map(invoice => {
      const plainInvoice = invoice.get({ plain: true }) as InvoiceAttributes;
      
      return {
        ...plainInvoice,
        dueDate: plainInvoice.dueDate 
          ? moment(plainInvoice.dueDate).format('DD-MM-YYYY') 
          : null,
        createdAt: plainInvoice.createdAt 
          ? moment(plainInvoice.createdAt).format('DD-MM-YYYY HH:mm:ss') 
          : null,
        updatedAt: plainInvoice.updatedAt 
          ? moment(plainInvoice.updatedAt).format('DD-MM-YYYY HH:mm:ss') 
          : null
      };
    });

    return res.status(200).json(formattedInvoices);
  } catch (err) {
    logger.error(err);
    throw new AppError("Error fetching invoices");
  }
};

export const listCompanies = async (req: Request, res: Response): Promise<Response> => {
  const { profile, isSuper } = req.user;

  if (!isSuper) {
    throw new AppError("Unauthorized", 403);
  }

  const companies = await Company.findAll({
    attributes: ['id', 'name'],
    where: { status: true },
    order: [['name', 'ASC']]
  });

  return res.json(companies);
};

export const updateDueDate = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { dueDate } = req.body;
    const { id: userId, profile, isSuper } = req.user;

    if (!isSuper) {
      throw new AppError("Unauthorized: Super access required", 403);
    }

    const schema = Yup.object().shape({
      dueDate: Yup.date().required()
    });

    await schema.validate({ dueDate });

    const invoice = await Invoices.findByPk(id);
    if (!invoice) {
      throw new AppError("Invoice not found", 404);
    }

    interface InvoiceAttributes {
      id: number;
      detail: string;
      status: string;
      value: number;
      dueDate: Date | null;
      createdAt: Date;
      updatedAt: Date;
      companyId: number;
    }

    const oldDueDate = invoice.dueDate;
    const formattedDueDate = moment(dueDate).format('DD-MM-YYYY');
    
    await invoice.update({
      dueDate: new Date(dueDate),
      updatedAt: new Date()
    });

    await InvoiceLogs.create({
      invoiceId: parseInt(id),
      userId: parseInt(userId.toString()),
      type: 'DUE_DATE_UPDATE',
      oldValue: oldDueDate ? moment(oldDueDate).format('DD-MM-YYYY') : null,
      newValue: formattedDueDate,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const updatedInvoice = await invoice.reload();
    const plainInvoice = updatedInvoice.get({ plain: true }) as InvoiceAttributes;
    
    const formattedInvoice = {
      ...plainInvoice,
      dueDate: formattedDueDate,
      createdAt: moment(plainInvoice.createdAt).format('DD-MM-YYYY HH:mm:ss'),
      updatedAt: moment(plainInvoice.updatedAt).format('DD-MM-YYYY HH:mm:ss')
    };

    const io = getIO();
    io.emit(`company-${invoice.companyId}-invoice`, {
      action: "update",
      invoice: formattedInvoice
    });

    return res.json(formattedInvoice);
  } catch (err) {
    logger.error(err);
    throw new AppError(err.message);
  }
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { invoices, count, hasMore } = await ListInvoicesServices({
    searchParam,
    pageNumber
  });

  return res.json({ invoices, count, hasMore });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { Invoiceid } = req.params;

  const invoice = await ShowInvoiceService(Invoiceid);

  return res.status(200).json(invoice);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const InvoiceData: UpdateInvoiceData = req.body;

  const schema = Yup.object().shape({
    status: Yup.string().required()
  });

  try {
    await schema.validate(InvoiceData);
  } catch (err) {
    throw new AppError(err.message);
  }

  const { id, status } = InvoiceData;

  const invoice = await UpdateInvoiceService({
    id,
    status,
  });

  return res.status(200).json(invoice);
};

export const sendWhatsApp = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    // Verificar se a fatura existe
    const invoice = await Invoices.findOne({
      where: { id },
      include: [
        {
          model: Company,
          attributes: ['name', 'email', 'phone']
        }
      ]
    });

    if (!invoice) {
      throw new AppError("Invoice not found", 404);
    }

    // Verificar permissão (apenas usuários da mesma empresa ou super admin)
    if (invoice.companyId !== companyId && !req.user.isSuper) {
      throw new AppError("Unauthorized", 403);
    }

    // Montar mensagem
    const messageBody = `*Fatura #${invoice.id}*\n\n` +
      `Valor: ${invoice.value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}\n` +
      `Vencimento: ${moment(invoice.dueDate).format('DD/MM/YYYY')}\n` +
      `Status: ${invoice.status === 'paid' ? 'Pago' : 'Em Aberto'}\n\n` +
      `${invoice.detail || ''}`;

    // Encontrar conexão WhatsApp padrão da empresa
    const defaultWhatsapp = await Whatsapp.findOne({
      where: { companyId: invoice.companyId, isDefault: true }
    });

    if (!defaultWhatsapp) {
      throw new AppError("No default WhatsApp connection found", 400);
    }

    // Adicionar à fila de mensagens
    await req.app.get("queues").messageQueue.add(
      "SendMessage",
      {
        whatsappId: defaultWhatsapp.id,
        data: {
          number: invoice.company.phone,
          body: messageBody
        }
      },
      { removeOnComplete: true, attempts: 3 }
    );

    return res.status(200).json({ message: "WhatsApp message sent" });
  } catch (err) {
    logger.error(`Error sending invoice WhatsApp: ${err}`);
    throw new AppError(err.message || "Error sending WhatsApp message", 500);
  }
};

export const sendEmail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    // Verificar se a fatura existe
    const invoice = await Invoices.findOne({
      where: { id },
      include: [
        {
          model: Company,
          attributes: ['name', 'email', 'phone']
        }
      ]
    });

    if (!invoice) {
      throw new AppError("Invoice not found", 404);
    }

    // Verificar permissão (apenas usuários da mesma empresa ou super admin)
    if (invoice.companyId !== companyId && !req.user.isSuper) {
      throw new AppError("Unauthorized", 403);
    }

    if (!invoice.company?.email) {
      throw new AppError("Company has no email address", 400);
    }

    // Montar corpo do email
    const emailBody = `
      <h2>Fatura #${invoice.id}</h2>
      <p>Valor: ${invoice.value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</p>
      <p>Vencimento: ${moment(invoice.dueDate).format('DD/MM/YYYY')}</p>
      <p>Status: ${invoice.status === 'paid' ? 'Pago' : 'Em Aberto'}</p>
      <p>${invoice.detail || ''}</p>
    `;

    // Enviar email
    await EmailService.sendMail(
      invoice.companyId,
      invoice.company.email,
      `Fatura #${invoice.id}`,
      emailBody,
      moment().add(1, 'hour').toDate()
    );

    return res.status(200).json({ message: "Email sent" });
  } catch (err) {
    logger.error(`Error sending invoice email: ${err}`);
    throw new AppError(err.message || "Error sending email", 500);
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { id: userId, companyId, isSuper } = req.user;

    if (!isSuper) {
      throw new AppError("Unauthorized", 403);
    }

    const invoice = await Invoices.findByPk(id);
    if (!invoice) {
      throw new AppError("Invoice not found", 404);
    }

    await invoice.destroy();

    const io = getIO();
    io.emit(`company-${invoice.companyId}-invoice`, {
      action: "delete",
      invoiceId: id
    });

    return res.status(200).json({ message: "Invoice deleted" });
  } catch (err) {
    logger.error(`Error deleting invoice: ${err}`);
    throw new AppError(err.message || "Error deleting invoice", 500);
  }
};

export const bulkRemove = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { ids } = req.body;
    const { id: userId, isSuper } = req.user;

    // Verificar permissão
    if (!isSuper) {
      throw new AppError("Unauthorized: Super access required", 403);
    }

    // Validar entrada
    const schema = Yup.object().shape({
      ids: Yup.array().of(Yup.number().required()).min(1).required()
    });

    try {
      await schema.validate({ ids });
    } catch (validationError) {
      throw new AppError(validationError.message, 400);
    }

    // Buscar as faturas que serão excluídas
    const invoices = await Invoices.findAll({
      where: { id: ids },
      attributes: ['id', 'companyId']
    });

    // Verificar se todas as faturas existem
    if (invoices.length !== ids.length) {
      const foundIds = invoices.map(invoice => invoice.id);
      const missingIds = ids.filter((id) => !foundIds.includes(Number(id)));
      
      if (missingIds.length > 0) {
        throw new AppError(`Invoices not found: ${missingIds.join(', ')}`, 404);
      }
    }

    // Executar exclusão em transação
    await Sequelize.transaction(async transaction => {
      // Registrar logs de exclusão
      const logEntries = await Promise.all(invoices.map(async (invoice) => {
        // Buscar detalhes completos da fatura para o log
        const invoiceDetails = await Invoices.findByPk(invoice.id, { transaction });
        
        return {
          invoiceId: invoice.id,
          userId,
          type: 'INVOICE_DELETE',
          oldValue: JSON.stringify(invoiceDetails?.get({ plain: true }) || {}),
          newValue: null
        };
      }));

      // Excluir faturas
      await Invoices.destroy({
        where: { id: ids },
        transaction
      });
    });

    // Emitir eventos de exclusão via socket
    const io = getIO();
    invoices.forEach(invoice => {
      io.emit(`company-${invoice.companyId}-invoice`, {
        action: "delete",
        invoiceId: invoice.id
      });
    });

    return res.status(200).json({ 
      message: `${invoices.length} invoices deleted successfully`,
      count: invoices.length
    });
  } catch (err) {
    logger.error(`Bulk delete error: ${err.message}`);
    throw new AppError(err.message || "Error deleting invoices", err.statusCode || 500);
  }
};