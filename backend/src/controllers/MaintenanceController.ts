import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import Setting from "../models/Setting";
import { getIO } from "../libs/socket";
import { logger } from "../utils/logger";

interface MaintenanceData {
  enabled: boolean;
  message?: string;
  estimatedTime?: string;
}

export const toggleMaintenanceMode = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { user } = req;

  if (!user.isSuper) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { enabled } = req.body;

  try {
    // Se está desativando, remove as configurações de manutenção
    if (!enabled) {
      await Setting.destroy({
        where: {
          key: ["maintenance_mode", "maintenance_info"],
          companyId: 1
        }
      });

      const io = getIO();
      io.emit("maintenance", {
        enabled: false,
        info: null
      });

      return res.status(200).json({
        status: true,
        message: "Maintenance mode disabled"
      });
    }

    // Se está ativando, valida os campos necessários
    const schema = Yup.object().shape({
      message: Yup.string().required("Message is required"),
      estimatedTime: Yup.string().required("Estimated time is required")
    });

    await schema.validate(req.body);

    const { message, estimatedTime } = req.body;

    // Salva o modo de manutenção
    await Setting.upsert({
      key: "maintenance_mode",
      value: "enabled",
      companyId: 1
    });

    // Salva as informações de manutenção
    const maintenanceInfo = {
      message,
      estimatedTime,
      startedAt: new Date().toISOString(),
      startedBy: user.id
    };

    await Setting.upsert({
      key: "maintenance_info",
      value: JSON.stringify(maintenanceInfo),
      companyId: 1
    });

    const io = getIO();
    io.emit("maintenance", {
      enabled: true,
      info: maintenanceInfo
    });

    return res.status(200).json({
      status: true,
      message: "Maintenance mode enabled"
    });

  } catch (err) {
    logger.error("toggleMaintenanceMode error: %o", err);
    throw new AppError(err.message);
  }
};

export const getMaintenanceStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Se for super admin, sempre retorna sistema disponível
    if (req?.user?.isSuper) {
      return res.status(200).json({
        enabled: false,
        info: null
      });
    }

    const maintenanceSetting = await Setting.findOne({
      where: { key: "maintenance_mode", companyId: 1 }
    });

    const isEnabled = maintenanceSetting?.value === "enabled";

    if (isEnabled) {
      const maintenanceInfo = await Setting.findOne({
        where: { key: "maintenance_info", companyId: 1 }
      });

      return res.status(200).json({
        enabled: true,
        info: maintenanceInfo ? JSON.parse(maintenanceInfo.value) : null
      });
    }

    return res.status(200).json({
      enabled: false,
      info: null
    });

  } catch (err) {
    logger.error("getMaintenanceStatus error: %o", err);
    throw new AppError("Error getting maintenance status");
  }
};