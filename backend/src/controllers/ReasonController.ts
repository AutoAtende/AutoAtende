import { Request, Response } from 'express';
import CreateReasonService from '../services/ReasonServices/CreateReasonService';
import UpdateReasonService from '../services/ReasonServices/UpdateReasonService';
import DeleteReasonService from '../services/ReasonServices/DeleteReasonService';
import GetReasonsService from '../services/ReasonServices/GetReasonService';

export const index = async (req: Request, res: Response): Promise<Response> => {
    const companyId = req.user.companyId;

    try {
        const reasons = await GetReasonsService({ companyId });
        return res.json(reasons);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
    console.log("Received request body:", req.body);
    const { name, message } = req.body;
    const companyId = req.user.companyId;

    try {
        const newReason = await CreateReasonService({ name, message, companyId });
        console.log("Created new reason:", newReason);
        return res.status(201).json(newReason);
    } catch (error) {
        console.error("Error creating reason:", error);
        return res.status(400).json({ error: error.message });
    }
};
export const update = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { name, message } = req.body;
    const companyId = req.user.companyId;

    try {
        const updatedReason = await UpdateReasonService({ id: Number(id), name, message, companyId });
        return res.json(updatedReason);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const companyId = req.user.companyId;

    try {
        await DeleteReasonService({ id: Number(id), companyId });
        return res.status(204).end();
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};
