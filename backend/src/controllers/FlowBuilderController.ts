import { Request, Response } from "express";
import { getIO } from "../libs/optimizedSocket";
import { logger } from "../utils/logger";
import * as FlowBuilderService from "../services/FlowBuilderService";
import AppError from "../errors/AppError";
import FlowBuilder from "../models/FlowBuilder";
import InternalMessageNode from "../models/InternalMessageNode";
import GetDefaultWhatsApp from "../helpers/GetDefaultWhatsApp";
import GetDatabaseNodeService from "../services/FlowBuilderService/GetDatabaseNodeService";
import SaveDatabaseNodeService from "../services/FlowBuilderService/SaveDatabaseNodeService";
import TestDatabaseConnectionService from "../services/FlowBuilderService/TestDatabaseConnectionService";
import ExecuteDatabaseOperationService from "../services/FlowBuilderService/ExecuteDatabaseOperationService";
import GetInactivityNodeService from "../services/FlowBuilderService/GetInactivityNodeService";
import SaveInactivityNodeService from "../services/FlowBuilderService/SaveInactivityNodeService";
import { Op } from "sequelize";
import fs from "fs";
import path from "path";

interface InactivityNodeData {
  nodeId: string;
  flowId: number;
  label?: string;
  timeout: number;
  action: string;
  warningMessage?: string;
  endMessage?: string;
  transferQueueId?: number;
  maxWarnings?: number;
  warningInterval?: number;
}

