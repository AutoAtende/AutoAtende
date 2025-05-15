import AppError from "../../errors/AppError";
import ShowTicketService from "../TicketServices/ShowTicketService";
import ShowContactService from "../ContactServices/ShowContactService";
import Horario from "../../models/Horario";
import { logger } from "../../utils/logger";
import { checkSchedule } from "../../utils/checkScheduleUtil";

interface ExecuteScheduleNodeParams {
  nodeData: {
    nodeId?: string;
    horarioId?: number;
    horarioGroupId?: number;
  };
  ticketId: number;
  contactId: number;
  companyId: number;
  whatsappId?: number;
}

const ExecuteScheduleNodeService = async ({
  nodeData,
  ticketId,
  contactId,
  companyId,
  whatsappId
}: ExecuteScheduleNodeParams): Promise<{
  status: string;
  path: string;
}> => {
  try {
    logger.info(`Executando nó de verificação de horário para ticket ${ticketId}`);
    
    // Obter ticket e contato
    const ticket = await ShowTicketService(ticketId, companyId);
    const contact = await ShowContactService(contactId, companyId);
    
    if (!ticket || !contact) {
      throw new AppError("Ticket ou contato não encontrado");
    }
    
    // Obter a data atual
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentDayOfWeek = now.getDay();
    const dayOfWeekMap = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    const currentDayName = dayOfWeekMap[currentDayOfWeek];
    
    let horarios = [];
    
    // Se tiver um grupo específico, buscar apenas horários desse grupo
    if (nodeData.horarioGroupId) {
      horarios = await Horario.findAll({
        where: {
          companyId,
          horarioGroupId: nodeData.horarioGroupId
        }
      });
      
      logger.info(`Verificando ${horarios.length} horários para o grupo ${nodeData.horarioGroupId}`);
    } 
    // Se tiver um horário específico, buscar apenas esse horário
    else if (nodeData.horarioId) {
      const specificHorario = await Horario.findOne({
        where: {
          id: nodeData.horarioId,
          companyId
        }
      });
      
      if (specificHorario) {
        horarios = [specificHorario];
        logger.info(`Verificando horário específico ID ${nodeData.horarioId}`);
      } else {
        logger.info(`Horário específico ID ${nodeData.horarioId} não encontrado. Considerando como fora do horário.`);
        return { status: "fora", path: "fora" };
      }
    } 
    // Se não tiver nem grupo nem horário específico, buscar todos horários
    else {
      horarios = await Horario.findAll({
        where: {
          companyId
        }
      });
      
      logger.info(`Verificando ${horarios.length} horários para a empresa ${companyId}`);
    }
    
    // Se não houver horários definidos, considerar como fora do horário
    if (horarios.length === 0) {
      logger.info(`Nenhum horário definido para o contexto solicitado. Considerando como fora do horário.`);
      return { status: "fora", path: "fora" };
    }
    
    // Filtrar horários aplicáveis para hoje
    const horariosRelevantes = horarios.filter(horario => {
      if (horario.type === 'day' || horario.type === 'specific') {
        // Para tipo 'day' ou 'specific', verifica se a data é hoje
        const horarioDate = horario.date instanceof Date ? 
            horario.date.toISOString().split('T')[0] : 
            new Date(horario.date).toISOString().split('T')[0];
        return horarioDate === today;
      } else if (horario.type === 'weekdays') {
        // Para tipo 'weekdays', verifica se o dia atual está na lista de dias da semana
        return Array.isArray(horario.weekdays) && horario.weekdays.includes(currentDayName);
      } else if (horario.type === 'annual') {
        // Para tipo 'annual', verifica se o mês e dia batem, independente do ano
        const horarioDate = horario.date instanceof Date ? horario.date : new Date(horario.date);
        return horarioDate.getMonth() === now.getMonth() && horarioDate.getDate() === now.getDate();
      }
      return false;
    });
    
    logger.info(`${horariosRelevantes.length} horários relevantes para hoje`);
    
    // Verificar se está dentro de algum horário conforme a configuração
    let insideSchedule = false;
    
    for (const horario of horariosRelevantes) {
      const status = checkSchedule(horario);
      if (status === "dentro") {
        insideSchedule = true;
        logger.info(`Dentro do horário: ${horario.id}`);
        break;
      }
    }
    
    const finalStatus = insideSchedule ? "dentro" : "fora";
    logger.info(`Resultado da verificação de horário: ${finalStatus}`);
    
    return { status: finalStatus, path: finalStatus };
  } catch (error) {
    logger.error(`Erro ao executar nó de verificação de horário: ${error.message}`);
    throw error;
  }
};

export default ExecuteScheduleNodeService;