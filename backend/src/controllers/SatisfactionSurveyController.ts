import { Request, Response } from 'express';
import * as Yup from 'yup';
import { Op, fn, col } from 'sequelize';
import User from '../models/User';
import Company from '../models/Company';
import SatisfactionSurvey from '../models/SatisfactionSurvey';
import AppError from '../errors/AppError';

interface ICompanyData {
  id: number;
  name: string;
  respostas: number;
  soma: {
    overallSatisfaction: number;
    atendimento: number;
    gerenciamento: number;
    whatsapp: number;
    tarefas: number;
    recursos: number;
    suporte: number;
  };
}

interface ICompanyRanking {
  id: number;
  nome: string;
  media: number;
  respostas: number;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  // Verifica se o usuário tem permissão (apenas super admin)
  const { id: userId } = req.user;
  
  if (Number(userId) !== 1) {
    throw new AppError('Acesso não autorizado', 403);
  }

  const surveys = await SatisfactionSurvey.findAll({
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      },
      {
        model: Company,
        as: 'company',
        attributes: ['id', 'name']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  return res.json(surveys);
};

export const summary = async (req: Request, res: Response): Promise<Response> => {
  // Verifica se o usuário tem permissão (apenas super admin)
  const { id: userId } = req.user;
  
  if (Number(userId) !== 1) {
    throw new AppError('Acesso não autorizado', 403);
  }

  // Busca todos os surveys da plataforma
  const surveys = await SatisfactionSurvey.findAll({
    include: [
      {
        model: Company,
        as: 'company',
        attributes: ['id', 'name']
      }
    ]
  });

  // Agrupa resultados por empresa para análise
  const companiesData: Record<number, ICompanyData> = {};
  const companiesList: Array<{id: number, name: string}> = [];
  
  surveys.forEach(survey => {
    const companyId = survey.companyId;
    const companyName = survey.company?.name || 'Desconhecida';
    
    if (!companiesData[companyId]) {
      companiesData[companyId] = {
        id: companyId,
        name: companyName,
        respostas: 0,
        soma: {
          overallSatisfaction: 0,
          atendimento: 0,
          gerenciamento: 0,
          whatsapp: 0,
          tarefas: 0,
          recursos: 0,
          suporte: 0
        }
      };
      companiesList.push({
        id: companyId,
        name: companyName
      });
    }
    
    companiesData[companyId].respostas++;
    companiesData[companyId].soma.overallSatisfaction += survey.overallSatisfaction || 0;
    companiesData[companyId].soma.atendimento += survey.atendimentoScore || 0;
    companiesData[companyId].soma.gerenciamento += survey.gerenciamentoScore || 0;
    companiesData[companyId].soma.whatsapp += survey.whatsappScore || 0;
    companiesData[companyId].soma.tarefas += survey.tarefasScore || 0;
    companiesData[companyId].soma.recursos += survey.recursosScore || 0;
    companiesData[companyId].soma.suporte += survey.suporteScore || 0;
  });

  // Calcular métricas gerais para toda a plataforma
  const summary = {
    companies: companiesList,
    totalRespostas: surveys.length,
    mediasGerais: {
      satisfacaoGeral: calcularMedia(surveys.map(s => s.overallSatisfaction)),
      atendimento: calcularMedia(surveys.map(s => s.atendimentoScore)),
      gerenciamento: calcularMedia(surveys.map(s => s.gerenciamentoScore)),
      whatsapp: calcularMedia(surveys.map(s => s.whatsappScore)),
      tarefas: calcularMedia(surveys.map(s => s.tarefasScore)),
      recursos: calcularMedia(surveys.map(s => s.recursosScore)),
      suporte: calcularMedia(surveys.map(s => s.suporteScore))
    },
    distribuicaoNotas: calcularDistribuicaoNotas(surveys),
    tendenciaTemporal: calcularTendenciaTemporal(surveys),
    empresasMaisSatisfeitas: calcularRankingEmpresas(companiesData, 'overallSatisfaction', 5),
    empresasMenosSatisfeitas: calcularRankingEmpresas(companiesData, 'overallSatisfaction', 5, true),
    taxaRecomendacao: calcularTaxaRecomendacao(surveys),
    principaisMelhorias: extrairPrincipaisMelhorias(surveys)
  };

  return res.json(summary);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const schema = Yup.object().shape({
    answers: Yup.object().required()
  });

  try {
    await schema.validate(req.body);
  } catch (err) {
    throw new AppError(err.message);
  }

  const { answers } = req.body;
  const { id: userId, companyId } = req.user;

  // Evita que a empresa 1 responda pesquisas
  if (Number(companyId) === 1) {
    throw new AppError('Empresa administradora não pode responder pesquisas');
  }

  // Verifica se o usuário já respondeu
  const existingSurvey = await SatisfactionSurvey.findOne({
    where: { userId }
  });

  if (existingSurvey) {
    throw new AppError('Você já respondeu esta pesquisa');
  }

  const survey = await SatisfactionSurvey.create({
    userId,
    companyId,
    answers
  });

  return res.status(201).json(survey);
};

export const check = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId } = req.user;

