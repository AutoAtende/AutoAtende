// controllers/InactivityNodeController.ts
import { Request, Response } from "express";
import AppError from "../errors/AppError";
import GetInactivityNodeService from "../services/FlowBuilderService/GetInactivityNodeService";
import SaveInactivityNodeService from "../services/FlowBuilderService/SaveInactivityNodeService";
import { logger } from "../utils/logger";

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

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { nodeId } = req.params;
  
  try {
    const inactivityNode = await GetInactivityNodeService({
      nodeId,
      companyId
    });
    
    return res.status(200).json(inactivityNode);
  } catch (error) {
    logger.error(`[InactivityNode] Erro ao buscar nó: ${error.message}`);
    throw new AppError(error.message);
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const inactivityNodeData: InactivityNodeData = req.body;
  
  try {
    const inactivityNode = await SaveInactivityNodeService({
      ...inactivityNodeData,
      companyId
    });
    
    return res.status(200).json(inactivityNode);
  } catch (error) {
    logger.error(`[InactivityNode] Erro ao salvar nó: ${error.message}`);
    throw new AppError(error.message);
  }
};