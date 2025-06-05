import { Op, QueryTypes } from 'sequelize';
import OpenAI from 'openai';
import Ticket from '../../models/Ticket';
import Message from '../../models/Message';
import Contact from '../../models/Contact';
import Queue from '../../models/Queue';
import User from '../../models/User';
import TicketAnalysis, { FrequentQuestion, AnalysisMetrics } from '../../models/TicketAnalysis';
import Assistant from '../../models/Assistant';
import { logger } from '../../utils/logger';
import AppError from '../../errors/AppError';

interface AnalyzeTicketsRequest {
  companyId: number;
  name: string;
  description?: string;
  assistantId?: string;
  filterCriteria: {
    dateRange?: {
      startDate: string;
      endDate: string;
    };
    queueIds?: number[];
    userIds?: number[];
    tags?: string[];
    minMessages?: number;
    status?: string[];
  };
  openaiApiKey: string;
}

interface TicketConversation {
  ticketId: number;
  messages: Array<{
    id: string;
    body: string;
    fromMe: boolean;
    createdAt: Date;
    contactName: string;
    userName?: string;
  }>;
  category?: string;
  tags?: string[];
  resolutionTime?: number;
}

class AnalyzeTicketsService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async execute({
    companyId,
    name,
    description,
    assistantId,
    filterCriteria,
    openaiApiKey
  }: AnalyzeTicketsRequest): Promise<TicketAnalysis> {
    logger.info({
      companyId,
      name,
      filterCriteria
    }, 'Iniciando análise de tickets');

    // Criar registro de análise
    const analysis = await TicketAnalysis.create({
      companyId,
      name,
      description,
      assistantId,
      filterCriteria,
      status: 'processing',
      frequentQuestions: [],
      analysisMetrics: {} as AnalysisMetrics
    });

    try {
      // 1. Buscar tickets conforme critérios
      const tickets = await this.fetchTickets(companyId, filterCriteria);
      
      if (tickets.length === 0) {
        throw new AppError('Nenhum ticket encontrado com os critérios especificados', 400);
      }

      // 2. Processar conversas e extrair dados
      const conversations = await this.processTicketConversations(tickets);

      // 3. Analisar com IA para identificar padrões
      const frequentQuestions = await this.analyzeConversationsWithAI(conversations);

      // 4. Calcular métricas
      const metrics = this.calculateMetrics(tickets, conversations, frequentQuestions);

      // 5. Gerar instruções para o assistente
      const generatedInstructions = await this.generateAssistantInstructions(frequentQuestions, metrics);

      // 6. Atualizar análise
      await analysis.update({
        status: 'completed',
        frequentQuestions,
        analysisMetrics: metrics,
        generatedInstructions
      });

      logger.info({
        companyId,
        analysisId: analysis.id,
        questionsFound: frequentQuestions.length,
        ticketsAnalyzed: tickets.length
      }, 'Análise de tickets concluída com sucesso');

      return analysis.reload();

    } catch (error) {
      logger.error({
        companyId,
        analysisId: analysis.id,
        error: error.message,
        stack: error.stack
      }, 'Erro durante análise de tickets');

      await analysis.update({
        status: 'failed',
        errorMessage: error.message
      });

      throw error;
    }
  }

  private async fetchTickets(companyId: number, criteria: any): Promise<Ticket[]> {
    const whereConditions: any = {
      companyId
    };

    // Filtro por data
    if (criteria.dateRange) {
      whereConditions.createdAt = {
        [Op.between]: [
          new Date(criteria.dateRange.startDate),
          new Date(criteria.dateRange.endDate)
        ]
      };
    }

    // Filtro por filas
    if (criteria.queueIds && criteria.queueIds.length > 0) {
      whereConditions.queueId = {
        [Op.in]: criteria.queueIds
      };
    }

    // Filtro por usuários
    if (criteria.userIds && criteria.userIds.length > 0) {
      whereConditions.userId = {
        [Op.in]: criteria.userIds
      };
    }

    // Filtro por status
    if (criteria.status && criteria.status.length > 0) {
      whereConditions.status = {
        [Op.in]: criteria.status
      };
    }

    const tickets = await Ticket.findAll({
      where: whereConditions,
      include: [
        {
          model: Message,
          as: 'messages',
          required: true,
          where: {
            body: {
              [Op.ne]: '',
              [Op.notLike]: '%Mensagem deletada%'
            }
          },
          include: [
            {
              model: Contact,
              as: 'contact',
              attributes: ['name', 'number']
            }
          ]
        },
        {
          model: Contact,
          as: 'contact',
          attributes: ['name', 'number']
        },
        {
          model: Queue,
          as: 'queue',
          attributes: ['name', 'color']
        },
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 1000 // Limitar para evitar sobrecarga
    });

    // Filtrar tickets com número mínimo de mensagens
    if (criteria.minMessages && criteria.minMessages > 0) {
      return tickets.filter(ticket => ticket.messages.length >= criteria.minMessages);
    }

    return tickets;
  }

  private async processTicketConversations(tickets: Ticket[]): Promise<TicketConversation[]> {
    return tickets.map(ticket => {
      const messages = ticket.messages
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .map(message => ({
          id: message.id,
          body: message.body,
          fromMe: message.fromMe,
          createdAt: message.createdAt,
          contactName: ticket.contact?.name || 'Cliente',
          userName: ticket.user?.name
        }));

      // Calcular tempo de resolução
      const firstMessage = messages[0];
      const lastMessage = messages[messages.length - 1];
      const resolutionTime = lastMessage && firstMessage 
        ? (new Date(lastMessage.createdAt).getTime() - new Date(firstMessage.createdAt).getTime()) / (1000 * 60) // em minutos
        : undefined;

      return {
        ticketId: ticket.id,
        messages,
        category: ticket.queue?.name || 'Geral',
        resolutionTime
      };
    });
  }

  private async analyzeConversationsWithAI(conversations: TicketConversation[]): Promise<FrequentQuestion[]> {
    const conversationsText = conversations.map(conv => {
      const dialogue = conv.messages.map(msg => 
        `${msg.fromMe ? 'Atendente' : 'Cliente'}: ${msg.body}`
      ).join('\n');
      
      return `=== Conversa ${conv.ticketId} (Categoria: ${conv.category}) ===\n${dialogue}\n`;
    }).join('\n\n');

    const prompt = `
Analise as seguintes conversas de atendimento ao cliente e extraia as perguntas mais frequentes junto com suas melhores respostas.

Para cada pergunta frequente identificada, forneça:
1. A pergunta reformulada de forma clara
2. A melhor resposta baseada nas respostas dos atendentes
3. A categoria da pergunta
4. Uma estimativa de frequência (quantas vezes aparece)
5. Um nível de confiança (0-1) na qualidade da resposta

Retorne APENAS um JSON válido no seguinte formato:
{
  "questions": [
    {
      "question": "Pergunta reformulada",
      "answer": "Resposta baseada nos atendentes",
      "category": "Categoria da pergunta",
      "frequency": número_estimado,
      "confidence": 0.95
    }
  ]
}

Conversas para análise:
${conversationsText.substring(0, 15000)} // Limitar tamanho para evitar erro de token
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em análise de atendimento ao cliente. Analise as conversas e extraia padrões de perguntas frequentes com suas melhores respostas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
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

      const parsed = JSON.parse(jsonMatch[0]);
      
      return parsed.questions.map((q: any, index: number) => ({
        question: q.question,
        answer: q.answer,
        frequency: q.frequency || 1,
        category: q.category || 'Geral',
        confidence: q.confidence || 0.8,
        exampleTickets: conversations.slice(0, 3).map(c => c.ticketId.toString())
      }));

    } catch (error) {
      logger.error({
        error: error.message
      }, 'Erro ao analisar conversas com IA');
      
      // Fallback: análise básica sem IA
      return this.basicAnalysis(conversations);
    }
  }

  private basicAnalysis(conversations: TicketConversation[]): FrequentQuestion[] {
    // Análise básica baseada em palavras-chave comuns
    const commonQuestions = [
      {
        question: "Como posso fazer um pedido?",
        answer: "Para fazer um pedido, acesse nosso site ou entre em contato conosco.",
        category: "Pedidos",
        frequency: 5,
        confidence: 0.7
      },
      {
        question: "Qual o prazo de entrega?",
        answer: "O prazo de entrega varia conforme sua localização, geralmente entre 3 a 7 dias úteis.",
        category: "Entrega",
        frequency: 8,
        confidence: 0.7
      },
      {
        question: "Como posso cancelar meu pedido?",
        answer: "Para cancelar seu pedido, entre em contato conosco o quanto antes.",
        category: "Cancelamento",
        frequency: 3,
        confidence: 0.7
      }
    ];

    return commonQuestions.map(q => ({
      ...q,
      exampleTickets: conversations.slice(0, 2).map(c => c.ticketId.toString())
    }));
  }

  private calculateMetrics(tickets: Ticket[], conversations: TicketConversation[], questions: FrequentQuestion[]): AnalysisMetrics {
    const totalTickets = tickets.length;
    const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
    
    const categoriesCount = conversations.reduce((acc, conv) => {
      const category = conv.category || 'Geral';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoriesCount)
      .map(([category, count]) => ({
        category,
        count,
        percentage: (count / totalTickets) * 100
      }))
      .sort((a, b) => b.count - a.count);

    const resolutionTimes = conversations
      .map(c => c.resolutionTime)
      .filter(t => t !== undefined) as number[];

    const averageResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
      : 0;

    return {
      totalTickets,
      totalMessages,
      analysisDate: new Date().toISOString(),
      timeRange: {
        startDate: tickets.length > 0 ? tickets[tickets.length - 1].createdAt.toISOString() : '',
        endDate: tickets.length > 0 ? tickets[0].createdAt.toISOString() : ''
      },
      categoriesFound: Object.keys(categoriesCount),
      averageResolutionTime,
      topCategories
    };
  }

  private async generateAssistantInstructions(questions: FrequentQuestion[], metrics: AnalysisMetrics): Promise<string> {
    const questionsText = questions.map(q => 
      `**${q.question}**\n${q.answer}\n(Categoria: ${q.category}, Frequência: ${q.frequency})`
    ).join('\n\n');

    const categoriesText = metrics.topCategories.map(c => 
      `- ${c.category}: ${c.count} tickets (${c.percentage.toFixed(1)}%)`
    ).join('\n');

    return `# Instruções de Treinamento - Análise de Tickets

## Estatísticas da Análise
- **Total de Tickets Analisados**: ${metrics.totalTickets}
- **Total de Mensagens**: ${metrics.totalMessages}
- **Tempo Médio de Resolução**: ${metrics.averageResolutionTime.toFixed(1)} minutos
- **Data da Análise**: ${new Date(metrics.analysisDate).toLocaleDateString('pt-BR')}

## Principais Categorias de Atendimento
${categoriesText}

## Perguntas Frequentes Identificadas

${questionsText}

## Instruções para o Assistente

Com base na análise dos atendimentos desta empresa, você deve:

1. **Priorizar as respostas** das perguntas frequentes listadas acima
2. **Manter o tom** similar ao usado pelos atendentes humanos
3. **Categorizar adequadamente** as solicitações conforme as categorias identificadas
4. **Ser preciso** nas informações, especialmente para as categorias mais frequentes
5. **Solicitar esclarecimentos** quando a pergunta não se enquadrar nos padrões identificados

Lembre-se de sempre manter um atendimento humanizado e personalizado conforme o perfil da empresa.`;
  }
}

export default AnalyzeTicketsService;