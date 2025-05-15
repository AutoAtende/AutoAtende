// controllers/HealthCheckController.ts
import { Request, Response } from 'express';
import Setting from '../models/Setting';

export const getMaintenanceStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const maintenanceSetting = await Setting.findOne({
      where: { key: "maintenance_mode", companyId: 1 }
    });
    
    // Se for super admin, sempre retorna sistema disponível
    if (req.user?.isSuper) {
      return res.status(200).json({ status: 'ok' });
    }

    if (maintenanceSetting?.value === 'enabled') {
      const maintenanceInfo = await Setting.findOne({
        where: { key: "maintenance_info", companyId: 1 }
      });

      return res.status(503).json({
        error: 'System under maintenance',
        maintenanceInfo: maintenanceInfo ? JSON.parse(maintenanceInfo.value) : null
      });
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};