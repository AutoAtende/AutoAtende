import * as dotenv from "dotenv";
import path from "path";
import "dotenv/config";
dotenv.config({ path: path.join(__dirname, ".env") });

import gracefulShutdown from "http-graceful-shutdown";
import http from "http";
import { initRedis } from "./config/redis";
import { startQueueProcess, shutdownQueues } from "./queues";
import { getJwtConfig } from "./config/auth";
import { init } from "./libs/cache";
import { initIO } from "./libs/socket";
import { logger } from "./utils/logger";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";
import Company from "./models/Company";
import { payGatewayInitialize, checkOpenInvoices } from "./services/PaymentGatewayServices/PaymentGatewayServices";
import {
  initInactivityWorker,
  scheduleInactivityJobs,
  cleanupInactivityResources
} from "./job/InactivityMonitoringJob";

// Variável para armazenar o servidor
let server;

// Função principal de inicialização
const initialize = async () => {
  try {
    // 1. Inicializar Redis (pré-requisito para tudo)
    logger.info("Inicializando Redis...");
    await initRedis();
    logger.info("Redis inicializado com sucesso");

    // 2. Inicializar camada de cache
    logger.info("Inicializando cache...");
    await init();
    logger.info("Cache inicializado com sucesso");

    // 3. Inicializar configuração JWT
    logger.info("Inicializando JWT...");
    await getJwtConfig();
    logger.info("JWT inicializado com sucesso");

    // 4. Inicializar filas (dependem do Redis)
    logger.info("Inicializando processamento de filas...");
    await startQueueProcess();
    logger.info("Processamento de filas iniciado com sucesso");

    // 4.1. Inicializar sistema de monitoramento de inatividade
    logger.info("Inicializando sistema de monitoramento de inatividade...");
    try {
      // Inicializar worker de inatividade
      await initInactivityWorker();

      // Agendar jobs de monitoramento e limpeza
      await scheduleInactivityJobs(
        60,  // Monitoramento a cada 60 segundos
        30,  // Limpeza a cada 30 minutos
        60   // Considerar inativo após 60 minutos
      );

      logger.info("Sistema de monitoramento de inatividade inicializado com sucesso");
    } catch (error) {
      logger.error("Erro ao inicializar sistema de monitoramento de inatividade:", error);
      logger.warn("Continuando sem o sistema de monitoramento de inatividade");
    }

    // 5. Só agora importamos o app, após as filas estarem inicializadas
    logger.info("Carregando aplicação...");
    const app = require("./app").default;
    logger.info("Aplicação carregada com sucesso");

    // 6. Criar e iniciar o servidor HTTP
    logger.info(`Iniciando servidor HTTP na porta ${process.env.PORT}...`);
    server = http.createServer(app);
    server.listen(process.env.PORT, () => {
      logger.info(`Servidor HTTP iniciado na porta: ${process.env.PORT}`);
    });

    // 7. Inicializar socket.io (depende do servidor HTTP)
    logger.info("Inicializando Socket.IO...");
    initIO(server);
    logger.info("Socket.IO inicializado com sucesso");

    // 8. Inicializar gateway de pagamento (não bloqueante)
    payGatewayInitialize().then(() => {
      return checkOpenInvoices();
    }).then(() => {
      logger.info("Gateway de pagamento inicializado com sucesso");
    }).catch(error => {
      logger.error("Erro ao inicializar gateway de pagamento:", error);
      logger.warn("Continuando sem o serviço de gateway de pagamento");
    });

    // 9. Inicializar sessões WhatsApp
    logger.info("Inicializando sessões WhatsApp...");
    const companies = await Company.findAll({
      where: { status: true }
    });

    logger.info(`Inicializando sessões WhatsApp para ${companies.length} empresas`);

    const allPromises = companies.map(company => {
      return StartAllWhatsAppsSessions(company.id)
        .catch(error => {
          logger.error(`Erro ao iniciar sessões WhatsApp para empresa ID ${company.id}:`, error);
          return null;
        });
    });

    await Promise.all(allPromises);
    logger.info("Todas as sessões WhatsApp foram iniciadas");

    // 10. Configurar desligamento gracioso
    gracefulShutdown(server, {
      signals: "SIGINT SIGTERM",
      timeout: 30000,
      onShutdown: async () => {
        logger.info("Iniciando desligamento...");
        await shutdownQueues();
        logger.info("Finalizando sistema de monitoramento de inatividade...");
        await cleanupInactivityResources();

      },
      finally: () => {
        logger.info("Desligamento concluído.");
      }
    });

    logger.info("Sistema inicializado com sucesso!");

  } catch (error) {
    logger.error("Erro fatal durante a inicialização do sistema:", error);
    logger.error("Encerrando aplicação...");
    process.exit(1);
  }
};

// Iniciar o processo de inicialização
initialize().catch(error => {
  logger.error("Erro não tratado durante inicialização:", error);
  process.exit(1);
});

// Tratamento de exceções não capturadas
process.on("uncaughtException", (err) => {
  console.error(`${new Date().toUTCString()} uncaughtException:`, err.message);
  console.error(err.stack);
});

// Tratamento de rejeições não tratadas
process.on("unhandledRejection", (reason, p) => {
  console.error(
    `${new Date().toUTCString()} unhandledRejection:`,
    reason,
    p
  );
});