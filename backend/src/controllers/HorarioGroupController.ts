import { Request, Response } from "express";
import * as Yup from "yup";
import { Op } from "sequelize";
import AppError from "../errors/AppError";
import HorarioGroup from "../models/HorarioGroup";
import Horario from "../models/Horario";
import { logger } from "../utils/logger";
import { checkSchedule } from "../utils/checkScheduleUtil";

export const index = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { companyId } = req.user;

        const groups = await HorarioGroup.findAll({
            where: { companyId },
            order: [['name', 'ASC']]
        });

        return res.status(200).json({
            groups
        });
    } catch (err: any) {
        logger.error(`Erro ao listar grupos de horários: ${err.message}`);
        return res.status(500).json({ error: err.message });
    }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { companyId } = req.user as { companyId: number };
        
        const schema = Yup.object().shape({
            name: Yup.string().required("Nome é obrigatório"),
            description: Yup.string(),
            isDefault: Yup.boolean()
        });

        await schema.validate(req.body);

        const { name, description = "", isDefault = false } = req.body;

        // Se for definido como padrão, remover o padrão dos outros grupos
        if (isDefault) {
            await HorarioGroup.update(
                { isDefault: false },
                { where: { companyId, isDefault: true } }
            );
        }
        
        const group = await HorarioGroup.create({
            name,
            description,
            isDefault,
            companyId
        });

        logger.info(`Grupo de horários criado: ID ${group.id} para empresa ${companyId}`);

        return res.status(201).json(group);
    } catch (err: any) {
        logger.error(`Erro ao criar grupo de horários: ${err.message}`);
        return res.status(500).json({ error: err.message });
    }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const { companyId } = req.user as { companyId: number };
        
        const schema = Yup.object().shape({
            name: Yup.string(),
            description: Yup.string(),
            isDefault: Yup.boolean()
        });

        await schema.validate(req.body);

        const group = await HorarioGroup.findByPk(id);

        if (!group) {
            return res.status(404).json({ error: "Grupo de horários não encontrado" });
        }

        // Verificar se o grupo pertence à empresa do usuário
        if (group.companyId !== companyId) {
            return res.status(403).json({ error: "Sem permissão para editar este grupo de horários" });
        }

        const { name, description, isDefault } = req.body;

        // Se for definido como padrão, remover o padrão dos outros grupos
        if (isDefault) {
            await HorarioGroup.update(
                { isDefault: false },
                { where: { companyId, isDefault: true, id: { [Op.ne]: id } } }
            );
        }

        // Atualizar o grupo
        await group.update({
            name: name || group.name,
            description: description !== undefined ? description : group.description,
            isDefault: isDefault !== undefined ? isDefault : group.isDefault
        });

        logger.info(`Grupo de horários atualizado: ID ${group.id} para empresa ${companyId}`);

        return res.status(200).json(group);
    } catch (err: any) {
        logger.error(`Erro ao atualizar grupo de horários: ${err.message}`);
        return res.status(500).json({ error: err.message });
    }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const { companyId } = req.user as { companyId: number };
        
        const group = await HorarioGroup.findByPk(id);

        if (!group) {
            return res.status(404).json({ error: "Grupo de horários não encontrado" });
        }

        // Verificar se o grupo pertence à empresa do usuário
        if (group.companyId !== companyId) {
            return res.status(403).json({ error: "Sem permissão para excluir este grupo de horários" });
        }
        
        // Verificar se é o grupo padrão
        if (group.isDefault) {
            return res.status(400).json({ error: "Não é possível excluir o grupo padrão" });
        }

        // Verificar se há horários associados a este grupo
        const horarioCount = await Horario.count({ where: { horarioGroupId: id } });
        
        if (horarioCount > 0) {
            return res.status(400).json({ error: "Este grupo não pode ser excluído pois possui horários vinculados" });
        }

        await group.destroy();

        logger.info(`Grupo de horários excluído: ID ${id} para empresa ${companyId}`);

        return res.status(200).json({ message: "Grupo de horários excluído com sucesso" });
    } catch (err: any) {
        logger.error(`Erro ao excluir grupo de horários: ${err.message}`);
        return res.status(500).json({ error: err.message });
    }
};

// Listar horários de um grupo específico
export const listGroupHorarios = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const { companyId } = req.user;

        const group = await HorarioGroup.findOne({
            where: { id, companyId }
        });

        if (!group) {
            return res.status(404).json({ error: "Grupo de horários não encontrado" });
        }

        const horarios = await Horario.findAll({
            where: { horarioGroupId: id, companyId },
            order: [['date', 'DESC']]
        });

        // Calcula o status de cada horário
        const horariosComStatus = horarios.map(horario => {
            const status = checkSchedule(horario);
            return {
                ...horario.toJSON(),
                status
            };
        });

        return res.status(200).json({
            group,
            horarios: horariosComStatus
        });
    } catch (err: any) {
        logger.error(`Erro ao listar horários do grupo: ${err.message}`);
        return res.status(500).json({ error: err.message });
    }
};

export const getGroupScheduleStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const { companyId } = req.user;
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        // Verificar se o grupo existe
        const group = await HorarioGroup.findOne({
            where: { id, companyId }
        });

        if (!group) {
            return res.status(404).json({ error: "Grupo de horários não encontrado" });
        }
        
        // Buscar os horários do grupo para o dia atual
        const horarios = await Horario.findAll({
            where: {
                companyId,
                horarioGroupId: id,
                date: today
            }
        });

        // Determinar o status atual
        let currentStatus = "fora";
        for (const horario of horarios) {
            const status = checkSchedule(horario);
            if (status === "dentro") {
                currentStatus = "dentro";
                break;
            }
        }

        return res.status(200).json({ 
            groupId: id,
            groupName: group.name,
            status: currentStatus 
        });
    } catch (err: any) {
        logger.error(`Erro ao verificar status do grupo de horários: ${err.message}`);
        return res.status(500).json({ error: err.message });
    }
};