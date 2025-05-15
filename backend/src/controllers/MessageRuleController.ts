import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";

import { ListMessageRulesService } from "../services/MessageRuleService/ListMessageRulesService";
import { CreateMessageRuleService } from "../services/MessageRuleService/CreateMessageRuleService";
import { ShowMessageRuleService } from "../services/MessageRuleService/ShowMessageRuleService";
import { UpdateMessageRuleService } from "../services/MessageRuleService/UpdateMessageRuleService";
import { DeleteMessageRuleService } from "../services/MessageRuleService/DeleteMessageRuleService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber, pageSize, active } = req.query;
  const { companyId } = req.user;

  try {
    const { messageRules, count, hasMore } = await ListMessageRulesService({
      searchParam: searchParam as string,
      pageNumber: pageNumber ? parseInt(pageNumber as string) : undefined,
      pageSize: pageSize ? parseInt(pageSize as string) : undefined,
      companyId,
      active: active === "true" ? true : active === "false" ? false : undefined
    });

    return res.status(200).json({ messageRules, count, hasMore });
  } catch (err) {
    logger.error(`Erro ao listar regras de mensagem: ${err}`);
    throw new AppError("Erro ao listar regras de mensagem", 500);
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const body = req.body;
  const messageRuleData = {
    ...body,
    companyId,
    userId: body.userId === "" ? null : body.userId ? Number(body.userId) : null,
    queueId: body.queueId === "" ? null : body.queueId ? Number(body.queueId) : null,
    whatsappId: body.whatsappId === "" ? null : body.whatsappId ? Number(body.whatsappId) : null
  };

  try {
    const messageRule = await CreateMessageRuleService(messageRuleData);

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`)
      .emit(`company-${companyId}-messageRule`, {
        action: "create",
        messageRule
      });

    return res.status(201).json(messageRule);
  } catch (err) {
    logger.error(`Erro ao criar regra de mensagem: ${err}`);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Erro ao criar regra de mensagem", 500);
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { messageRuleId } = req.params;
  const { companyId } = req.user;

  try {
    const messageRule = await ShowMessageRuleService(messageRuleId, companyId);
    return res.status(200).json(messageRule);
  } catch (err) {
    logger.error(`Erro ao buscar regra de mensagem: ${err}`);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Erro ao buscar regra de mensagem", 500);
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { messageRuleId } = req.params;
  const { companyId } = req.user;
  const messageRuleData = req.body;

  try {
    const messageRule = await UpdateMessageRuleService(
      messageRuleId,
      messageRuleData,
      companyId
    );

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`)
      .emit(`company-${companyId}-messageRule`, {
        action: "update",
        messageRule
      });

    return res.status(200).json(messageRule);
  } catch (err) {
    logger.error(`Erro ao atualizar regra de mensagem: ${err}`);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Erro ao atualizar regra de mensagem", 500);
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { messageRuleId } = req.params;
  const { companyId } = req.user;

  try {
    await DeleteMessageRuleService(messageRuleId, companyId);

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`)
      .emit(`company-${companyId}-messageRule`, {
        action: "delete",
        messageRuleId: +messageRuleId
      });

    return res.status(200).json({ message: "Regra de mensagem removida com sucesso" });
  } catch (err) {
    logger.error(`Erro ao remover regra de mensagem: ${err}`);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Erro ao remover regra de mensagem", 500);
  }
};

export const toggleActive = async (req: Request, res: Response): Promise<Response> => {
  const { messageRuleId } = req.params;
  const { companyId } = req.user;
  const { active } = req.body;

  try {
    const messageRule = await UpdateMessageRuleService(
      messageRuleId,
      { active },
      companyId
    );

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`)
      .emit(`company-${companyId}-messageRule`, {
        action: "update",
        messageRule
      });

    return res.status(200).json(messageRule);
  } catch (err) {
    logger.error(`Erro ao atualizar status da regra de mensagem: ${err}`);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Erro ao atualizar status da regra de mensagem", 500);
  }
};