// Controller para nós de menu
export const getMenuNodeData = async (req: Request, res: Response): Promise<Response> => {
  const { nodeId } = req.params;
  const { companyId } = req.user;
  
  try {
    const menuNode = await FlowBuilderService.GetMenuNodeService({
      nodeId,
      companyId
    });
    
    return res.status(200).json(menuNode);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    logger.error(`Erro ao buscar dados do menu: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const saveMenuNodeData = async (req: Request, res: Response): Promise<Response> => {
  const { nodeId } = req.params;
  const { companyId } = req.user;
  const menuData = req.body;
  
  try {
    const menuNode = await FlowBuilderService.SaveMenuNodeService({
      ...menuData,
      nodeId,
      companyId
    });
    
    return res.status(200).json(menuNode);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    logger.error(`Erro ao salvar dados do menu: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

// Controller para nós OpenAI
export const getOpenAINodeData = async (req: Request, res: Response): Promise<Response> => {
  const { nodeId } = req.params;
  const { companyId } = req.user;
  
  try {
    const openaiNode = await FlowBuilderService.GetOpenAINodeService({
      nodeId,
      companyId
    });
    
    return res.status(200).json(openaiNode);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    logger.error(`Erro ao buscar dados do OpenAI: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const saveOpenAINodeData = async (req: Request, res: Response): Promise<Response> => {
  const { nodeId } = req.params;
  const { companyId } = req.user;
  const openaiData = req.body;
  
  try {
    const openaiNode = await FlowBuilderService.SaveOpenAINodeService({
      ...openaiData,
      nodeId,
      companyId
    });
    
    return res.status(200).json(openaiNode);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    logger.error(`Erro ao salvar dados do OpenAI: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const getAvailableAttendants = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  
  try {
    const users = await FlowBuilderService.GetAvailableAttendantsService({
      companyId
    });
    
    return res.status(200).json({ users });
  } catch (error) {
    logger.error(`Erro ao buscar atendentes disponíveis: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as Record<string, string>;
  const { companyId } = req.user;

  try {
    const { flows, count, hasMore } = await FlowBuilderService.ListFlowBuildersService({
      searchParam,
      pageNumber,
      companyId
    });

    return res.status(200).json({ flows, count, hasMore });
  } catch (error) {
    logger.error(`Erro ao listar fluxos: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const flowData = req.body;

  try {
    const flow = await FlowBuilderService.CreateFlowBuilderService({
      ...flowData,
      companyId
    });

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit("flow", {
      action: "create",
      flow
    });

    return res.status(201).json(flow);
  } catch (error) {
    logger.error(`Erro ao criar fluxo: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    const flow = await FlowBuilderService.ShowFlowBuilderService(id, companyId);
    return res.status(200).json(flow);
  } catch (error) {
    logger.error(`Erro ao buscar fluxo: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const flowData = req.body;
  const { companyId } = req.user;

  try {
    const flow = await FlowBuilderService.UpdateFlowBuilderService({
      flowData,
      flowId: id,
      companyId
    });

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit("flow", {
      action: "update",
      flow
    });

    return res.status(200).json(flow);
  } catch (error) {
    logger.error(`Erro ao atualizar fluxo: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    await FlowBuilderService.DeleteFlowBuilderService(id, companyId);

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit("flow", {
      action: "delete",
      flowId: id
    });

    return res.status(200).json({ message: "Fluxo removido com sucesso" });
  } catch (error) {
    logger.error(`Erro ao remover fluxo: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const execute = async (req: Request, res: Response): Promise<Response> => {
  const { flowId, contactId, initialNodeId, initialVariables, whatsappId } = req.body;
  const { companyId } = req.user;

  try {
    // Usar o whatsappId fornecido ou tentar obter o padrão
    const whatsappToUse = whatsappId || await GetDefaultWhatsApp(companyId);

    const execution = await FlowBuilderService.ExecuteFlowBuilderService({
      flowId,
      contactId,
      companyId,
      wbotId: whatsappToUse,
      initialNodeId,
      initialVariables,
      whatsappId: whatsappToUse
    });

    return res.status(200).json(execution);
  } catch (error) {
    logger.error(`Erro ao executar fluxo: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const activate = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { active } = req.body;
  const { companyId } = req.user;

  try {
    const flow = await FlowBuilderService.ActivateFlowBuilderService(id, companyId, active);

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit("flow", {
      action: "update",
      flow
    });

    return res.status(200).json(flow);
  } catch (error) {
    logger.error(`Erro ao ativar/desativar fluxo: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const updateVariable = async (req: Request, res: Response): Promise<Response> => {
  const { executionId, variable, value } = req.body;
  const { companyId } = req.user;

  try {
    const execution = await FlowBuilderService.UpdateFlowVariableService({
      executionId,
      variable,
      value,
      companyId
    });

    return res.status(200).json(execution);
  } catch (error) {
    logger.error(`Erro ao atualizar variável: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

// Controller para nós Typebot
export const getTypebotNodeData = async (req: Request, res: Response): Promise<Response> => {
  const { nodeId } = req.params;
  const { companyId } = req.user;
  
  try {
    const typebotNode = await FlowBuilderService.GetTypebotNodeService({
      nodeId,
      companyId
    });
    
    return res.status(200).json(typebotNode);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    logger.error(`Erro ao buscar dados do Typebot: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const saveTypebotNodeData = async (req: Request, res: Response): Promise<Response> => {
  const { nodeId } = req.params;
  const { companyId } = req.user;
  const typebotData = req.body;
  
  try {
    const typebotNode = await FlowBuilderService.SaveTypebotNodeService({
      ...typebotData,
      nodeId,
      companyId
    });
    
    return res.status(200).json(typebotNode);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    logger.error(`Erro ao salvar dados do Typebot: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const exportFlow = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    const flow = await FlowBuilder.findOne({
      where: { id, companyId }
    });

    if (!flow) {
      throw new AppError("Fluxo não encontrado");
    }

    // Preparar o objeto de exportação
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      flow: {
        name: flow.name,
        description: flow.description,
        nodes: flow.nodes,
        edges: flow.edges
      }
    };

    // Configurar o cabeçalho para download do arquivo
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="flow-${flow.id}.json"`);

    return res.status(200).json(exportData);
  } catch (error) {
    logger.error(`Erro ao exportar fluxo: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const importFlow = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  try {
    if (!req.file) {
      throw new AppError("Nenhum arquivo enviado");
    }

    // Usar a pasta e nome de arquivo já definidos pelo upload.ts
    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    let importedData;
    
    try {
      importedData = JSON.parse(fileContent);
    } catch (e) {
      throw new AppError("Formato de arquivo inválido");
    }

    // Verificar a estrutura do arquivo
    if (!importedData.flow || !importedData.flow.nodes || !importedData.flow.edges) {
      throw new AppError("Estrutura do arquivo de importação inválida");
    }

    // Criar o novo fluxo
    const newFlow = await FlowBuilder.create({
      name: `${importedData.flow.name || 'Fluxo Importado'} (importado)`,
      description: importedData.flow.description || '',
      nodes: importedData.flow.nodes,
      edges: importedData.flow.edges,
      active: false, // Sempre inicia inativo para evitar conflitos
      companyId
    });

    // Não é necessário limpar o arquivo pois ele está na pasta pública

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit("flow", {
      action: "create",
      flow: newFlow
    });

    return res.status(201).json(newFlow);
  } catch (error) {
    logger.error(`Erro ao importar fluxo: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const duplicateFlow = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    // Buscar o fluxo original
    const originalFlow = await FlowBuilder.findOne({
      where: { id, companyId }
    });

    if (!originalFlow) {
      throw new AppError("Fluxo não encontrado");
    }

    // Criar um clone com nome modificado
    const newFlow = await FlowBuilder.create({
      name: `${originalFlow.name} (cópia)`,
      description: originalFlow.description,
      nodes: originalFlow.nodes,
      edges: originalFlow.edges,
      active: false, // Sempre inicia inativo para evitar conflitos
      companyId
    });

    return res.status(201).json(newFlow);
  } catch (error) {
    logger.error(`Erro ao duplicar fluxo: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const uploadMedia = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    
    // Verificar se o arquivo foi enviado
    if (!req.file) {
      logger.error('Erro no upload: arquivo não recebido');
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }
    
    // Log detalhado do arquivo recebido
    const { filename, path: filePath, mimetype, size, originalname } = req.file;
    logger.info(`Arquivo recebido: ${filename}, nome original: ${originalname}, mimetype: ${mimetype}, tamanho: ${size} bytes`);
    
    // Verificar tamanho (máximo 16MB)
    if (size > 16 * 1024 * 1024) {
      logger.error(`Arquivo muito grande: ${size} bytes`);
      return res.status(400).json({ error: "O arquivo é muito grande. O tamanho máximo é 16MB." });
    }
    
    // Obter o tipo de mídia do corpo da requisição
    let mediaType = req.body.mediaType || 'file';
    
    // Verificar existência do arquivo
    if (!fs.existsSync(filePath)) {
      logger.error(`Arquivo não encontrado no caminho: ${filePath}`);
      return res.status(500).json({ error: "Falha ao processar o arquivo: arquivo não encontrado no servidor" });
    }
    
    // Determinar automaticamente o tipo de mídia baseado no mimetype, se necessário
    if (!mediaType || mediaType === 'auto') {
      if (mimetype.startsWith('image/')) {
        mediaType = 'image';
      } else if (mimetype.startsWith('audio/')) {
        mediaType = 'audio';
      } else if (mimetype.startsWith('video/')) {
        mediaType = 'video';
      } else {
        mediaType = 'file';
      }
    }
    
    // Construir a URL correta considerando o diretório do flowBuilder
    const baseUrl = process.env.BACKEND_URL || '';
    const fixedBaseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    
    const mediaUrl = `${fixedBaseUrl}public/company${companyId}/flowBuilder/${filename}`;
    
    // Log detalhado para facilitar depuração
    logger.info(`FlowBuilder: Mídia enviada: ${filename} (${mimetype}, ${(size / 1024 / 1024).toFixed(2)}MB) - Tipo: ${mediaType} - Empresa: ${companyId} - URL: ${mediaUrl}`);
    
    // Retornar dados do arquivo processado
    return res.status(200).json({
      url: mediaUrl,
      filename: originalname || filename,
      mimetype,
      mediaType,
      size,
      extension: path.extname(filename).substring(1)
    });
  } catch (error) {
    logger.error(`Erro ao fazer upload de mídia para FlowBuilder: ${error.message}`);
    logger.error(error.stack);
    return res.status(500).json({ error: error.message });
  }
};

export const checkMedia = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { mediaUrl } = req.query;
    const { companyId } = req.user;
    
    if (!mediaUrl || typeof mediaUrl !== 'string') {
      return res.status(400).json({ error: "URL da mídia é obrigatória" });
    }
    
    // Remover eventuais parâmetros da URL
    const cleanUrl = mediaUrl.split('?')[0];
    
    // Verificar se é uma URL local
    if (!cleanUrl.startsWith('/')) {
      return res.status(400).json({ error: "Apenas URLs locais são suportadas" });
    }
    
    // Construir o caminho completo do arquivo
    const mediaPath = path.resolve(
      'public',
      cleanUrl.replace(/^\/public\//, '')
    );
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(mediaPath)) {
      return res.status(404).json({ error: "Arquivo não encontrado" });
    }
    
    // Obter informações do arquivo
    const stats = fs.statSync(mediaPath);
    const fileSize = stats.size;
    const fileExtension = path.extname(mediaPath).substring(1).toLowerCase();
    const mimeType = require('mime-types').lookup(fileExtension) || 'application/octet-stream';
    
    // Determinar o tipo de mídia
    let mediaType = 'file';
    if (mimeType.startsWith('image/')) {
      mediaType = 'image';
    } else if (mimeType.startsWith('audio/')) {
      mediaType = 'audio';
    } else if (mimeType.startsWith('video/')) {
      mediaType = 'video';
    }
    
    return res.status(200).json({
      url: cleanUrl,
      filename: path.basename(mediaPath),
      mimetype: mimeType,
      mediaType,
      size: fileSize,
      sizeFormatted: `${(fileSize / 1024 / 1024).toFixed(2)}MB`,
      extension: fileExtension
    });
  } catch (error) {
    logger.error(`Erro ao verificar mídia: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const getMediaFormats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const allowedFormats = {
      image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      audio: ['mp3', 'ogg', 'wav', 'aac'],
      video: ['mp4', '3gp', 'mov', 'avi'],
      file: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip']
    };
    
    const defaultLimits = {
      image: 5 * 1024 * 1024, // 5MB
      audio: 10 * 1024 * 1024, // 10MB
      video: 16 * 1024 * 1024, // 16MB
      file: 10 * 1024 * 1024 // 10MB
    };
    
    return res.status(200).json({
      allowedFormats,
      defaultLimits,
      globalMaxSize: 16 * 1024 * 1024 // 16MB
    });
  } catch (error) {
    logger.error(`Erro ao obter formatos de mídia: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

// Controller para nós de atendente
export const getAttendantNodeData = async (req: Request, res: Response): Promise<Response> => {
  const { nodeId } = req.params;
  const { companyId } = req.user;
  
  try {
    const attendantNode = await FlowBuilderService.GetAttendantNodeService({
      nodeId,
      companyId
    });
    
    return res.status(200).json(attendantNode);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    logger.error(`Erro ao buscar dados do atendente: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};



export const saveAttendantNodeData = async (req: Request, res: Response): Promise<Response> => {
  const { nodeId } = req.params;
  const { companyId } = req.user;
  const attendantData = req.body;
  
  try {
    const attendantNode = await FlowBuilderService.SaveAttendantNodeService({
      ...attendantData,
      nodeId,
      companyId
    });
    
    return res.status(200).json(attendantNode);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    logger.error(`Erro ao salvar dados do atendente: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const getScheduleNodeData = async (req: Request, res: Response): Promise<Response> => {
  const { nodeId } = req.params;
  const { companyId } = req.user;
  
  try {
    const scheduleNode = await FlowBuilderService.GetScheduleNodeService({
      nodeId,
      companyId
    });
    
    return res.status(200).json(scheduleNode);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    logger.error(`Erro ao buscar dados do nó de verificação de horário: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const saveScheduleNodeData = async (req: Request, res: Response): Promise<Response> => {
  const { nodeId } = req.params;
  const { companyId } = req.user;
  const scheduleData = req.body;
  
  try {
    const scheduleNode = await FlowBuilderService.SaveScheduleNodeService({
      ...scheduleData,
      nodeId,
      companyId
    });
    
    return res.status(200).json(scheduleNode);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    logger.error(`Erro ao salvar dados do nó de verificação de horário: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const updateMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Validar a entrada
    if (!name) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }
    
    // Buscar o fluxo existente com todos os dados
    const flow = await FlowBuilderService.ShowFlowBuilderService(id, req.user.companyId);
    
    if (!flow) {
      return res.status(404).json({ error: "Fluxo não encontrado" });
    }
    
    // Verificar permissão (fluxo pertence à empresa do usuário)
    if (flow.companyId !== req.user.companyId) {
      return res.status(403).json({ error: "Sem permissão para editar este fluxo" });
    }
    
    // Preparar os dados para atualização, mantendo os nós e arestas existentes
    const flowData = {
      name: name,
      description: description !== undefined ? description : flow.description,
      nodes: flow.nodes,
      edges: flow.edges,
      active: flow.active
    };

    // Atualizar o fluxo preservando todos os dados
    const updatedFlow = await FlowBuilderService.UpdateFlowBuilderService({
      flowData: flowData, 
      flowId: flow.id, 
      companyId: req.user.companyId
    });
    
    return res.status(200).json({
      id: updatedFlow.id,
      name: updatedFlow.name,
      description: updatedFlow.description,
      updatedAt: updatedFlow.updatedAt
    });
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao atualizar metadados do fluxo" });
  }
};

export const getAppointmentNodeData = async (req: Request, res: Response): Promise<Response> => {
  const { nodeId } = req.params;
  const { companyId } = req.user;
  
  try {
    const appointmentNode = await FlowBuilderService.GetAppointmentNodeService({
      nodeId,
      companyId
    });
    
    return res.status(200).json(appointmentNode);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    logger.error(`Erro ao buscar dados do agendamento: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const saveAppointmentNodeData = async (req: Request, res: Response): Promise<Response> => {
  const { nodeId } = req.params;
  const { companyId } = req.user;
  const appointmentData = req.body;
  
  try {
    const appointmentNode = await FlowBuilderService.SaveAppointmentNodeService({
      ...appointmentData,
      nodeId,
      companyId
    });
    
    return res.status(200).json(appointmentNode);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    logger.error(`Erro ao salvar dados do agendamento: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

// Controller para nós API
export const getApiNodeData = async (req: Request, res: Response): Promise<Response> => {
  const { nodeId } = req.params;
  const { companyId } = req.user;
  
  try {
    const apiNode = await FlowBuilderService.GetApiNodeService({
      nodeId,
      companyId
    });
    
    return res.status(200).json(apiNode);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    logger.error(`Erro ao buscar dados do nó API: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const saveApiNodeData = async (req: Request, res: Response): Promise<Response> => {
  const { nodeId } = req.params;
  const { companyId } = req.user;
  const apiData = req.body;
  
  try {
    const apiNode = await FlowBuilderService.SaveApiNodeService({
      ...apiData,
      nodeId,
      companyId
    });
    
    return res.status(200).json(apiNode);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    logger.error(`Erro ao salvar dados do nó API: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const testApiRequest = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  
  try {
    const result = await FlowBuilderService.TestApiRequestService({
      ...req.body,
      companyId
    });
    
    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Erro ao testar requisição API: ${error.message}`);
    return res.status(500).json({ 
      success: false,
      message: error.message,
      data: null,
      headers: null
    });
  }
};

// Controller para nós de webhook
export const getWebhookNodeData = async (req: Request, res: Response): Promise<Response> => {
  const { nodeId } = req.params;
  const { companyId } = req.user;
  
  try {
    // Importar o service dinamicamente
    const { GetWebhookNodeService } = require("../services/FlowBuilderService");
    
    const webhookNode = await GetWebhookNodeService({
      nodeId,
      companyId
    });
    
    return res.status(200).json(webhookNode);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    logger.error(`Erro ao buscar dados do webhook: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const saveWebhookNodeData = async (req: Request, res: Response): Promise<Response> => {
  const { nodeId } = req.params;
  const { companyId } = req.user;
  const webhookData = req.body;
  
  try {
    // Importar o service dinamicamente
    const { SaveWebhookNodeService } = require("../services/FlowBuilderService");
    
    const webhookNode = await SaveWebhookNodeService({
      ...webhookData,
      nodeId,
      companyId
    });
    
    return res.status(200).json(webhookNode);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    logger.error(`Erro ao salvar dados do webhook: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const routeTestWebhookRequest = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  
  try {
    // Importar o service
    const { TestWebhookNodeService } = require("../services/FlowBuilderService");
    
    const { url, method, headers, body } = req.query;
    
    // Preparar dados para o teste
    const testData = {
      url: url as string,
      method: (method as string) || 'GET',
      headers: headers ? JSON.parse(headers as string) : undefined,
      body: body ? JSON.parse(body as string) : undefined,
      companyId
    };
    
    // Executar o teste
    const result = await TestWebhookNodeService(testData);
    
    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Erro ao testar webhook: ${error.message}`);
    
    if (error instanceof AppError) {
      return res.status(400).json({
        success: false,
        message: error.message,
        data: null,
        headers: null
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Erro interno ao testar webhook",
      data: null,
      headers: null
    });
  }
};

export const getDatabaseNodeData = async (req: Request, res: Response): Promise<Response> => {
  const { nodeId } = req.params;
  const { companyId } = req.user;
  
  try {
    const databaseNode = await GetDatabaseNodeService({
      nodeId,
      companyId
    });
    
    return res.status(200).json(databaseNode);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    logger.error(`Erro ao buscar dados do nó de banco de dados: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const saveDatabaseNodeData = async (req: Request, res: Response): Promise<Response> => {
  const { nodeId } = req.params;
  const { companyId } = req.user;
  const nodeData = req.body;
  
  try {
    const databaseNode = await SaveDatabaseNodeService({
      ...nodeData,
      nodeId,
      companyId
    });
    
    return res.status(200).json(databaseNode);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    logger.error(`Erro ao salvar dados do nó de banco de dados: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const testDatabaseConnection = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const testData = req.body;
  
  try {
    const result = await TestDatabaseConnectionService({
      ...testData,
      companyId
    });
    
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ 
        success: false, 
        message: error.message,
        status: error.statusCode || 500
      });
    }
    
    logger.error(`Erro ao testar conexão com banco de dados: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      message: error.message,
      status: 500
    });
  }
};

export const executeDatabaseOperation = async (req: Request, res: Response): Promise<Response> => {
  const { nodeId } = req.params;
  const { companyId } = req.user;
  const { executionId, variables } = req.body;
  
  try {
    const result = await ExecuteDatabaseOperationService({
      nodeId,
      companyId,
      executionId,
      variables
    });
    
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ 
        success: false, 
        error: error.message,
        status: error.statusCode || 500
      });
    }
    
    logger.error(`Erro ao executar operação no banco de dados: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      status: 500 
    });
  }
};

export const getInactivityNodeData = async (req: Request, res: Response): Promise<Response> => {
  const { nodeId } = req.params;
  const { companyId } = req.user;
  
  try {
    const inactivityNode = await FlowBuilderService.GetInactivityNodeService({
      nodeId,
      companyId
    });
    
    return res.status(200).json(inactivityNode);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    logger.error(`Erro ao buscar dados do nó de inatividade: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const saveInactivityNodeData = async (req: Request, res: Response): Promise<Response> => {
  const { nodeId } = req.params;
  const { companyId } = req.user;
  const inactivityData = req.body;
  
  try {
    const inactivityNode = await FlowBuilderService.SaveInactivityNodeService({
      ...inactivityData,
      nodeId,
      companyId
    });
    
    return res.status(200).json(inactivityNode);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    logger.error(`Erro ao salvar dados do nó de inatividade: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

// Controller para nós de mensagem interna
export const getInternalMessageNodeData = async (req: Request, res: Response): Promise<Response> => {
  const { nodeId } = req.params;
  const { companyId } = req.user;
  
  try {
    const internalMessageNode = await FlowBuilderService.GetInternalMessageNodeService({
      nodeId,
      companyId
    });
    
    // Log para depuração
    logger.info(`Obtendo dados do nó de mensagem interna ${nodeId}: ${JSON.stringify(internalMessageNode)}`);
    
    return res.status(200).json(internalMessageNode);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    logger.error(`Erro ao buscar dados do nó de mensagem interna: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const saveInternalMessageNodeData = async (req: Request, res: Response): Promise<Response> => {
  const { nodeId } = req.params;
  const { companyId } = req.user;
  const internalMessageData = req.body;
  
  try {
    // Verificar se o flowId está presente, caso contrário, tentar obter do banco de dados
    if (!internalMessageData.flowId) {
      // Buscar flowId baseado no nodeId de um nó existente
      const existingNode = await InternalMessageNode.findOne({
        where: { nodeId, companyId }
      });
      
      if (existingNode && existingNode.flowId) {
        internalMessageData.flowId = existingNode.flowId;
      } else {
        // Tenta obter o flowId a partir dos nós do fluxo em execução
        // Isso depende da implementação específica do seu sistema
        logger.warn(`Não foi possível obter flowId para o nó ${nodeId}`);
      }
    }
    
    // Garantir que a mensagem não seja undefined
    if (internalMessageData.message === undefined) {
      internalMessageData.message = '';
    }
    
    // Log para depuração
    logger.info(`Salvando nó de mensagem interna: ${nodeId}, flowId: ${internalMessageData.flowId}, mensagem: ${internalMessageData.message?.substring(0, 50)}...`);
    
    const internalMessageNode = await FlowBuilderService.SaveInternalMessageNodeService({
      ...internalMessageData,
      nodeId,
      companyId
    });
    
    return res.status(200).json(internalMessageNode);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    logger.error(`Erro ao salvar dados do nó de mensagem interna: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};