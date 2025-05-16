require("dotenv").config({ path: ".env" });

const { Pool } = require("pg");

// Configuração do banco de dados a partir do .env
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASS, // Garante que a senha seja uma string
  database: process.env.DB_NAME,
});

const companyId = 1;

const settings = [
  { key: "userRating", value: "disabled" },
  { key: "scheduleType", value: "queue" },
  { key: "CheckMsgIsGroup", value: "enabled" },
  { key: "sendGreetingAccepted", value: "disabled" },
  { key: "sendMsgTransfTicket", value: "disabled" },
  { key: "chatBotType", value: "text" }, // Valor correto é "text"
  { key: "allowSignup", value: "enabled" },
  { key: "sendGreetingMessageOneQueues", value: "disabled" },
  { key: "callSuport", value: "disabled" },
  { key: "displayContactInfo", value: "enabled" },
  { key: "trialExpiration", value: "7" },
  { key: "sendEmailWhenRegister", value: "enabled" },
  { key: "sendMessageWhenRegister", value: "enabled" },
  { key: "smtpauth", value: "disabled" },
  { key: "usersmtpauth", value: "disabled" },
  { key: "clientsecretsmtpauth", value: "" },
  { key: "smtpport", value: "" },
  { key: "wasuport", value: "" },
  { key: "msgsuport", value: "" },
  { key: "openaiModel", value: "gpt-4" },
  { key: "downloadLimit", value: "64" },
  { key: "useOneTicketPerConnection", value: "enabled" },
  { key: "enableTicketValueAndSku", value: "enabled" },
  { key: "enableReasonWhenCloseTicket", value: "disabled" },
  { key: "quickMessages", value: "company" },
  { key: "sendQueuePosition", value: "disabled" },
  { key: "settingsUserRandom", value: "disabled" },
  { key: "displayBusinessInfo", value: "disabled" },
  { key: "enableUPSix", value: "disabled" },
  { key: "enableUPSixWebphone", value: "disabled" },
  { key: "enableUPSixNotifications", value: "disabled" },
  { key: "enableOfficialWhatsapp", value: "disabled" },
  { key: "enableSaveCommonContacts", value: "disabled" },
  { key: "displayProfileImages", value: "disabled" },
  { key: "enableQueueWhenCloseTicket", value: "disabled" },
  { key: "enableTagsWhenCloseTicket", value: "disabled" },
  { key: "queueWhenClosingTicket", value: "disabled" },
  { key: "tagsWhenClosingTicket", value: "disabled" },
  { key: "enableMetaPixel", value: "enabled" },
  { key: "metaPixelId", value: "" },
  { key: "enableSatisfactionSurvey", value: "disabled" },
  { key: "enableAudioTranscriptions", value: "disabled" },
  { key: "openAiKey", value: "" }
];

// Função para verificar e inserir configurações ausentes
async function checkAndInsertSettings() {
  const client = await pool.connect();
  try {
    for (const setting of settings) {
      const { key, value } = setting;

      // Verifica se a chave já existe para companyId=1
      const res = await client.query(
        'SELECT "value" FROM "Settings" WHERE "companyId" = $1 AND "key" = $2',
        [companyId, key]
      );

      if (res.rows.length > 0) {
        // Se a chave já existe, verifica se o valor está correto
        const currentValue = res.rows[0].value;

        // Verifica se a chave é "chatBotType" e se o valor está incorreto
        if (key === "chatBotType" && (currentValue === "list" || currentValue === "button")) {
          console.log(`Valor incorreto encontrado: ${key} = ${currentValue}. Atualizando para: ${value}`);
          await client.query(
            'UPDATE "Settings" SET "value" = $1, "updatedAt" = NOW() WHERE "companyId" = $2 AND "key" = $3',
            [value, companyId, key]
          );
        } else if (key === "useOneTicketPerConnection" && (currentValue === "disabled")) {
          console.log(`Valor incorreto encontrado: ${key} = ${currentValue}. Atualizando para: ${value}`);
          await client.query(
            'UPDATE "Settings" SET "value" = $1, "updatedAt" = NOW() WHERE "companyId" = $2 AND "key" = $3',
            [value, companyId, key]
          );
        }
        else {
          console.log(`Configuração existente: ${key} = ${currentValue}`);
        }
      } else {
        // Insere a configuração se não existir
        console.log(`Inserindo: ${key} = ${value}`);
        await client.query(
          'INSERT INTO "Settings" ("companyId", "key", "value", "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())',
          [companyId, key, value]
        );
      }
    }
  } catch (error) {
    console.error("Erro ao verificar/inserir configurações:", error);
  } finally {
    client.release();
    pool.end();
  }
}

// Executa a verificação
checkAndInsertSettings();