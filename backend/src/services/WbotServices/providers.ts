import { proto, WASocket } from "bail-lite";
import Contact from "../../models/Contact";
import Setting from "../../models/Setting";
import Ticket from "../../models/Ticket";
import {
  isNumeric,
  sleep,
} from "./MessageListener/wbotMessageListener";
import formatBody from "../../helpers/Mustache";
import { Op } from "sequelize";
import { validaCpfCnpj } from "../../helpers/validaCpfCnpj";
import { getBodyMessage } from "./MessageListener/Get/GetBodyMessage";
import { handleOmieBoletos } from "./MessageListener/Handles/HandleOmie";

// Mapa para controlar mensagens processadas e evitar loops
const processedMessages = new Map();

interface Settings {
  asaastoken?: Setting;
  ixcapikey?: Setting;
  urlixcdb?: Setting;
  ipmkauth?: Setting;
  clientidmkauth?: Setting;
  clientsecretmkauth?: Setting;
  omieApiKey?: Setting;
  omieApiSecret?: Setting;
}

async function getSettings(companyId: number): Promise<Settings> {
  const settings = await Setting.findAll({
    where: {
      companyId,
      key: {
        [Op.or]: [
          "omieAppKey",
          "omieAppSecret"
        ]
      }
    }
  });

  return {
    omieApiKey: settings.find(s => s.key === "omieAppKey"),
    omieApiSecret: settings.find(s => s.key === "omieAppSecret")
  };
}

function getCpfCnpj(cpfcnpj: string | null) {
  if (!cpfcnpj) return "";
  
  cpfcnpj = cpfcnpj.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
  return cpfcnpj;
}

function getValidCpfCnpj(numberCPFCNPJ: string) {
  // Só valida se parecer um CPF ou CNPJ
  if (numberCPFCNPJ.length !== 11 && numberCPFCNPJ.length !== 14) {
    return null;
  }
  
  const isCPFCNPJ = validaCpfCnpj(numberCPFCNPJ);
  
  if (isCPFCNPJ) {
    let formatted = numberCPFCNPJ;
    if (numberCPFCNPJ.length <= 11) {
      formatted = numberCPFCNPJ.replace(/(\d{3})(\d)/, "$1.$2")
      formatted = formatted.replace(/(\d{3})(\d)/, "$1.$2")
      formatted = formatted.replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    } else {
      formatted = numberCPFCNPJ.replace(/^(\d{2})(\d)/, "$1.$2")
      formatted = formatted.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      formatted = formatted.replace(/\.(\d{3})(\d)/, ".$1/$2")
      formatted = formatted.replace(/(\d{4})(\d)/, "$1-$2")
    }
    return formatted;
  }

  return null;
}

export const provider = async (ticket: Ticket, msg: proto.IWebMessageInfo, companyId: number, contact: Contact, wbot: WASocket) => {
  const filaescolhida = ticket.queue?.name || null;

  if (filaescolhida === null) {
    return;
  }

  // Verificar se está em uma fila relevante
  const filasPermitidas = [
    "2ª Via de Boleto",
    "2 Via de Boleto",
    "Boleto - Cobrança"
  ];

  if (!filasPermitidas.includes(filaescolhida)) {
    return;
  }

  // Chave única para identificar a mensagem
  const messageKey = `${msg.key.id}`;

  // Verifica se a mensagem já foi processada
  if (processedMessages.has(messageKey)) {
    return;
  }

  // Marca como processada e remove após 60 segundos
  processedMessages.set(messageKey, true);
  setTimeout(() => {
    processedMessages.delete(messageKey);
  }, 60000);

  const messageBody = getBodyMessage(msg);
  if (!messageBody) {
    return;
  }

  // Só processa CPF/CNPJ se estiver nas filas específicas de boleto
  if (filasPermitidas.includes(filaescolhida)) {
    const cpfcnpj = getCpfCnpj(messageBody);
    
    // Só tenta validar se parecer um número de documento
    if (cpfcnpj.length === 11 || cpfcnpj.length === 14) {
      const numberCPFCNPJ = getValidCpfCnpj(cpfcnpj);

      const settingsIntegrations = await getSettings(companyId);
      const omieApiKey = settingsIntegrations.omieApiKey?.value || "";
      const omieApiSecret = settingsIntegrations.omieApiSecret?.value || "";

      if (!omieApiKey || !omieApiSecret) {
        const body = { 
          text: formatBody("Configuração do Omie não encontrada. Por favor, contate o administrador.", contact) 
        };
        await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, body);
        return;
      }

      try {
        await handleOmieBoletos(msg, ticket, contact, wbot, omieApiKey, omieApiSecret);
      } catch (error) {
        console.error('[PROVIDERS] Erro ao executar handleOmieBoletos:', error);
        const errorBody = {
          text: formatBody("Ocorreu um erro no processamento. Por favor, tente novamente ou digite # para falar com um atendente.", contact)
        };
        await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, errorBody);
      }
    }
  }
};