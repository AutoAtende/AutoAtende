// subscriptionRoutes.ts
import express from "express";
import isAuth from "../middleware/isAuth";
import { payGatewayCreateSubscription, payGatewayReceiveWebhook } from "../services/PaymentGatewayServices/PaymentGatewayServices";

const subscriptionRoutes = express.Router();

// Rota principal para criar assinatura
subscriptionRoutes.post("/subscription", 
  isAuth, 
  payGatewayCreateSubscription
);

// Rota para webhooks de pagamento
subscriptionRoutes.post("/subscription/webhook/:type",
  payGatewayReceiveWebhook
);

export default subscriptionRoutes;