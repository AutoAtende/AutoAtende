// PaymentGatewayServices.ts
import AppError from "../../errors/AppError";
import GetSuperSettingService from "../SettingServices/GetSuperSettingService";
import { efiCheckStatus, efiCreateSubscription, efiInitialize, efiWebhook } from "./EfiServices";
import { stripeInitialize, stripeCreateSubscription, stripeCheckStatus, stripeWebhookHandler } from "./StripeServices";
import { asaasInitialize, asaasCreateSubscription, asaasCheckStatus, asaasWebhookHandler } from "./AsaasServices";
import { Request, Response } from "express";
import Invoices from "../../models/Invoices";
import { getIO } from "../../libs/socket";
import { Op } from "sequelize";
import Company from "../../models/Company";
import moment from "moment";
import { logger } from "../../utils/logger";

export const payGatewayInitialize = async () => {
  const paymentGateway = await GetSuperSettingService({ key: "_paymentGateway" });

  switch (paymentGateway) {
    case "stripe":
      return stripeInitialize();
    case "efi":
      return efiInitialize();
    case "asaas":
      return asaasInitialize();
    default:
      throw new AppError("Unsupported payment gateway", 400);
  }
}

export const payGatewayCreateSubscription = async (req: Request, res: Response): Promise<Response> => {
  const paymentGateway = await GetSuperSettingService({ key: "_paymentGateway" });

  switch (paymentGateway) {
    case "stripe":
      return stripeCreateSubscription(req, res);
    case "efi":
      return efiCreateSubscription(req, res);
    case "asaas":
      return asaasCreateSubscription(req, res);
    default:
      throw new AppError("Unsupported payment gateway", 400);
  }
}

export const payGatewayReceiveWebhook = async (req: Request, res: Response): Promise<Response> => {
  const paymentGateway = await GetSuperSettingService({ key: "_paymentGateway" });

  switch (paymentGateway) {
    case "stripe":
      return stripeWebhookHandler(req, res);
    case "efi":
      return efiWebhook(req, res);
    case "asaas":
      return asaasWebhookHandler(req, res);
    default:
      throw new AppError("Unsupported payment gateway", 400);
  }
}

export const processInvoicePaid = async (invoice: Invoices) => {
  try {
    const company = invoice.company || (await Company.findByPk(invoice.companyId));

    if (company) {
      const currentDueDate = moment(company.dueDate);
      let { dueDate } = company;

      switch (company.recurrence) {
        case "BIMESTRAL":
          dueDate = currentDueDate.add(2, "months").toDate();
          break;
        case "TRIMESTRAL":
          dueDate = currentDueDate.add(3, "months").toDate();
          break;
        case "SEMESTRAL":
          dueDate = currentDueDate.add(6, "months").toDate();
          break;
        case "ANUAL":
          dueDate = currentDueDate.add(12, "months").toDate();
          break;
        case "MENSAL":
        default:
          dueDate = currentDueDate.add(1, "months").toDate();
          break;
      }

      const formattedDueDate = moment(dueDate).format("YYYY-MM-DD");

      await company.update({
        dueDate: new Date(formattedDueDate)
      });
      
      await invoice.update({
        status: "paid",
        paymentDate: new Date()
      });
      
      await company.reload();
      
      const io = getIO();
      io.emit(`company-${invoice.companyId}-payment`, {
        action: "CONCLUIDA",
        company,
        invoiceId: invoice.id,
      });

      logger.info({
        invoiceId: invoice.id,
        companyId: company.id
      }, "Invoice processed as paid successfully");
    }
  } catch (error) {
    logger.error({ error }, "Error processing paid invoice");
    throw new AppError("Error processing payment", 500);
  }
}

export const processInvoiceExpired = async (invoice: Invoices) => {
  try {
    const io = getIO();

    await invoice.update({
      status: "canceled",
      txId: null,
      payGw: null,
      payGwData: null,
    });

    await invoice.reload();

    io.emit(`company-${invoice.companyId}-payment`, {
      action: "EXPIRADA",
      company: invoice.company || (await Company.findByPk(invoice.companyId)),
      invoiceId: invoice.id,
    });

    logger.info({
      invoiceId: invoice.id,
      companyId: invoice.companyId
    }, "Invoice processed as expired successfully");
  } catch (error) {
    logger.error({ error }, "Error processing expired invoice");
    throw new AppError("Error processing expired invoice", 500);
  }
}

export const checkInvoicePayment = async (invoice: Invoices) => {
  try {
    switch (invoice.payGw) {
      case "stripe":
        return stripeCheckStatus(invoice.id);
      case "efi":
        return efiCheckStatus(invoice);
      case "asaas":
        return asaasCheckStatus(invoice.id);
      default:
        logger.warn({ invoiceId: invoice.id }, "Unknown payment gateway");
        return false;
    }
  } catch (error) {
    logger.error({ error }, "Error checking invoice payment");
    return false;
  }
}

export const checkOpenInvoices = async () => {
  try {
    const invoices = await Invoices.findAll({
      where: {
        status: "open",
        txId: {
          [Op.or]: [{ [Op.not]: "" }, { [Op.not]: null }]
        }
      },
      include: [{ model: Company, as: "company" }]
    });

    for (const invoice of invoices) {
      await checkInvoicePayment(invoice);
    }
  } catch (error) {
    logger.error({ error }, "Error checking open invoices");
  }
};