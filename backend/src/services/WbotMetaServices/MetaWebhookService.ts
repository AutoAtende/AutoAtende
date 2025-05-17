import { Router, Request, Response } from "express";
import { Webhook } from "whatsapp-business";
import { logger } from "../../utils/logger";
import Whatsapp from "../../models/Whatsapp";
import Company from "../../models/Company";
import { metaWebhookProcessor } from "./MetaMessageListener";

interface VerifyWebhookParams {
  token: string;
  mode: string;
  challenge: string;
}

// Função para verificar o webhook (usado quando a Meta valida o endpoint)
const verifyWebhook = (req: Request, res: Response, token: string): Response => {
  try {
    const mode = req.query["hub.mode"] as string;
    const challenge = req.query["hub.challenge"] as string;
    const verifyToken = req.query["hub.verify_token"] as string;

    // Verificar se os parâmetros necessários foram fornecidos
    if (!mode || !verifyToken) {
      logger.warn(`Webhook verificação recebida sem parâmetros necessários`);
      return res.sendStatus(400);
    }

    // Verificar se o modo é 'subscribe' e se o token é válido
    if (mode === "subscribe" && verifyToken === token) {
      logger.info(`Webhook verificado com sucesso para token: ${token}`);
      return res.status(200).send(challenge);
    }

    // Token inválido
    logger.warn(`Token inválido recebido na verificação do webhook: ${verifyToken}, esperado: ${token}`);
    return res.sendStatus(403);
  } catch (error) {
    logger.error(`Erro na verificação do webhook: ${error.message}`);
    return res.sendStatus(500);
  }
};

// Função para processar o webhook (mensagens recebidas)
const processWebhook = async (req: Request, res: Response, companyId: number): Promise<Response> => {
  try {
    // Verificar assinatura da requisição (opcional, pode ser implementado posteriormente)
    // const signature = req.headers["x-hub-signature-256"];
    
    // Verificar se o corpo da requisição é válido
    const data = req.body as Webhook;
    
    if (!data || !data.object || data.object !== "whatsapp") {
      logger.warn(`Webhook recebido com formato inválido: ${JSON.stringify(data)}`);
      return res.sendStatus(400);
    }

    // Enviar resposta imediatamente para Meta, enquanto processamos a mensagem assincronamente
    res.status(200).send("OK");

    // Processar webhook em background
    metaWebhookProcessor(data, companyId)
      .catch(error => {
        logger.error(`Erro ao processar webhook: ${error.message}`);
      });

    return res;
  } catch (error) {
    logger.error(`Erro no processamento do webhook: ${error.message}`);
    return res.sendStatus(500);
  }
};

// Função para configurar as rotas do webhook para uma empresa específica
export const setupMetaWebhookRoutes = (router: Router, companyId: number): void => {
  logger.info(`Configurando rotas de webhook para a empresa ${companyId}`);

  // Rota para verificação do webhook (GET)
  router.get(`/webhook/:companyId`, async (req: Request, res: Response) => {
    try {
      const paramCompanyId = parseInt(req.params.companyId);
      
      // Verificar se o ID da empresa no parâmetro corresponde ao esperado
      if (paramCompanyId !== companyId) {
        logger.warn(`ID de empresa inválido na requisição de webhook: ${paramCompanyId}, esperado: ${companyId}`);
        return res.sendStatus(403);
      }

      // Buscar a empresa e a primeira conexão WhatsApp ativa
      const company = await Company.findByPk(companyId);
      
      if (!company) {
        logger.warn(`Empresa ${companyId} não encontrada para verificação de webhook`);
        return res.sendStatus(404);
      }

      // Buscar um WhatsApp ativo da empresa configurado com API oficial
      const whatsapp = await Whatsapp.findOne({
        where: {
          companyId,
          channel: "whatsapp-api",
          status: "CONNECTED"
        }
      });

      if (!whatsapp || !whatsapp.metaVerificationToken) {
        logger.warn(`Nenhuma conexão WhatsApp API ativa encontrada para empresa ${companyId}`);
        return res.sendStatus(404);
      }

      return verifyWebhook(req, res, whatsapp.metaVerificationToken);
    } catch (error) {
      logger.error(`Erro na verificação do webhook para empresa ${companyId}: ${error.message}`);
      return res.sendStatus(500);
    }
  });

  // Rota para recebimento de eventos do webhook (POST)
  router.post(`/webhook/:companyId`, async (req: Request, res: Response) => {
    try {
      const paramCompanyId = parseInt(req.params.companyId);
      
      // Verificar se o ID da empresa no parâmetro corresponde ao esperado
      if (paramCompanyId !== companyId) {
        logger.warn(`ID de empresa inválido na requisição de webhook: ${paramCompanyId}, esperado: ${companyId}`);
        return res.sendStatus(403);
      }

      return processWebhook(req, res, companyId);
    } catch (error) {
      logger.error(`Erro no processamento do webhook para empresa ${companyId}: ${error.message}`);
      return res.sendStatus(500);
    }
  });

  logger.info(`Rotas de webhook configuradas com sucesso para empresa ${companyId}`);
};

// Função para registrar webhook para todas as empresas ativas
export const registerAllCompanyWebhooks = async (mainRouter: Router): Promise<void> => {
  try {
    logger.info("Registrando webhooks para todas as empresas ativas");

    // Buscar todas as empresas ativas
    const companies = await Company.findAll({
      where: { status: true }
    });

    for (const company of companies) {
      setupMetaWebhookRoutes(mainRouter, company.id);
    }

    logger.info(`Webhooks registrados para ${companies.length} empresas`);
  } catch (error) {
    logger.error(`Erro ao registrar webhooks das empresas: ${error.message}`);
    throw error;
  }
};

// Função para registrar/atualizar webhook para uma empresa específica
export const setupCompanyWebhook = async (companyId: number, mainRouter: Router): Promise<void> => {
  try {
    logger.info(`Configurando webhook para empresa ${companyId}`);
    setupMetaWebhookRoutes(mainRouter, companyId);
    logger.info(`Webhook configurado com sucesso para empresa ${companyId}`);
  } catch (error) {
    logger.error(`Erro ao configurar webhook para empresa ${companyId}: ${error.message}`);
    throw error;
  }
};

export default {
  registerAllCompanyWebhooks,
  setupCompanyWebhook,
  setupMetaWebhookRoutes
};