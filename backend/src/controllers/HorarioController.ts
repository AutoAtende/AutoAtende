import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import Horario from "../models/Horario";
import HorarioGroup from "../models/HorarioGroup";
import { logger } from "../utils/logger";
import { checkSchedule } from "../utils/checkScheduleUtil";

export const index = async (req: Request, res: Response): Promise<Response> => {
    try {
        // Valida que o usuário só pode ver horários da própria empresa
        const { companyId } = req.user;

        const horarios = await Horario.findAll({
            where: { companyId },
            order: [['date', 'DESC']]
        });

        // Calcula o status de cada horário (se está dentro ou fora do horário)
        const horariosComStatus = horarios.map(horario => {
            const status = checkSchedule(horario);
            return {
                ...horario.toJSON(),
                status
            };
        });

        return res.status(200).json({
            horarios: horariosComStatus,
        });
    } catch (err: any) {
        logger.error(`Erro ao listar horários: ${err.message}`);
        return res.status(500).json({ error: err.message });
    }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { companyId } = req.user as { companyId: number };
        
        // Separando a validação do tipo dos demais campos para evitar erros de tipagem
        const typeSchema = Yup.object().shape({
            type: Yup.string().oneOf(['day', 'weekdays', 'annual', 'specific']).required("Tipo é obrigatório")
        });
        
        await typeSchema.validate({ type: req.body.type });
        
        // Validação principal, usando o tipo já validado
        const { type } = req.body;
        
        let schema;
        
        if (type === 'weekdays') {
            schema = Yup.object().shape({
                weekdays: Yup.array().of(Yup.string()).min(1, "Pelo menos um dia da semana deve ser selecionado").required("Dias da semana são obrigatórios"),
                startTime: Yup.string().required("Horário inicial é obrigatório"),
                endTime: Yup.string().required("Horário final é obrigatório"),
                workedDay: Yup.boolean(),
                description: Yup.string(),
                horarioGroupId: Yup.number().nullable()
            });
        } else if (type === 'day' || type === 'specific' || type === 'annual') {
            schema = Yup.object().shape({
                date: Yup.date().required("Data é obrigatória"),
                startTime: Yup.string().required("Horário inicial é obrigatório"),
                endTime: Yup.string().required("Horário final é obrigatório"),
                workedDay: Yup.boolean(),
                description: Yup.string(),
                horarioGroupId: Yup.number().nullable()
            });
        } else {
            return res.status(400).json({ error: "Tipo de horário inválido" });
        }

        await schema.validate(req.body);

        const { 
            date, 
            weekdays = [],
            startTime, 
            endTime, 
            workedDay = true, 
            description = "",
            horarioGroupId = null 
        } = req.body;

        // Validação: endTime deve ser maior que startTime
        if (startTime >= endTime) {
            return res.status(400).json({ error: "O horário final deve ser maior que o horário inicial" });
        }
        
        // Verificar se o grupo existe (se fornecido)
        if (horarioGroupId) {
            const group = await HorarioGroup.findOne({
                where: { id: horarioGroupId, companyId }
            });
            
            if (!group) {
                return res.status(404).json({ error: "Grupo de horários não encontrado" });
            }
        }
        
        // Criação do horário
        const horario = await Horario.create({
            type,
            date,
            weekdays,
            startTime,
            endTime,
            workedDay,
            description,
            horarioGroupId,
            companyId
        });

        logger.info(`Horário criado: ID ${horario.id} para empresa ${companyId}`);

        return res.status(201).json(horario);
    } catch (err: any) {
        logger.error(`Erro ao criar horário: ${err.message}`);
        return res.status(500).json({ error: err.message });
    }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const { companyId } = req.user as { companyId: number };
        
        // Se tiver o campo type, valida-o primeiro
        if (req.body.type) {
            const typeSchema = Yup.object().shape({
                type: Yup.string().oneOf(['day', 'weekdays', 'annual', 'specific'])
            });
            await typeSchema.validate({ type: req.body.type });
        }
        
        // Aplicando a validação adequada com base no tipo
        const { type } = req.body;
        
        let schema;
        
        if (type === 'weekdays') {
            schema = Yup.object().shape({
                weekdays: Yup.array().of(Yup.string()).min(1, "Pelo menos um dia da semana deve ser selecionado"),
                startTime: Yup.string(),
                endTime: Yup.string(),
                workedDay: Yup.boolean(),
                description: Yup.string(),
                horarioGroupId: Yup.number().nullable()
            });
        } else if (type === 'day' || type === 'specific' || type === 'annual') {
            schema = Yup.object().shape({
                date: Yup.date().required("Data é obrigatória"),
                startTime: Yup.string(),
                endTime: Yup.string(),
                workedDay: Yup.boolean(),
                description: Yup.string(),
                horarioGroupId: Yup.number().nullable()
            });
        } else {
            // Se não tem type, valida somente os campos comuns
            schema = Yup.object().shape({
                startTime: Yup.string(),
                endTime: Yup.string(),
                workedDay: Yup.boolean(),
                description: Yup.string(),
                horarioGroupId: Yup.number().nullable()
            });
        }

        await schema.validate(req.body);

        const horario = await Horario.findByPk(id);

        if (!horario) {
            return res.status(404).json({ error: "Horário não encontrado" });
        }

        // Verifica se o horário pertence à empresa do usuário
        if (horario.companyId !== companyId) {
            return res.status(403).json({ error: "Sem permissão para editar este horário" });
        }

        const { date, weekdays, startTime, endTime, workedDay, description, horarioGroupId } = req.body;

        // Validação condicional: se ambos startTime e endTime estiverem presentes, endTime deve ser maior que startTime
        if (startTime && endTime && startTime >= endTime) {
            return res.status(400).json({ error: "O horário final deve ser maior que o horário inicial" });
        }

        // Verificar se o grupo existe (se fornecido)
        if (horarioGroupId) {
            const group = await HorarioGroup.findOne({
                where: { id: horarioGroupId, companyId }
            });
            
            if (!group) {
                return res.status(404).json({ error: "Grupo de horários não encontrado" });
            }
        }

        // Atualiza o horário
        await horario.update({
            type: type || horario.type,
            date: date || horario.date,
            weekdays: weekdays || horario.weekdays,
            startTime: startTime || horario.startTime,
            endTime: endTime || horario.endTime,
            workedDay: workedDay !== undefined ? workedDay : horario.workedDay,
            description: description !== undefined ? description : horario.description,
            horarioGroupId: horarioGroupId !== undefined ? horarioGroupId : horario.horarioGroupId
        });

        logger.info(`Horário atualizado: ID ${horario.id} para empresa ${companyId}`);

        return res.status(200).json(horario);
    } catch (err: any) {
        logger.error(`Erro ao atualizar horário: ${err.message}`);
        return res.status(500).json({ error: err.message });
    }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const { companyId } = req.user as { companyId: number };
        const horario = await Horario.findByPk(id);

        if (!horario) {
            return res.status(404).json({ error: "Horário não encontrado" });
        }

        // Verifica se o horário pertence à empresa do usuário
        if (horario.companyId !== companyId) {
            return res.status(403).json({ error: "Sem permissão para excluir este horário" });
        }

        await horario.destroy();

        logger.info(`Horário excluído: ID ${id} para empresa ${companyId}`);

        return res.status(200).json({ message: "Horário excluído com sucesso" });
    } catch (err: any) {
        logger.error(`Erro ao excluir horário: ${err.message}`);
        return res.status(500).json({ error: err.message });
    }
};

