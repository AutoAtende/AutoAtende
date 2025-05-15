import { proto, WASocket } from "baileys";
import axios from 'axios';
import moment from 'moment';
import Contact from "../../../../../models/Contact";
import Setting from "../../../../../models/Setting";
import Ticket from "../../../../../models/Ticket";
import { getBodyMessage } from "../../../MessageListener/Get/GetBodyMessage";
import { SendPresenceStatus } from "../../../../../helpers/SendPresenceStatus";
import UpdateTicketService from "../../../../TicketServices/UpdateTicketService";
import FindOrCreateATicketTrakingService from "../../../../TicketServices/FindOrCreateATicketTrakingService";
import formatBody from "../../../../../helpers/Mustache";
import { sleep } from "../../../MessageListener/wbotMessageListener";

class OmieIntegration {
  private omieAxios;
  private key: string;
  private secret: string;

  constructor(apiKey: string, apiSecret: string) {
    console.log('[OMIE] Iniciando integração com as credenciais:', { 
      apiKey: apiKey?.substring(0, 5) + '...', 
      apiSecret: apiSecret?.substring(0, 5) + '...' 
    });
    
    this.key = apiKey;
    this.secret = apiSecret;
    this.omieAxios = axios.create({
      baseURL: 'https://app.omie.com.br/api/v1/',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  private getRequestBody(call: string, param: any) {
    console.log(`[OMIE] Preparando request body para chamada "${call}"`, param);
    return {
      call,
      app_key: this.key,
      app_secret: this.secret,
      param: [param]
    };
  }

  async listaBoletos(cpfCnpj: string) {
    console.log(`[OMIE] Iniciando busca de boletos para CPF/CNPJ: ${cpfCnpj}`);
    try {
      const hoje = moment();
      const umMesDepois = moment().add(1, 'months');
      const umMesAntes = moment().subtract(1, 'months');

      console.log(`[OMIE] Parâmetros de data: `, {
        inicio: umMesAntes.format('DD/MM/YYYY'),
        fim: umMesDepois.format('DD/MM/YYYY')
      });

      // Parâmetros conforme documentação ltPesquisarRequest
      const requestBody = this.getRequestBody('PesquisarLancamentos', {
        nPagina: 1,
        nRegPorPagina: 50,
        cOrdenarPor: "CODIGO",
        cOrdemDecrescente: "N",
        cCPFCNPJCliente: cpfCnpj,
        cNatureza: "R", // Contas a Receber
        cTipo: "BOL", // Boletos
        dDtVencDe: umMesAntes.format('DD/MM/YYYY'),
        dDtVencAte: umMesDepois.format('DD/MM/YYYY'),
        cStatus: "EMABERTO" // Apenas títulos em aberto
      });

      console.log('[OMIE] Enviando requisição para pesquisar títulos:', JSON.stringify(requestBody));

      const response = await this.omieAxios.post('financas/pesquisartitulos/', requestBody);

      console.log('[OMIE] Resposta recebida:', JSON.stringify(response.data));

      if (!response.data.titulosEncontrados || response.data.nTotRegistros === 0) {
        console.log('[OMIE] Nenhum título encontrado');
        return [];
      }

      const boletos = response.data.titulosEncontrados.map((titulo: any) => {
        console.log('[OMIE] Processando título:', JSON.stringify(titulo));
        
        const dataVencimento = moment(titulo.cabecTitulo.dDtVenc, 'DD/MM/YYYY');
        let status = 'A_VENCER';
        
        if (dataVencimento.isBefore(hoje, 'day')) {
          status = 'VENCIDO';
        } else if (dataVencimento.isSame(hoje, 'day')) {
          status = 'VENCE_HOJE';
        }

        return {
          nCodTitulo: titulo.cabecTitulo.nCodTitulo,
          nCodIntTitulo: titulo.cabecTitulo.nCodIntTitulo,
          cNumTitulo: titulo.cabecTitulo.cNumTitulo,
          cNumDocFiscal: titulo.cabecTitulo.cNumDocFiscal,
          nValorTitulo: titulo.cabecTitulo.nValorTitulo,
          cCodigoBarras: titulo.cabecTitulo.cCodigoBarras,
          dataVencimento: titulo.cabecTitulo.dDtVenc,
          dataEmissao: titulo.cabecTitulo.dDtEmissao,
          observacao: titulo.cabecTitulo.observacao,
          status,
          resumo: titulo.resumo ? {
            valorPago: titulo.resumo.nValPago,
            valorAberto: titulo.resumo.nValAberto,
            valorLiquido: titulo.resumo.nValLiquido,
            juros: titulo.resumo.nJuros,
            multa: titulo.resumo.nMulta,
            desconto: titulo.resumo.nDesconto
          } : null
        };
      });

      console.log(`[OMIE] Total de boletos processados: ${boletos.length}`);
      console.log('[OMIE] Boletos encontrados:', JSON.stringify(boletos));

      return boletos.sort((a: any, b: any) => 
        moment(a.dataVencimento, 'DD/MM/YYYY').diff(moment(b.dataVencimento, 'DD/MM/YYYY'))
      );

    } catch (error) {
      console.error('[OMIE] Erro ao listar boletos:', error);
      if (axios.isAxiosError(error)) {
        console.error('[OMIE] Detalhes do erro Axios:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      throw error;
    }
  }

  async obterBoleto(nCodTitulo: number, nCodIntTitulo: number) {
    console.log(`[OMIE] Iniciando obtenção do boleto código: ${nCodTitulo}`);
    try {
      // Primeiro tentamos obter URL do boleto
      const requestBody = this.getRequestBody('ObterBoleto', {
        nCodTitulo: nCodTitulo,
        cCodIntTitulo: nCodIntTitulo
      });

      console.log('[OMIE] Enviando requisição para obter URL do boleto:', JSON.stringify(requestBody));

      const response = await this.omieAxios.post('financas/contareceberboleto/', requestBody);

      console.log('[OMIE] Resposta da obtenção do boleto:', JSON.stringify(response.data));

      if (response.data.cLinkBoleto) {
        return {
          nCodTitulo: response.data.nCodTitulo,
          cCodIntTitulo: response.data.cCodIntTitulo,
          cLinkBoleto: response.data.cLinkBoleto
        };
      }

      throw new Error('Link do boleto não encontrado na resposta');
    } catch (error) {
      console.error('[OMIE] Erro ao obter boleto:', error);
      if (axios.isAxiosError(error)) {
        console.error('[OMIE] Detalhes do erro Axios:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      throw error;
    }
  }
}

export async function handleOmieBoletos(
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact,
  wbot: WASocket,
  omieApiKey: string,
  omieApiSecret: string
) {
  console.log('\n[OMIE HANDLER] Iniciando processamento de boletos');
  console.log('[OMIE HANDLER] Dados recebidos:', {
    ticketId: ticket.id,
    contactId: contact.id,
    hasApiKey: !!omieApiKey,
    hasApiSecret: !!omieApiSecret
  });

  if (!omieApiKey || !omieApiSecret) {
    console.error('[OMIE HANDLER] Credenciais do Omie não encontradas');
    const body = { text: formatBody("Configuração do Omie não encontrada. Por favor, contate o administrador.", contact) };
    await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, body);
    return;
  }

  const messageContent = getBodyMessage(msg);
  console.log('[OMIE HANDLER] Conteúdo da mensagem:', messageContent);

  let cpfCnpj = null;
  if (messageContent !== null) {
    cpfCnpj = messageContent.replace(/\D/g, '');
    console.log('[OMIE HANDLER] CPF/CNPJ extraído:', cpfCnpj);
  
    if (!cpfCnpj || (cpfCnpj.length !== 11 && cpfCnpj.length !== 14)) {
      console.log('[OMIE HANDLER] CPF/CNPJ inválido');
      const body = { text: formatBody("Por favor, envie um CPF ou CNPJ válido.", contact) };
      await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, body);
      return;
    }
  } else {
    console.log('[OMIE HANDLER] Mensagem vazia ou nula.');
    return;
  }

  try {
    console.log('[OMIE HANDLER] Criando instância do Omie');
    const omie = new OmieIntegration(omieApiKey, omieApiSecret);

    console.log('[OMIE HANDLER] Buscando boletos');
    const boletos = await omie.listaBoletos(cpfCnpj);
    console.log(`[OMIE HANDLER] ${boletos.length} boletos encontrados`);

    if (boletos.length === 0) {
      console.log('[OMIE HANDLER] Nenhum boleto encontrado');
      const body = { text: formatBody(`Não encontrei nenhum boleto em aberto para o documento ${cpfCnpj}.`, contact) };
      await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, body);
      return;
    }

    const initialBody = { text: formatBody(`Encontrei ${boletos.length} boleto(s) para o documento ${cpfCnpj}. Aguarde enquanto envio os detalhes...`, contact) };
    await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, initialBody);

    for (const boleto of boletos) {
      console.log('[OMIE HANDLER] Processando boleto:', JSON.stringify(boleto));

      const boletoCompleto = await omie.obterBoleto(boleto.nCodTitulo, boleto.nCodIntTitulo);
      console.log('[OMIE HANDLER] Dados completos do boleto:', JSON.stringify(boletoCompleto));

      let statusEmoji = '📄';
      if (boleto.status === 'VENCIDO') statusEmoji = '⚠️';
      if (boleto.status === 'VENCE_HOJE') statusEmoji = '🚨';

      const message = formatBody(
        `${statusEmoji} *Boleto ${boleto.status}*\n\n` +
        `*Título:* ${boleto.cNumTitulo}\n` +
        `*Documento:* ${boleto.cNumDocFiscal || 'N/A'}\n` +
        `*Valor:* R$ ${boleto.nValorTitulo.toFixed(2)}\n` +
        `*Vencimento:* ${boleto.dataVencimento}\n` +
        `*Emissão:* ${boleto.dataEmissao}\n` +
        (boleto.resumo ? `*Valor em Aberto:* R$ ${boleto.resumo.valorAberto.toFixed(2)}\n` : '') +
        (boleto.observacao ? `\n*Observações:* ${boleto.observacao}\n` : '') +
        (boleto.cCodigoBarras ? `\n*Código de Barras:* ${boleto.cCodigoBarras}\n` : ''),
        contact
      );

      console.log('[OMIE HANDLER] Enviando mensagem com dados do boleto');
      await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, { text: message });
      await sleep(1000);

      if (boletoCompleto.cLinkBoleto) {
        try {
          console.log('[OMIE HANDLER] Tentando enviar PDF do boleto');
          await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
            document: { url: boletoCompleto.cLinkBoleto },
            fileName: `Boleto_${boleto.cNumTitulo}.pdf`,
            mimetype: 'application/pdf'
          });
          console.log('[OMIE HANDLER] PDF enviado com sucesso');
        } catch (error) {
          console.error('[OMIE HANDLER] Erro ao enviar PDF:', error);
          await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
            text: formatBody(`Link para download do boleto: ${boletoCompleto.cLinkBoleto}`, contact)
          });
        }
        await sleep(1000);
      }
    }

    console.log('[OMIE HANDLER] Finalizando atendimento');
    const finalBody = { text: formatBody("Todos os boletos foram enviados. Caso precise de mais informações, digite # para falar com um atendente.", contact) };
    await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, finalBody);

    // Obtém ou cria o tracking do ticket
    const ticketTraking = await FindOrCreateATicketTrakingService({
      ticketId: ticket.id,
      companyId: ticket.companyId,
      whatsappId: ticket.whatsappId
    });

    // Marca o ticket como avaliado para evitar a mensagem de avaliação
    await ticketTraking.update({
      finishedAt: moment().toDate(),
      rated: true
    });

    console.log('[OMIE HANDLER] Fechando ticket');
    await UpdateTicketService({
      ticketData: { status: "closed" },
      ticketId: ticket.id,
      companyId: ticket.companyId,
    });

  } catch (error) {
    console.error('[OMIE HANDLER] Erro fatal:', error);
    const errorBody = { text: formatBody("Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, digite # para falar com um atendente.", contact) };
    await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, errorBody);
    return;
  }
}