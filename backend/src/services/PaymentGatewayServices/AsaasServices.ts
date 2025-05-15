import { Request, Response } from "express";
import axios from "axios";
import AppError from "../../errors/AppError";
import Invoices from "../../models/Invoices";
import { processInvoicePaid, processInvoiceExpired } from "./PaymentGatewayServices";
import { logger } from "../../utils/logger";

const asaasApiUrl = "https://sandbox.asaas.com/api/v3";
const asaasApiKey = process.env.ASAAS_API_KEY;

export const asaasInitialize = async () => {
  // Implement any initialization logic if needed
}

export const asaasCreateSubscription = async (req: Request, res: Response): Promise<Response> => {
  const { price, invoiceId } = req.body;

  try {
    const invoice = await Invoices.findByPk(invoiceId);
    if (!invoice) {
      throw new AppError("Invoice not found", 404);
    }

    const response = await axios.post(
      `${asaasApiUrl}/payments`,
      {
        customer: invoice.companyId,
        billingType: "PIX",
        value: price,
        dueDate: new Date().toISOString().split('T')[0],
        description: `Invoice #${invoiceId}`
      },
      {
        headers: {
          "Content-Type": "application/json",
          "access_token": asaasApiKey
        }
      }
    );

    const payment = response.data;

    await invoice.update({
      value: price,
      txId: payment.id,
      payGw: "asaas",
      payGwData: JSON.stringify(payment)
    });

    const qrCodeResponse = await axios.get(
      `${asaasApiUrl}/payments/${payment.id}/pixQrCode`,
      {
        headers: {
          "access_token": asaasApiKey
        }
      }
    );

    const qrCode = qrCodeResponse.data;

    return res.json({
      qrcode: qrCode.encodedImage,
      payload: qrCode.payload,
      expirationDate: qrCode.expirationDate
    });
  } catch (error) {
    throw new AppError("Failed to create Asaas subscription", 400);
  }
}

export const asaasWebhookHandler = async (req: Request, res: Response): Promise<Response> => {
  const { event, payment } = req.body;

  if (event === "PAYMENT_CONFIRMED") {
    const invoice = await Invoices.findOne({
      where: {
        txId: payment.id,
        status: "open"
      }
    });

    if (invoice) {
      await processInvoicePaid(invoice);
    }
  }

  return res.status(200).json({ received: true });
}

export const asaasCheckStatus = async (invoiceId: number): Promise<boolean> => {
  try {
    const invoice = await Invoices.findByPk(invoiceId);
    if (!invoice || !invoice.txId) {
      logger.error("Invoice not found or missing Asaas Payment ID.");
      return false;
    }

    const response = await axios.get(
      `${asaasApiUrl}/payments/${invoice.txId}`,
      {
        headers: {
          "access_token": asaasApiKey
        }
      }
    );

    const payment = response.data;

    if (payment.status === 'RECEIVED') {
      await processInvoicePaid(invoice);
      return true;
    } else if (payment.status === 'EXPIRED') {
      await processInvoiceExpired(invoice);
      return false;
    }

    return false;
  } catch (error) {
    logger.error({ error }, "Failed to check payment status.");
    return false;
  }
}