export const getScheduleStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { companyId } = req.user as { companyId: number };
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentDayOfWeek = now.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
        const dayOfWeekMap = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
        const currentDayName = dayOfWeekMap[currentDayOfWeek];
        
        // Busca os horários
        const horarios = await Horario.findAll({
            where: { companyId },
        });

        // Filtra os horários relevantes para hoje
        const horariosRelevantes = horarios.filter(horario => {
            if (horario.type === 'day' || horario.type === 'specific') {
                // Para tipo 'day' ou 'specific', verifica se a data é hoje
                return horario.date.toISOString().split('T')[0] === today;
            } else if (horario.type === 'weekdays') {
                // Para tipo 'weekdays', verifica se o dia atual está na lista de dias da semana
                return horario.weekdays.includes(currentDayName);
            } else if (horario.type === 'annual') {
                // Para tipo 'annual', verifica se o mês e dia batem, independente do ano
                const horarioDate = new Date(horario.date);
                return horarioDate.getMonth() === now.getMonth() && horarioDate.getDate() === now.getDate();
            }
            return false;
        });

        // Determina o status atual
        let currentStatus = "fora";
        for (const horario of horariosRelevantes) {
            const status = checkSchedule(horario);
            if (status === "dentro") {
                currentStatus = "dentro";
                break;
            }
        }

        return res.status(200).json({ status: currentStatus });
    } catch (err: any) {
        logger.error(`Erro ao verificar status do horário: ${err.message}`);
        return res.status(500).json({ error: err.message });
    }
};