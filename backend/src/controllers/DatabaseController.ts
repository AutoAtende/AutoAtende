// controllers/DatabaseNodeController.ts
import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";
import GetDatabaseNodeService from "../services/FlowBuilderService/GetDatabaseNodeService";
import SaveDatabaseNodeService from "../services/FlowBuilderService/SaveDatabaseNodeService";
import TestDatabaseConnectionService from "../services/FlowBuilderService/TestDatabaseConnectionService";
import ExecuteDatabaseOperationService from "../services/FlowBuilderService/ExecuteDatabaseOperationService";

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