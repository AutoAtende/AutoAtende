// controllers/UserDashboardSettingsController.ts
import { Request, Response } from "express";
import * as UserDashboardSettingsService from "../services/UserServices/UserDashboardSettingsService";

export const getDashboardSettings = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.user;
  const settings = await UserDashboardSettingsService.getDashboardSettings(Number(id));
  return res.json(settings);
};

export const updateDashboardSettings = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.user;
  const settings = req.body;
  const updatedSettings = await UserDashboardSettingsService.updateDashboardSettings(Number(id), settings);
  return res.json(updatedSettings);
};

export const updateComponentVisibility = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.user;
  const { tabId, componentId, visible } = req.body;
  
  const updatedSettings = await UserDashboardSettingsService.updateComponentVisibility(
    Number(id),
    tabId,
    componentId,
    visible
  );
  
  return res.json(updatedSettings);
};

export const resetToDefault = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.user;
  const defaultSettings = UserDashboardSettingsService.getDefaultDashboardSettings();
  const updatedSettings = await UserDashboardSettingsService.updateDashboardSettings(Number(id), defaultSettings);
  return res.json(updatedSettings);
};