  const survey = await SatisfactionSurvey.findOne({
    where: { userId }
  });

  return res.json({ hasSubmitted: !!survey });
};

// Funções auxiliares
const calcularMedia = (valores: number[]): number => {
  if (valores.length === 0) return 0;
  const soma = valores.reduce((acc, val) => acc + (val || 0), 0);
  return Number((soma / valores.length).toFixed(2));
};

const calcularDistribuicaoNotas = (surveys: SatisfactionSurvey[]): Record<string, number> => {
  const distribuicao: Record<string, number> = {
    '1-2': 0,
    '3-4': 0,
    '5-6': 0,
    '7-8': 0,
    '9-10': 0
  };

  surveys.forEach(survey => {
    const nota = survey.overallSatisfaction;
    if (nota <= 2) distribuicao['1-2']++;
    else if (nota <= 4) distribuicao['3-4']++;
    else if (nota <= 6) distribuicao['5-6']++;
    else if (nota <= 8) distribuicao['7-8']++;
    else distribuicao['9-10']++;
  });

  return distribuicao;
};

const calcularTendenciaTemporal = (surveys: SatisfactionSurvey[]): any[] => {
  const tendencia = surveys
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map(survey => ({
      data: survey.createdAt,
      satisfacaoGeral: survey.overallSatisfaction
    }));

  return tendencia;
};

const calcularRankingEmpresas = (
  companiesData: Record<number, ICompanyData>, 
  metrica: keyof ICompanyData['soma'], 
  limite = 5, 
  reverso = false
): ICompanyRanking[] => {
  // Calcula médias para cada empresa
  const ranking: ICompanyRanking[] = Object.values(companiesData).map(company => {
    const media = company.soma[metrica] / company.respostas;
    return {
      id: company.id,
      nome: company.name,
      media: Number(media.toFixed(2)),
      respostas: company.respostas
    };
  });

  // Filtra apenas empresas com pelo menos 3 respostas para ser estatisticamente relevante
  const empresasRelevantes = ranking.filter(item => item.respostas >= 3);
  
  // Ordena pelo critério solicitado
  empresasRelevantes.sort((a, b) => reverso ? a.media - b.media : b.media - a.media);
  
  return empresasRelevantes.slice(0, limite);
};

interface INpsResult {
  nps: number;
  promotores: number;
  neutros: number;
  detratores: number;
}

const calcularTaxaRecomendacao = (surveys: SatisfactionSurvey[]): INpsResult => {
  // Calcula NPS (Net Promoter Score) baseado nas respostas de recomendação
  let promotores = 0;
  let neutros = 0;
  let detratores = 0;
  let total = 0;

  surveys.forEach(survey => {
    if (survey.answers?.recommend_likelihood) {
      const nota = Number(survey.answers.recommend_likelihood);
      if (nota >= 9) promotores++;
      else if (nota >= 7) neutros++;
      else detratores++;
      total++;
    }
  });

  if (total === 0) return { nps: 0, promotores: 0, detratores: 0, neutros: 0 };

  const nps = Math.round(((promotores - detratores) / total) * 100);
  
  return {
    nps,
    promotores: Math.round((promotores / total) * 100),
    neutros: Math.round((neutros / total) * 100),
    detratores: Math.round((detratores / total) * 100)
  };
};

interface ISugestao {
  tipo: 'atendimento' | 'geral';
  sugestao: string;
}

const extrairPrincipaisMelhorias = (surveys: SatisfactionSurvey[]): ISugestao[] => {
  // Extrai sugestões de melhorias dos comentários textuais
  const sugestoes: ISugestao[] = [];
  
  surveys.forEach(survey => {
    if (survey.answers?.chat_improvements) {
      sugestoes.push({
        tipo: 'atendimento',
        sugestao: String(survey.answers.chat_improvements)
      });
    }
    
    if (survey.answers?.general_feedback) {
      sugestoes.push({
        tipo: 'geral',
        sugestao: String(survey.answers.general_feedback)
      });
    }
  });
  
  return sugestoes.slice(0, 10); // Retorna as 10 sugestões mais recentes
};

export default {
  index,
  store,
  check,
  summary
};