import PDFDocument from 'pdfkit';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import fs from 'fs';
import path from 'path';
import ChatMessage from '../models/ChatMessage';

interface PdfOptions {
  title?: string;
  dateFormat?: string;
  pageSize?: string;
  fontSize?: {
    title: number;
    header: number;
    message: number;
    footer: number;
  };
  margins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export const generatePdf = async (
  messages: ChatMessage[],
  options: PdfOptions = {}
): Promise<Buffer> => {
  const defaultOptions: PdfOptions = {
    title: 'Histórico de Conversa',
    dateFormat: 'dd/MM/yyyy HH:mm',
    pageSize: 'A4',
    fontSize: {
      title: 18,
      header: 14,
      message: 12,
      footer: 10
    },
    margins: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50
    }
  };

  const mergedOptions = { ...defaultOptions, ...options };
  const chunks: Buffer[] = [];
  const doc = new PDFDocument({
    size: mergedOptions.pageSize,
    margins: mergedOptions.margins,
    bufferPages: true // Importante: habilita o buffer de páginas
  });

  // Registra fonte personalizada para suporte a caracteres especiais
  const fontPath = path.resolve(__dirname, '..', 'assets', 'fonts', 'Roboto-Regular.ttf');
  if (fs.existsSync(fontPath)) {
    doc.font(fontPath);
  }

  // Stream para coletar os chunks do PDF
  doc.on('data', chunks.push.bind(chunks));

  // Adiciona título
  doc.fontSize(mergedOptions.fontSize.title)
     .text(mergedOptions.title, {
       align: 'center'
     })
     .moveDown();

  // Adiciona data da exportação
  doc.fontSize(mergedOptions.fontSize.header)
     .text(`Exportado em: ${format(new Date(), mergedOptions.dateFormat, { locale: ptBR })}`)
     .moveDown();

  // Define cor e estilo padrão para mensagens
  doc.fontSize(mergedOptions.fontSize.message);

  let currentDate = '';
  
  for (const message of messages) {
    const messageDate = format(new Date(message.createdAt), 'dd/MM/yyyy', { locale: ptBR });
    
    // Adiciona separador de data quando muda o dia
    if (messageDate !== currentDate) {
      currentDate = messageDate;
      doc.moveDown()
         .fontSize(mergedOptions.fontSize.header)
         .text(messageDate, { align: 'center' })
         .moveDown();
    }

    // Formata horário da mensagem
    const messageTime = format(new Date(message.createdAt), 'HH:mm');

    // Define estilo baseado no tipo de mensagem
    const isMedia = message.messageType !== 'text';
    const messageContent = isMedia 
      ? `[${message.messageType.toUpperCase()}] ${message.mediaName}` 
      : message.message;

    // Monta o texto da mensagem
    const messageText = `${messageTime} - ${message.sender.name}: ${messageContent}`;

    // Calcula espaço necessário para a mensagem
    const textHeight = doc.heightOfString(messageText, {
      width: doc.page.width - mergedOptions.margins.left - mergedOptions.margins.right
    });

    // Adiciona nova página se necessário
    if (doc.y + textHeight > doc.page.height - mergedOptions.margins.bottom) {
      doc.addPage();
    }

    // Adiciona a mensagem
    doc.fontSize(mergedOptions.fontSize.message)
       .text(messageText, {
         continued: false,
         align: 'left'
       });

    // Se for mídia, adiciona metadados
    if (isMedia && message.mediaSize) {
      const metadata = [];
      
      if (message.mediaSize) {
        const sizeMB = (message.mediaSize / (1024 * 1024)).toFixed(2);
        metadata.push(`Tamanho: ${sizeMB}MB`);
      }

      if (message.mediaDuration && ['audio', 'video'].includes(message.messageType)) {
        const duration = Math.floor(message.mediaDuration);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        metadata.push(`Duração: ${minutes}:${seconds.toString().padStart(2, '0')}`);
      }

      if (metadata.length > 0) {
        doc.fontSize(mergedOptions.fontSize.footer)
           .text(metadata.join(' | '), {
             align: 'left',
             indent: 20
           });
      }
    }

    doc.moveDown(0.5);
  }

  // Adiciona rodapé com número de páginas
  const range = doc.bufferedPageRange(); // Obtém o range de páginas
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    
    doc.fontSize(mergedOptions.fontSize.footer)
       .text(
         `Página ${i + 1} de ${range.count}`,
         mergedOptions.margins.left,
         doc.page.height - mergedOptions.margins.bottom + 20,
         {
           align: 'center'
         }
       );
  }

  // Finaliza o documento
  doc.end();

  // Retorna uma Promise com o buffer do PDF
  return new Promise((resolve) => {
    const pdfBuffer = Buffer.concat(chunks);
    resolve(pdfBuffer);
  });
};