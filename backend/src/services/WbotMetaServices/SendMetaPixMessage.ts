import { WABAClient } from "whatsapp-business";
import { logger } from "../../utils/logger";
import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import { SessionManager } from "./MetaSessionManager";
import SendMetaMediaMessage from "./SendMetaMediaMessage";
import qrcode from "qrcode";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

interface SendMetaPixMessageData {
  whatsappId: number;
  ticketId: number;
  pixKey: string;
  amount: number;
  description: string;
  recipientName: string;
  city: string;
  companyId: number;
  quotedMessageId?: string;
}

// Função para gerar QR Code do PIX
const generatePixQRCode = async (
  pixKey: string,
  amount: number,
  description: string,
  recipientName: string,
  city: string,
  companyId: number
): Promise<string> => {
  try {
    // Formatar o valor para ter duas casas decimais
    const formattedAmount = amount.toFixed(2);
    
    // Remover caracteres especiais da descrição
    const sanitizedDescription = description
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9 ]/g, "");
    
    // Construir a string do PIX (formato EMV)
    // Documentação: https://www.bcb.gov.br/content/estabilidadefinanceira/spb_docs/ManualBRCode.pdf
    let pixString = "00020126";  // Payload Format Indicator e Merchant Account Information
    
    // Adicionar chave PIX
    const pixKeyData = `0014BR.GOV.BCB.PIX01${pixKey.length}${pixKey}`;
    pixString += pixKeyData.length.toString().padStart(2, "0") + pixKeyData;
    
    // Adicionar nome do recebedor
    pixString += `5204${recipientName.length}${recipientName}`;
    
    // Adicionar cidade
    pixString += `5802BR5913${city.length}${city}`;
    
    // Adicionar valor
    pixString += `5303986${formattedAmount.length}${formattedAmount}`;
    
    // Adicionar descrição (campo txid)
    if (sanitizedDescription) {
      pixString += `0224${sanitizedDescription.substring(0, 25).length}${sanitizedDescription.substring(0, 25)}`;
    }
    
    // Adicionar CRC16 (placeholder por enquanto)
    pixString += "6304";
    
    // Gerar código QR
    const mediaDir = path.join(__dirname, "..", "..", "..", "public", `company${companyId}`, "pix");
    
    // Criar diretório se não existir
    if (!fs.existsSync(mediaDir)) {
      await mkdirAsync(mediaDir, { recursive: true });
    }
    
    // Nome do arquivo
    const fileName = `pix_${Date.now()}.png`;
    const filePath = path.join(mediaDir, fileName);
    
    // Gerar QR Code e salvar em arquivo
    await qrcode.toFile(filePath, pixString, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 512,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    
    return filePath;
  } catch (error) {
    logger.error(`Erro ao gerar QR Code do PIX: ${error.message}`);
    throw new AppError(`Erro ao gerar QR Code do PIX: ${error.message}`, 500);
  }
};

export const SendMetaPixMessage = async ({
  whatsappId,
  ticketId,
  pixKey,
  amount,
  description,
  recipientName,
  city,
  companyId,
  quotedMessageId
}: SendMetaPixMessageData): Promise<Message> => {
  try {
    logger.info(`Enviando mensagem PIX via API Meta para ticket #${ticketId}`);

    // Buscar a instância do WhatsApp
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    if (!whatsapp) {
      throw new AppError("WhatsApp não encontrado", 404);
    }

    // Buscar o ticket e contato
    const ticket = await Ticket.findByPk(ticketId, {
      include: [{ model: Contact, as: "contact" }]
    });

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    // Verificar se o contato está disponível
    if (!ticket.contact) {
      throw new AppError("Contato do ticket não encontrado", 404);
    }

    // Obter o cliente WABA para esta instância do WhatsApp
    const waba = SessionManager.getSession(whatsappId);
    if (!waba) {
      throw new AppError("Sessão WABA não encontrada", 404);
    }

    // Gerar QR Code do PIX
    const qrCodePath = await generatePixQRCode(
      pixKey,
      amount,
      description,
      recipientName,
      city,
      companyId
    );

    // Formatar mensagem de texto com as informações do PIX
    const formattedAmount = amount.toFixed(2).replace(".", ",");
    const pixMessage = `*Pagamento PIX*\n\n` +
      `📲 *Escaneie o QR Code* para pagar\n\n` +
      `💰 *Valor:* R$ ${formattedAmount}\n` +
      `👤 *Recebedor:* ${recipientName}\n` +
      `🔑 *Chave PIX:* ${pixKey}\n` +
      `📝 *Descrição:* ${description}\n\n` +
      `_Após o pagamento, envie o comprovante para concluir sua transação._`;

    // Enviar mensagem com QR Code usando o serviço de mídia
    const message = await SendMetaMediaMessage({
      whatsappId,
      ticketId,
      mediaPath: qrCodePath,
      caption: pixMessage,
      quotedMessageId,
      companyId
    });

    logger.info(`Mensagem PIX enviada com sucesso para o ticket #${ticketId}`);
    return message;
  } catch (error) {
    logger.error(`Erro ao enviar mensagem PIX: ${error.message}`);
    throw new AppError(`Erro ao enviar mensagem PIX: ${error.message}`, 500);
  }
};

export default SendMetaPixMessage;