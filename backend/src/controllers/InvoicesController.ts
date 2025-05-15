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
    const { companyId: userCompanyId, profile, isSuper } = req.user;
    const { companyId, status } = req.query;

    let whereCondition: any = {};

    // Company filter
    if (isSuper) {
      if (companyId) {
        whereCondition.companyId = companyId;
      }
    } else {
      whereCondition.companyId = userCompanyId;
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
      dueDate: formattedDueDate,
      updatedAt: moment().format('DD-MM-YYYY HH:mm:ss')
    });

    await InvoiceLogs.create({
      invoiceId: id,
      userId,
      type: 'DUE_DATE_UPDATE',
      oldValue: oldDueDate ? moment(oldDueDate).format('DD-MM-YYYY') : null,
      newValue: formattedDueDate
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
    name: Yup.string()
  });

  try {
    await schema.validate(InvoiceData);
  } catch (err) {
    throw new AppError(err.message);
  }

  const { id, status } = InvoiceData;

  const plan = await UpdateInvoiceService({
    id,
    status,
  });

  return res.status(200).json(plan);
};

export const sendWhatsApp = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const invoice = await Invoices.findOne({
    where: { id, companyId },
    include: [
      {
        model: Contact,
        as: 'contact',
        attributes: ['number']
      }
    ]
  });

  if (!invoice) {
    throw new AppError("Invoice not found", 404);
  }

  try {
    const messageBody = `*Fatura #${invoice.id}*\n\n` +
      `Valor: ${invoice.value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}\n` +
      `Vencimento: ${moment(invoice.dueDate).format('DD/MM/YYYY')}\n` +
      `Status: ${invoice.status === 'paid' ? 'Pago' : 'Em Aberto'}\n\n` +
      `${invoice.detail}`;

    // Usando a primeira conexão WhatsApp disponível da empresa
    const defaultWhatsapp = await Whatsapp.findOne({
      where: { companyId, default: true }
    });

    if (!defaultWhatsapp) {
      throw new AppError("No default WhatsApp connection found", 400);
    }

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
    throw new AppError("Error sending WhatsApp message", 500);
  }
};

export const sendEmail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const invoice = await Invoices.findOne({
    where: { id, companyId },
    include: [
      {
        model: Contact,
        as: 'contact',
        attributes: ['email']
      }
    ]
  });

  if (!invoice) {
    throw new AppError("Invoice not found", 404);
  }

  if (!invoice.company?.email) {
    throw new AppError("Contact has no email address", 400);
  }

  try {
    const emailBody = `
      <h2>Fatura #${invoice.id}</h2>
      <p>Valor: ${invoice.value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</p>
      <p>Vencimento: ${moment(invoice.dueDate).format('DD/MM/YYYY')}</p>
      <p>Status: ${invoice.status === 'paid' ? 'Pago' : 'Em Aberto'}</p>
      <p>${invoice.detail}</p>
    `;

    await EmailService.sendMail(
      companyId,
      invoice.company.email,
      `Fatura #${invoice.id}`,
      emailBody,
      moment().add(1, 'hour').toDate()
    );

    return res.status(200).json({ message: "Email sent" });
  } catch (err) {
    logger.error(`Error sending invoice email: ${err}`);
    throw new AppError("Error sending email", 500);
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { companyId, profile, isSuper } = req.user;

    if (!isSuper) {
      throw new AppError("Unauthorized", 403);
    }

    const invoice = await Invoices.findByPk(id);
    if (!invoice) {
      throw new AppError("Invoice not found", 404);
    }

    await invoice.destroy();

    const io = getIO();
    io.emit(`company-${companyId}-invoice`, {
      action: "delete",
      invoiceId: id
    });

    return res.status(200).json({ message: "Invoice deleted" });
  } catch (err) {
    throw new AppError(err.message);
  }
};

export const bulkRemove = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { ids } = req.body;
    const { companyId, isSuper } = req.user;

    if (!isSuper) {
      throw new AppError("Unauthorized", 403);
    }

    const schema = Yup.object().shape({
      ids: Yup.array().of(Yup.number().required()).required()
    });

    await schema.validate({ ids });

    const invoices = await Invoices.findAll({
      where: { id: ids },
      attributes: ['id', 'companyId']
    });

    // Verificar se todas as faturas existem
    if (invoices.length !== ids.length) {
      const foundIds = invoices.map(invoice => invoice.id);
      const missingIds = ids.filter((id: number) => !foundIds.includes(id));
      throw new AppError(`Invoices not found: ${missingIds.join(', ')}`, 404);
    }

    // Excluir em transação
    await Sequelize.transaction(async transaction => {
      await Invoices.destroy({
        where: { id: ids },
        transaction
      });

      // Registrar logs de exclusão
      const logEntries = invoices.map(invoice => ({
        invoiceId: invoice.id,
        userId: req.user.id,
        type: 'INVOICE_DELETE',
        oldValue: JSON.stringify(invoice.get({ plain: true })),
        newValue: null
      }));

      await InvoiceLogs.bulkCreate(logEntries, { transaction });
    });

    // Emitir eventos de exclusão
    const io = getIO();
    invoices.forEach(invoice => {
      io.emit(`company-${invoice.companyId}-invoice`, {
        action: "delete",
        invoiceId: invoice.id
      });
    });

    return res.status(200).json({ 
      message: `${ids.length} invoices deleted successfully`,
      count: ids.length
    });
  } catch (err) {
    logger.error(`Bulk delete error: ${err.message}`);
    throw new AppError(err.message || "Error deleting invoices", 500);
  }
};