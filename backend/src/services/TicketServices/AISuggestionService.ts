import OpenAI from 'openai';
import { Op } from 'sequelize';
import Ticket from '../../models/Ticket';
import Message from '../../models/Message';
import Contact from '../../models/Contact';
import Queue from '../../models/Queue';
import User from '../../models/User';
import Company from '../../models/Company';
import { logger } from '../../utils/logger';
import AppError from '../../errors/AppError';

interface SuggestionRequest {
  ticketId: number;
  companyId: number;
  openaiApiKey: string;
  model?: string;
  maxSuggestions?: number;
  contextLength?: number;
}

interface ResponseSuggestion {
  id: string;
  text: string;
  tone: 'formal' | 'casual' | 'empathetic' | 'professional';
  confidence: number;
  category: 'information' | 'support' | 'sales' | 'follow_up' | 'escalation';
  reasoning: string;
}

interface SuggestionResponse {
  ticketId: number;
  suggestions: ResponseSuggestion[];
  context: {
    customerName: string;
    queueName: string;
    ticketStatus: string;
    lastMessages: number;
    conversationSummary: string;
  };
  metadata: {
    processingTime: number;
    model: string;
    timestamp: string;
  };
}

class AISuggestionService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async generateResponseSuggestions({
    ticketId,
    companyId,
    openaiApiKey,
    model = 'gpt-4o',
    maxSuggestions = 3,
    contextLength = 20
  }: SuggestionRequest): Promise<SuggestionResponse> {
    const startTime = Date.now();

    logger.info({
      ticketId,
      companyId,
      model
    }, 'Iniciando geração de sugestões de resposta');

    try {
      // Buscar ticket com dados necessários
      const ticket = await Ticket.findOne({
        where: {
          id: ticketId,
          companyId
        },
        include: [
          {
            model: Contact,
            as: 'contact',
            attributes: ['id', 'name', 'number', 'email']
          },
          {
            model: Queue,
            as: 'queue',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name']
          },
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!ticket) {
        throw new AppError('Ticket não encontrado', 404);
      }

      // Buscar mensagens recentes da conversa
      const messages = await Message.findAll({
        where: {
          ticketId,
          body: {
            [Op.ne]: '',
            [Op.notLike]: '%Mensagem deletada%',
          }
        },
        include: [
          {
            model: Contact,
            as: 'contact',
            attributes: ['name']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: contextLength
      });

      // Reverter para ordem cronológica
      messages.reverse();

      if (messages.length === 0) {
        throw new AppError('Nenhuma mensagem encontrada para análise', 400);
      }

      // Processar contexto da conversa
      const conversationContext = this.processConversationContext(messages, ticket);

      // Gerar sugestões com IA
      const suggestions = await this.generateSuggestionsWithAI(
        conversationContext,
        ticket,
        model,
        maxSuggestions
      );

      const processingTime = Date.now() - startTime;

      logger.info({
        ticketId,
        companyId,
        suggestionsGenerated: suggestions.length,
        processingTime
      }, 'Sugestões de resposta geradas com sucesso');

      return {
        ticketId,
        suggestions,
        context: {
          customerName: ticket.contact?.name || 'Cliente',
          queueName: ticket.queue?.name || 'Atendimento',
          ticketStatus: ticket.status,
          lastMessages: messages.length,
          conversationSummary: this.createConversationSummary(messages)
        },
        metadata: {
          processingTime,
          model,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      logger.error({
        ticketId,
        companyId,
        error: error.message,
        stack: error.stack
      }, 'Erro ao gerar sugestões de resposta');

      throw error;
    }
  }

  private processConversationContext(messages: Message[], ticket: Ticket) {
    const context = messages.map(message => {
      const sender = message.fromMe ? 'Atendente' : (ticket.contact?.name || 'Cliente');
      const timestamp = message.createdAt.toISOString();
      
      return {
        sender,
        message: message.body,
        timestamp,
        fromMe: message.fromMe
      };
    });

    // Última mensagem do cliente
    const lastCustomerMessage = messages
      .filter(m => !m.fromMe)
      .pop();

    // Última mensagem do atendente
    const lastAgentMessage = messages
      .filter(m => m.fromMe)
      .pop();

    return {
      conversation: context,
      lastCustomerMessage: lastCustomerMessage?.body || '',
      lastAgentMessage: lastAgentMessage?.body || '',
      awaitingResponse: !messages[messages.length - 1]?.fromMe,
      conversationLength: messages.length
    };
  }

  private createConversationSummary(messages: Message[]): string {
    const totalMessages = messages.length;
    const customerMessages = messages.filter(m => !m.fromMe).length;
    const agentMessages = messages.filter(m => m.fromMe).length;
    
    return `Conversa com ${totalMessages} mensagens (${customerMessages} do cliente, ${agentMessages} do atendente)`;
  }

  private async generateSuggestionsWithAI(
    context: any,
    ticket: Ticket,
    model: string,
    maxSuggestions: number
  ): Promise<ResponseSuggestion[]> {
    
    const conversationText = context.conversation
      .map(c => `${c.sender}: ${c.message}`)
      .join('\n');

    const prompt = `
Você é um assistente de atendimento ao cliente especializado em sugerir respostas. 

Contexto do Atendimento:
- Cliente: ${ticket.contact?.name || 'Cliente'}
- Empresa: ${ticket.company?.name || 'Empresa'}
- Departamento: ${ticket.queue?.name || 'Atendimento'}
- Status do Ticket: ${ticket.status}
- Aguardando resposta: ${context.awaitingResponse ? 'Sim' : 'Não'}

Últimas mensagens da conversa:
${conversationText}

Última mensagem do cliente: "${context.lastCustomerMessage}"

Por favor, sugira ${maxSuggestions} respostas adequadas para esta situação. 
Para cada sugestão, forneça:
1. O texto da resposta (natural e profissional)
2. O tom (formal, casual, empathetic, professional)
3. A categoria (information, support, sales, follow_up, escalation)
4. Uma breve explicação do motivo da sugestão
5. Nível de confiança (0-100)

Retorne APENAS um JSON válido no seguinte formato:
{
  "suggestions": [
    {
      "text": "Texto da resposta sugerida",
      "tone": "professional",
      "category": "support",
      "reasoning": "Explicação da sugestão",
      "confidence": 85
    }
  ]
}
`;

    try {
      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em atendimento ao cliente. Suas sugestões devem ser úteis, apropriadas e profissionais. Mantenha um tom respeitoso e focado na solução dos problemas do cliente.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new AppError('Resposta vazia da IA', 500);
      }

      // Extrair JSON da resposta
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new AppError('Formato de resposta inválido da IA', 500);
      }

      const aiResponse = JSON.parse(jsonMatch[0]);
      
      return aiResponse.suggestions.map((suggestion: any, index: number) => ({
        id: `suggestion_${Date.now()}_${index}`,
        text: suggestion.text || 'Sugestão não disponível',
        tone: suggestion.tone || 'professional',
        confidence: (suggestion.confidence || 70) / 100,
        category: suggestion.category || 'support',
        reasoning: suggestion.reasoning || 'Sugestão baseada no contexto da conversa'
      }));

    } catch (error) {
      logger.error({
        error: error.message
      }, 'Erro ao processar resposta da IA para sugestões');
      
      // Fallback: criar sugestões básicas
      return this.createFallbackSuggestions(context, ticket);
    }
  }

  private createFallbackSuggestions(context: any, ticket: Ticket): ResponseSuggestion[] {
    const suggestions: ResponseSuggestion[] = [];

    // Sugestão baseada no status do ticket
    if (ticket.status === 'pending') {
      suggestions.push({
        id: `fallback_${Date.now()}_1`,
        text: 'Olá! Estou aqui para ajudá-lo. Pode me explicar melhor a sua situação para que eu possa oferecer a melhor solução?',
        tone: 'professional',
        confidence: 0.8,
        category: 'support',
        reasoning: 'Resposta padrão para tickets pendentes'
      });
    }

    // Sugestão de agradecimento se cliente enviou informações
    if (context.lastCustomerMessage.length > 50) {
      suggestions.push({
        id: `fallback_${Date.now()}_2`,
        text: 'Obrigado pelas informações fornecidas. Vou analisar sua solicitação e retornar com uma resposta em breve.',
        tone: 'professional',
        confidence: 0.75,
        category: 'follow_up',
        reasoning: 'Cliente forneceu informações detalhadas'
      });
    }

    // Sugestão de esclarecimento
    suggestions.push({
      id: `fallback_${Date.now()}_3`,
      text: 'Para que eu possa ajudá-lo da melhor forma, poderia fornecer mais detalhes sobre sua solicitação?',
      tone: 'professional',
      confidence: 0.7,
      category: 'information',
      reasoning: 'Buscar mais informações para melhor atendimento'
    });

    return suggestions.slice(0, 3);
  }

  // Método para feedback sobre sugestões utilizadas
  async recordSuggestionFeedback(suggestionId: string, used: boolean, helpful?: boolean) {
    // Por enquanto apenas log, no futuro pode ser armazenado para melhorar o modelo
    logger.info({
      suggestionId,
      used,
      helpful
    }, 'Feedback de sugestão registrado');
  }
}

export default AISuggestionService;