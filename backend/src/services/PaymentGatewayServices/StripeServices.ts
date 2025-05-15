import { Request, Response } from "express";
import Stripe from "stripe";
import { logger } from "../../utils/logger";
import Invoices from "../../models/Invoices";
import Company from "../../models/Company";
import Plan from "../../models/Plan";
import AppError from "../../errors/AppError";
import GetSuperSettingService from "../SettingServices/GetSuperSettingService";
import { processInvoiceExpired, processInvoicePaid } from "./PaymentGatewayServices";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

async function createStripeWebhook() {
  try {
    const webhookEndpoint = await stripe.webhookEndpoints.create({
      url: `${process.env.BACKEND_URL}/subscription/webhook`,
      enabled_events: [
        'checkout.session.completed',
        'checkout.session.expired',
        'payment_intent.payment_failed'
      ]
    });
    logger.info({ webhookEndpoint }, "Stripe webhook created successfully.");
    return webhookEndpoint;
  } catch (error) {
    logger.error({ error }, "Failed to create Stripe webhook.");
    throw new AppError("Failed to create webhook.", 500);
  }
}

export const stripeInitialize = async () => {
  const paymentGateway = await GetSuperSettingService({ key: "_paymentGateway" });

  if (paymentGateway !== "stripe") {
    logger.debug("stripeInitialize: not configured for Stripe.");
    return;
  }

  if (!process.env.BACKEND_URL.startsWith("https://")) {
    logger.debug("stripeInitialize: only SSL webhooks are supported");
    return;
  }

  await createStripeWebhook();
}

export const stripeWebhookHandler = async (req: Request, res: Response): Promise<Response> => {
  try {
    const sig = req.headers['stripe-signature']!;
    const stripeWebhookSecret = await GetSuperSettingService({ key: "_stripeWebhookSecret" });
    
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      stripeWebhookSecret
    );

    logger.info({ eventType: event.type }, "Received Stripe webhook");

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const invoice = await Invoices.findByPk(session.metadata?.invoiceId, {
          include: [{ model: Company, as: 'company' }]
        });
        if (invoice) {
          await processInvoicePaid(invoice);
        }
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const invoice = await Invoices.findByPk(session.metadata?.invoiceId, {
          include: [{ model: Company, as: 'company' }]
        });
        if (invoice) {
          await processInvoiceExpired(invoice);
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const invoice = await Invoices.findByPk(paymentIntent.metadata?.invoiceId, {
          include: [{ model: Company, as: 'company' }]
        });
        if (invoice) {
          await processInvoiceExpired(invoice);
        }
        break;
      }
      default:
        logger.warn({ event }, "Unhandled Stripe event type.");
    }
    
    return res.status(200).json({ received: true });
  } catch (error) {
    logger.error({ error }, "Error handling Stripe webhook.");
    return res.status(400).json({ error: "Webhook handler failed." });
  }
};

export const stripeCreateSubscription = async (req: Request, res: Response): Promise<Response> => {
  const { price, invoiceId } = req.body;
  const { companyId } = req.user;

  try {
    const company = await Company.findByPk(companyId, {
      include: [{ model: Plan, as: 'plan' }]
    });
    
    if (!company) {
      throw new AppError("Company not found", 404);
    }

    const invoice = await Invoices.findByPk(invoiceId);
    if (!invoice) {
      throw new AppError("Invoice not found", 404);
    }

    // Criar ou recuperar cliente no Stripe
    let stripeCustomer;
    if (invoice.stripePaymentIntentId) {
      stripeCustomer = await stripe.customers.retrieve(invoice.stripePaymentIntentId);
    } else {
      stripeCustomer = await stripe.customers.create({
        name: company.name,
        email: company.email || undefined,
        metadata: {
          companyId: company.id.toString(),
        },
      });
      await invoice.update({ stripePaymentIntentId: stripeCustomer.id });
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Assinatura ${company.recurrence.toLowerCase()}`,
              description: `Fatura #${invoice.id} - ${company.plan ? company.plan.name : 'Plano'}`,
            },
            unit_amount: Math.round(parseFloat(price) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/financeiro/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/financeiro/payment/cancel`,
      metadata: {
        invoiceId: invoice.id.toString(),
        companyId: company.id.toString(),
      },
    });

    await invoice.update({
      payGw: 'stripe',
      txId: session.id,
      payGwData: JSON.stringify(session),
    });

    return res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    logger.error({ error }, "Failed to create Stripe subscription.");
    throw new AppError("Failed to create subscription.", 400);
  }
};

export const stripeCheckStatus = async (invoiceId: number): Promise<boolean> => {
  try {
    const invoice = await Invoices.findByPk(invoiceId, {
      include: [{ model: Company, as: 'company' }]
    });
    
    if (!invoice || !invoice.txId) {
      logger.error("Invoice not found or missing Stripe session ID.");
      return false;
    }

    const session = await stripe.checkout.sessions.retrieve(invoice.txId);
    
    if (session.payment_status === 'paid') {
      await processInvoicePaid(invoice);
      return true;
    } else if (['expired', 'canceled'].includes(session.status)) {
      await processInvoiceExpired(invoice);
    }

    return false;
  } catch (error) {
    logger.error({ error }, "Failed to check Stripe payment status.");
    return false;
  }
};