import { proto } from "baileys";
import { Session, getWbot } from "../../../../../libs/wbot";
import Ticket from "../../../../../models/Ticket";
import Contact from "../../../../../models/Contact";
import Availability from "../../../../../models/Availability";
import Message from "../../../../../models/Message";
import { logger } from "../../../../../utils/logger";
import { getBodyMessage } from "../../Get/GetBodyMessage";
import formatBody from "../../../../../helpers/Mustache";
import { verifyMessage } from "../../Verifiers/VerifyMessage";
import ScheduleSettings from "../../../../../models/ScheduleSettings";
import AppointmentService from "../../../../AgendamentoService/AppointmentService";
import ProfessionalService from "../../../../AgendamentoService/ProfessionalService";
import ServicesService from "../../../../AgendamentoService/ServicesService";
import AvailabilityService from "../../../../AgendamentoService/AvailabilityService";
import moment from "moment";
import "moment/locale/pt-br";
import { Op } from "sequelize";
import ChatbotState from "../../../../../models/ChatbotState";
import sequelize from "../../../../../database";
import { Mutex } from "async-mutex";
import FlowBuilderExecution from "../../../../../models/FlowBuilderExecution";
import FinishFlowService from "../../../../FlowBuilderService/FinishFlowService";

moment.locale('pt-br');

// Mutex para tratamento de concorrência
const appointmentMutex = new Mutex();

// Enum para os passos do fluxo de agendamento
enum SchedulingStep {
  WELCOME = "welcome",
  MENU = "menu",
  SERVICE_SELECTION = "service_selection",
  PROFESSIONAL_SELECTION = "professional_selection",
  DATE_SELECTION = "date_selection",
  TIME_SELECTION = "time_selection",
  CONFIRMATION = "confirmation",
  CANCEL_APPOINTMENT = "cancel_appointment",
  VIEW_APPOINTMENTS = "view_appointments",
  DONE = "done" // Novo estado para indicar conclusão do fluxo
}

// Interface para armazenar o estado do chatbot
interface ChatbotStateData {
  step: SchedulingStep;
  selectedServiceId?: number;
  selectedProfessionalId?: number;
  selectedDate?: string;
  selectedTime?: string;
  appointmentId?: number;
  // Informações para exibição
  availableServices?: Array<{ id: number, name: string }>;
  availableProfessionals?: Array<{ id: number, name: string }>;
  availableDates?: Array<{ date: string, formatted: string }>;
  availableTimeSlots?: Array<{ time: string, formatted: string }>;
  upcomingAppointments?: any[];
  // Campos específicos para integração com FlowBuilder
  flowExecutionId?: number;
  isInFlow?: boolean;
}

class handleAppointmentChatbot {
  // Map para cache de estados (ainda mantido para compatibilidade e desempenho)
  static conversationStates = new Map<number, ChatbotStateData>();
  
  // Configuração de tempo de inatividade (em minutos)
  static INACTIVITY_TIMEOUT_MINUTES = 5;

  private static async sendMessage(msg: string, ticket: Ticket, wbot: Session): Promise<void> {
    const sentMessage = await wbot.sendMessage(
      `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      { text: formatBody(msg, ticket) }
    );
    
    await verifyMessage(sentMessage, ticket, ticket.contact);
  }

  // Método para obter o estado da conversa (agora com persistência)
  private static async getConversationState(ticketId: number, companyId: number): Promise<ChatbotStateData | null> {
    // Primeiro verifica o cache em memória para melhor desempenho
    let state = this.conversationStates.get(ticketId);
    if (state) {
      return state;
    }
    
    // Se não estiver em memória, busca no banco de dados
    const chatbotState = await ChatbotState.findOne({
      where: {
        ticketId,
        companyId,
        expiresAt: {
          [Op.gt]: new Date() // Garante que não busca estados expirados
        }
      }
    });
    
    if (chatbotState) {
      // Converte o estado armazenado para o formato usado pela aplicação
      let stateData: ChatbotStateData = {
        step: chatbotState.step as SchedulingStep,
        selectedServiceId: chatbotState.selectedServiceId,
        selectedProfessionalId: chatbotState.selectedProfessionalId,
        selectedDate: chatbotState.selectedDate,
        selectedTime: chatbotState.selectedTime,
        appointmentId: chatbotState.appointmentId,
        availableServices: chatbotState.availableServices as any,
        availableProfessionals: chatbotState.availableProfessionals as any,
        availableDates: chatbotState.availableDates as any,
        availableTimeSlots: chatbotState.availableTimeSlots as any,
        upcomingAppointments: chatbotState.upcomingAppointments as any,
        flowExecutionId: chatbotState.flowExecutionId,
        isInFlow: chatbotState.isInFlow
      };
      
      // Atualiza o cache em memória
      this.conversationStates.set(ticketId, stateData);
      
      return stateData;
    }
    
    return null;
  }

  // Método para salvar o estado da conversa (persistência)
  private static async saveConversationState(
    ticketId: number, 
    companyId: number, 
    state: ChatbotStateData
  ): Promise<void> {
    // Atualiza o cache em memória
    this.conversationStates.set(ticketId, state);
    
    // Calcula a data de expiração (15 minutos de inatividade por padrão)
    const expiresAt = moment().add(this.INACTIVITY_TIMEOUT_MINUTES, 'minutes').toDate();
    
    try {
      // Busca o estado existente ou cria um novo
      let chatbotState = await ChatbotState.findOne({
        where: { ticketId, companyId }
      });
      
      if (chatbotState) {
        // Atualiza o estado existente
        await chatbotState.update({
          state: JSON.stringify(state),
          step: state.step,
          selectedServiceId: state.selectedServiceId,
          selectedProfessionalId: state.selectedProfessionalId,
          selectedDate: state.selectedDate,
          selectedTime: state.selectedTime,
          appointmentId: state.appointmentId,
          availableServices: state.availableServices,
          availableProfessionals: state.availableProfessionals,
          availableDates: state.availableDates,
          availableTimeSlots: state.availableTimeSlots,
          upcomingAppointments: state.upcomingAppointments,
          flowExecutionId: state.flowExecutionId,
          isInFlow: state.isInFlow,
          lastInteractionAt: new Date(),
          expiresAt
        });
      } else {
        // Cria um novo estado
        await ChatbotState.create({
          ticketId,
          companyId,
          state: JSON.stringify(state),
          step: state.step,
          selectedServiceId: state.selectedServiceId,
          selectedProfessionalId: state.selectedProfessionalId,
          selectedDate: state.selectedDate,
          selectedTime: state.selectedTime,
          appointmentId: state.appointmentId,
          availableServices: state.availableServices,
          availableProfessionals: state.availableProfessionals,
          availableDates: state.availableDates,
          availableTimeSlots: state.availableTimeSlots,
          upcomingAppointments: state.upcomingAppointments,
          flowExecutionId: state.flowExecutionId,
          isInFlow: state.isInFlow,
          lastInteractionAt: new Date(),
          expiresAt
        });
      }
    } catch (error) {
      logger.error(`Erro ao salvar estado do chatbot para ticket ${ticketId}: ${error.message}`);
    }
  }

  // Método para remover o estado da conversa
  private static async removeConversationState(ticketId: number, companyId: number): Promise<void> {
    // Remove do cache em memória
    this.conversationStates.delete(ticketId);
    
    // Remove do banco de dados
    try {
      await ChatbotState.destroy({
        where: { ticketId, companyId }
      });
    } catch (error) {
      logger.error(`Erro ao remover estado do chatbot para ticket ${ticketId}: ${error.message}`);
    }
  }

  // Método para verificar se o horário ainda está disponível (usado para concorrência)
  private static async verifySlotAvailability(
    professionalId: number,
    serviceId: number,
    dateTime: string,
    companyId: number
  ): Promise<boolean> {
    return await appointmentMutex.runExclusive(async () => {
      try {
        const selectedDate = moment(dateTime).format('YYYY-MM-DD');
        const selectedTime = moment(dateTime).format('HH:mm');
        
        // Busca novamente os slots disponíveis para garantir que ainda está disponível
        const slots = await AvailabilityService.getAvailableSlots(
          professionalId,
          serviceId,
          selectedDate,
          companyId
        );
        
        // Verifica se o horário selecionado ainda está disponível
        const isAvailable = slots.some(slot => {
          const slotTime = moment(slot.startTime).format('HH:mm');
          return slotTime === selectedTime && slot.available;
        });
        
        return isAvailable;
      } catch (error) {
        logger.error(`Erro ao verificar disponibilidade de horário: ${error.message}`);
        return false;
      }
    });
  }

  // Método para finalizar um fluxo de execução do FlowBuilder, se existir
  private static async finishFlowIfNeeded(ticket: Ticket, flowExecutionId?: number): Promise<void> {
    if (flowExecutionId) {
      try {
        // Verificar se estamos realmente no final do fluxo de agendamento
        const state = await this.getConversationState(ticket.id, ticket.companyId);
        
        // Só finalizar se o estado for DONE ou se não houver estado
        if (!state || state.step === SchedulingStep.DONE) {
          const execution = await FlowBuilderExecution.findOne({
            where: {
              id: flowExecutionId,
              companyId: ticket.companyId
            }
          });
          
          if (execution) {
            logger.info(`[APPOINTMENT_CHATBOT] Finalizando execução de fluxo ${flowExecutionId} para ticket ${ticket.id}`);
            
            await FinishFlowService({
              ticketId: ticket.id,
              companyId: ticket.companyId,
              executionId: flowExecutionId,
              ticketStatus: "pending", // Status padrão ao finalizar
              flowStatus: "completed"
            });
            
            // Atualizar o ticket para sair do modo de agendamento
            await ticket.update({
              appointmentMode: false,   // Desativar modo de agendamento
              useIntegration: false,    // Desativar integração
              chatbot: false,           // Desativar chatbot
              isBot: false,             // <-- IMPORTANTE: Adicionar esta flag
              flowExecutionId: null,    // Limpar referência ao fluxo
              flowExecution: null,
              integrationId: null,      // <-- IMPORTANTE: Limpar integração
            });
  
            await ticket.reload();
          }
        } else {
          logger.info(`[APPOINTMENT_CHATBOT] Não finalizando fluxo ${flowExecutionId} pois agendamento ainda está em andamento (etapa: ${state.step})`);
        }
      } catch (error) {
        logger.error(`[APPOINTMENT_CHATBOT] Erro ao finalizar execução de fluxo: ${error.message}`);
      }
    }
  }

  // Método principal para processar mensagens
  static async execute(msg: proto.IWebMessageInfo, ticket: Ticket, contact: Contact, wbot: Session): Promise<boolean> {
    try {

      if (!ticket.appointmentMode) {
        // Se o ticket não está mais em modo de agendamento, não processar a mensagem
        return false;
      }

      if (!msg) {
        logger.info(`[APPOINTMENT_CHATBOT] Iniciando em modo automático para ticket ${ticket.id}`);
        
        // Criar um estado inicial
        const state = { 
          step: SchedulingStep.WELCOME,
          isInFlow: true, // Definir como parte de um fluxo
          flowExecutionId: null // Será atualizado ao encontrar o fluxo ativo
        };
        
        // Obter configurações de agendamento
        const settings = await ScheduleSettings.findOne({
          where: { companyId: ticket.companyId }
        });
        
        // Salvar o estado e enviar mensagem de boas-vindas
        await this.saveConversationState(ticket.id, ticket.companyId, state);
        await this.sendWelcomeMessage(ticket, wbot, settings);
        return true;
      }

      // Verificar se o ticket está em um fluxo ativo do FlowBuilder
      let activeFlow: FlowBuilderExecution = null;
      let isPartOfFlow = false;
      
      if (ticket.useIntegration && ticket.appointmentMode) {
        try {
          // Buscar execução de fluxo ativa
          activeFlow = await FlowBuilderExecution.findOne({
            where: {
              contactId: contact.id,
              companyId: ticket.companyId,
              status: "active",
              variables: {
                __inAppointmentMode: true
              }
            }
          });
          
          if (activeFlow) {
            isPartOfFlow = true;
            logger.info(`[APPOINTMENT_CHATBOT] Ticket ${ticket.id} está em modo de agendamento dentro do fluxo ${activeFlow.id}`);

            let state = await this.getConversationState(ticket.id, ticket.companyId);
            if (state) {
              state.isInFlow = true;
              state.flowExecutionId = activeFlow.id;
              await this.saveConversationState(ticket.id, ticket.companyId, state);
            }

          }
        } catch (error) {
          logger.error(`[APPOINTMENT_CHATBOT] Erro ao verificar fluxo ativo: ${error.message}`);
        }
      }
    
      // Obter configurações de agendamento da empresa
      const settings = await ScheduleSettings.findOne({
        where: { companyId: ticket.companyId }
      });
            
      // Verificar se o agendamento está habilitado para a empresa
      if (!settings?.scheduleEnabled) {
        logger.info(`[APPOINTMENT_CHATBOT] Agendamento desabilitado para a empresa ${ticket.companyId}`);
        await this.removeConversationState(ticket.id, ticket.companyId);
        await this.finishFlowIfNeeded(ticket, ticket.flowExecutionId);

        ticket.update({
          appointmentMode: false,
          useIntegration: false,
          chatbot: false,
          integrationId: null,
          flowExecutionId: null,
          flowExecution: null,
          isBot: false
        });

        await ticket.reload();

        return false;
      }

      // Verificar se o ticket está em um fluxo de agendamento
      let state = await this.getConversationState(ticket.id, ticket.companyId);
      const bodyMessage = getBodyMessage(msg);
      
      if (!bodyMessage) {
        return false;
      }
    
      logger.info(`[APPOINTMENT_CHATBOT] Mensagem recebida: ${bodyMessage} - Estado atual: ${state?.step || "null"}`);
      
      // Comandos globais para reiniciar o fluxo ou sair dele
      if (bodyMessage.toUpperCase() === "AGENDA" || bodyMessage.toUpperCase() === "#AGENDA") {
        state = { 
          step: SchedulingStep.WELCOME,
          isInFlow: isPartOfFlow,
          flowExecutionId: activeFlow?.id
        };
        await this.saveConversationState(ticket.id, ticket.companyId, state);
        await this.sendWelcomeMessage(ticket, wbot, settings);
        return true;
      }
          
      // Processamento baseado no estado atual
      switch (state.step) {
        case SchedulingStep.WELCOME:
          return await this.handleWelcomeStep(bodyMessage, ticket, contact, wbot, state);
          
        case SchedulingStep.MENU:
          return await this.handleMenuStep(bodyMessage, ticket, contact, wbot, state);
          
        case SchedulingStep.SERVICE_SELECTION:
          return await this.handleServiceSelectionStep(bodyMessage, ticket, contact, wbot, state);
          
        case SchedulingStep.PROFESSIONAL_SELECTION:
          return await this.handleProfessionalSelectionStep(bodyMessage, ticket, contact, wbot, state);
          
        case SchedulingStep.DATE_SELECTION:
          return await this.handleDateSelectionStep(bodyMessage, ticket, contact, wbot, state);
          
        case SchedulingStep.TIME_SELECTION:
          return await this.handleTimeSelectionStep(bodyMessage, ticket, contact, wbot, state);
          
        case SchedulingStep.CONFIRMATION:
          return await this.handleConfirmationStep(bodyMessage, ticket, contact, wbot, state);
          
        case SchedulingStep.VIEW_APPOINTMENTS:
          return await this.handleViewAppointmentsStep(bodyMessage, ticket, contact, wbot, state);
          
        case SchedulingStep.CANCEL_APPOINTMENT:
          return await this.handleCancelAppointmentStep(bodyMessage, ticket, contact, wbot, state);
          
        case SchedulingStep.DONE:
          // Se estiver em estado "DONE", significa que o fluxo foi finalizado
          // Podemos limpar o estado e retornar

          await ticket.update({
            appointmentMode: false,
            useIntegration: false,
            chatbot: false,
            integrationId: null,
            flowExecutionId: null,
            flowExecution: null,
            isBot: false
          });

          await this.removeConversationState(ticket.id, ticket.companyId);
          await this.finishFlowIfNeeded(ticket, state.flowExecutionId);
          
          return true;
          
        default:
          // Reinicia o fluxo se o estado for inválido
          state.step = SchedulingStep.WELCOME;
          await this.saveConversationState(ticket.id, ticket.companyId, state);
          await this.sendWelcomeMessage(ticket, wbot, settings);
          return true;
      }
    } catch (error) {
      logger.error(`[APPOINTMENT_CHATBOT] Erro: ${error.message}`);
      // Em caso de erro, envia mensagem de erro e reinicia o fluxo
      await this.sendMessage(
        "Desculpe, ocorreu um erro ao processar sua solicitação. Vamos reiniciar o processo de agendamento.\n\nPor favor, digite *AGENDA* para recomeçar ou *SAIR* para sair do sistema de agendamento.",
        ticket,
        wbot
      );
      await this.removeConversationState(ticket.id, ticket.companyId);
      await this.finishFlowIfNeeded(ticket, ticket.flowExecutionId);
      return true;
    }
  }

  private static async sendWelcomeMessage(ticket: Ticket, wbot: Session, settings: ScheduleSettings): Promise<void> {
    logger.info(`[APPOINTMENT_CHATBOT] Enviando mensagem de boas-vindas para ticket ${ticket.id}`);
    
    const welcomeMessage = settings.welcomeMessage || 
      "Olá! Bem-vindo ao nosso sistema de agendamento.\n\nDigite o número da opção desejada:\n1 - Fazer um agendamento\n2 - Consultar meus agendamentos\n3 - Falar com um atendente";
    
    try {
      await this.sendMessage(welcomeMessage, ticket, wbot);
      logger.info(`[APPOINTMENT_CHATBOT] Mensagem de boas-vindas enviada com sucesso para ticket ${ticket.id}`);
      
      // Atualizar o estado para o menu principal
      const state = await this.getConversationState(ticket.id, ticket.companyId);
      if (state) {
        state.step = SchedulingStep.MENU;
        await this.saveConversationState(ticket.id, ticket.companyId, state);
      }
    } catch (error) {
      logger.error(`[APPOINTMENT_CHATBOT] Erro ao enviar mensagem de boas-vindas: ${error.message}`);
      throw error; // Propagar o erro para ser tratado no nível superior
    }
  }

  private static async handleWelcomeStep(
    bodyMessage: string,
    ticket: Ticket,
    contact: Contact,
    wbot: Session,
    state: ChatbotStateData
  ): Promise<boolean> {
    // Mudar o estado para o menu principal
    state.step = SchedulingStep.MENU;
    await this.saveConversationState(ticket.id, ticket.companyId, state);
    
    // Enviar o menu principal
    const settings = await ScheduleSettings.findOne({
      where: { companyId: ticket.companyId }
    });
    await this.sendWelcomeMessage(ticket, wbot, settings);
    return true;
  }

  private static async handleMenuStep(
    bodyMessage: string,
    ticket: Ticket,
    contact: Contact,
    wbot: Session,
    state: ChatbotStateData
  ): Promise<boolean> {
    switch (bodyMessage) {
      case "1": // Fazer um agendamento
        // Buscar serviços disponíveis
        const services = await ServicesService.list({
          companyId: ticket.companyId,
          active: true
        });
        
        if (services.length === 0) {
          await this.sendMessage("Desculpe, não há serviços disponíveis para agendamento no momento.", ticket, wbot);


          // Atualizar o ticket para sair do modo de agendamento
          await ticket.update({
            appointmentMode: false,
            useIntegration: false,
            chatbot: false,
            integrationId: null,
            flowExecutionId: null,
            flowExecution: null,
            isBot: false
          });

          state.step = SchedulingStep.DONE;
          await this.saveConversationState(ticket.id, ticket.companyId, state);
          await this.finishFlowIfNeeded(ticket, state.flowExecutionId);
          
          return true;
        }
        
        // Formatar lista de serviços
        let servicesMessage = "Por favor, selecione o serviço desejado:\n\n";
        const availableServices = [];
        
        services.forEach((service, index) => {
          servicesMessage += `*${index + 1}* - ${service.name} (${service.duration} min)\n`;
          availableServices.push({ id: service.id, name: service.name });
        });
        
        servicesMessage += "\nDigite o número correspondente ao serviço desejado.";
        
        await this.sendMessage(servicesMessage, ticket, wbot);
        
        // Atualizar estado
        state.step = SchedulingStep.SERVICE_SELECTION;
        state.availableServices = availableServices;
        await this.saveConversationState(ticket.id, ticket.companyId, state);
        break;
        
      case "2": // Consultar agendamentos
        // Buscar agendamentos ativos do contato
        const appointments = await AppointmentService.list({
          contactId: contact.id,
          companyId: ticket.companyId,
          status: "confirmed"
        });
        
        if (appointments.length === 0) {
          await this.sendMessage("Você não possui agendamentos ativos no momento.", ticket, wbot);
          
          // Voltar para o menu principal
          const settings = await ScheduleSettings.findOne({
            where: { companyId: ticket.companyId }
          });
          await this.sendWelcomeMessage(ticket, wbot, settings);
          return true;
        }
        
        // Formatar lista de agendamentos
        let appointmentsMessage = "Seus agendamentos ativos:\n\n";
        const upcomingAppointments = [];
        
        appointments.forEach((appointment, index) => {
          const scheduledAt = moment(appointment.scheduledAt);
          appointmentsMessage += `*${index + 1}* - ${appointment.service.name} com ${appointment.professional.name}\n`;
          appointmentsMessage += `Data: ${scheduledAt.format("DD/MM/YYYY")}\n`;
          appointmentsMessage += `Horário: ${scheduledAt.format("HH:mm")}\n\n`;
          
          upcomingAppointments.push({
            id: appointment.id,
            serviceId: appointment.serviceId,
            professionalId: appointment.professionalId,
            serviceName: appointment.service.name,
            professionalName: appointment.professional.name,
            scheduledAt: appointment.scheduledAt
          });
        });
        
        appointmentsMessage += "Digite o número do agendamento para ver mais opções ou *0* para voltar ao menu principal.";
        
        await this.sendMessage(appointmentsMessage, ticket, wbot);
        
        // Atualizar estado
        state.step = SchedulingStep.VIEW_APPOINTMENTS;
        state.upcomingAppointments = upcomingAppointments;
        await this.saveConversationState(ticket.id, ticket.companyId, state);
        break;
        
      case "3": // Falar com atendente
        await this.sendMessage("Você será transferido para um atendente em instantes...", ticket, wbot);
        
        // Liberar o ticket para atendimento humano
        state.step = SchedulingStep.DONE;
        await this.saveConversationState(ticket.id, ticket.companyId, state);
        await this.removeConversationState(ticket.id, ticket.companyId);
        await this.finishFlowIfNeeded(ticket, state.flowExecutionId);
      
        // Aqui você pode adicionar código para transferir o ticket para uma fila de atendimento
        await ticket.update({
          useIntegration: false,
          integrationId: null,
          isBot: false,
          chatbot: false,
          appointmentMode: false,
          status: "pending",
          queueId: null,
          userId: null,
          flowExecutionId: null,
          typebotSessionId: null,
          typebotStatus: false,
          promptId: null,
          amountUsedBotQueues: 0,
        });

        await ticket.reload();
        
        return true;
        
      default:
        // Opção inválida, reenviar menu
        await this.sendMessage("Opção inválida. Por favor, escolha uma opção válida:", ticket, wbot);
        const settings = await ScheduleSettings.findOne({
          where: { companyId: ticket.companyId }
        });
        await this.sendWelcomeMessage(ticket, wbot, settings);
        break;
    }
    
    return true;
  }

  private static async handleServiceSelectionStep(
    bodyMessage: string,
    ticket: Ticket,
    contact: Contact,
    wbot: Session,
    state: ChatbotStateData
  ): Promise<boolean> {
    const selection = parseInt(bodyMessage);
    
    // Validar seleção
    if (isNaN(selection) || selection < 1 || selection > state.availableServices.length) {
      await this.sendMessage("Seleção inválida. Por favor, escolha um número válido da lista de serviços.", ticket, wbot);
      
      // Reenviar lista de serviços
      let servicesMessage = "Por favor, selecione o serviço desejado:\n\n";
      
      state.availableServices.forEach((service, index) => {
        servicesMessage += `*${index + 1}* - ${service.name}\n`;
      });
      
      servicesMessage += "\nDigite o número correspondente ao serviço desejado.";
      
      await this.sendMessage(servicesMessage, ticket, wbot);
      await this.saveConversationState(ticket.id, ticket.companyId, state);
      return true;
    }
    
    // Armazenar o serviço selecionado
    const selectedService = state.availableServices[selection - 1];
    state.selectedServiceId = selectedService.id;
    
    // Buscar profissionais que oferecem este serviço
    const professionals = await ProfessionalService.list({
      companyId: ticket.companyId,
      serviceId: selectedService.id,
      active: true
    });
    
    if (professionals.length === 0) {
      await this.sendMessage(`Desculpe, não há profissionais disponíveis para o serviço ${selectedService.name} no momento.`, ticket, wbot);
      
      // Voltar para a seleção de serviços
      const services = await ServicesService.list({
        companyId: ticket.companyId,
        active: true
      });
      
      let servicesMessage = "Por favor, selecione outro serviço:\n\n";
      const availableServices = [];
      
      services.forEach((service, index) => {
        servicesMessage += `*${index + 1}* - ${service.name} (${service.duration} min)\n`;
        availableServices.push({ id: service.id, name: service.name });
      });
      
      servicesMessage += "\nDigite o número correspondente ao serviço desejado.";
      
      await this.sendMessage(servicesMessage, ticket, wbot);
      
      // Atualizar estado
      state.availableServices = availableServices;
      await this.saveConversationState(ticket.id, ticket.companyId, state);
      return true;
    }
    
    // Formatar lista de profissionais
    let professionalsMessage = `Você selecionou o serviço: *${selectedService.name}*\n\n`;
    professionalsMessage += "Por favor, selecione o profissional desejado:\n\n";
    
    const availableProfessionals = [];
    
    professionals.forEach((professional, index) => {
      professionalsMessage += `*${index + 1}* - ${professional.name}\n`;
      availableProfessionals.push({ id: professional.id, name: professional.name });
    });
    
    professionalsMessage += "\nDigite o número correspondente ao profissional desejado.";
    
    await this.sendMessage(professionalsMessage, ticket, wbot);
    
    // Atualizar estado
    state.step = SchedulingStep.PROFESSIONAL_SELECTION;
    state.availableProfessionals = availableProfessionals;
    await this.saveConversationState(ticket.id, ticket.companyId, state);
    
    return true;
  }

  private static async handleProfessionalSelectionStep(
    bodyMessage: string,
    ticket: Ticket,
    contact: Contact,
    wbot: Session,
    state: ChatbotStateData
  ): Promise<boolean> {
    const selection = parseInt(bodyMessage);
    
    // Validar seleção
    if (isNaN(selection) || selection < 1 || selection > state.availableProfessionals.length) {
      await this.sendMessage("Seleção inválida. Por favor, escolha um número válido da lista de profissionais.", ticket, wbot);
      
      // Reenviar lista de profissionais
      const selectedService = await ServicesService.findById(state.selectedServiceId, ticket.companyId);
      
      let professionalsMessage = `Você selecionou o serviço: *${selectedService.name}*\n\n`;
      professionalsMessage += "Por favor, selecione o profissional desejado:\n\n";
      
      state.availableProfessionals.forEach((professional, index) => {
        professionalsMessage += `*${index + 1}* - ${professional.name}\n`;
      });
      
      professionalsMessage += "\nDigite o número correspondente ao profissional desejado.";
      
      await this.sendMessage(professionalsMessage, ticket, wbot);
      await this.saveConversationState(ticket.id, ticket.companyId, state);
      return true;
    }
    
    // Armazenar o profissional selecionado
    const selectedProfessional = state.availableProfessionals[selection - 1];
    state.selectedProfessionalId = selectedProfessional.id;
    
    // Buscar datas disponíveis nos próximos dias
    const settings = await ScheduleSettings.findOne({
      where: { companyId: ticket.companyId }
    });
    const maxDaysAhead = settings.maxScheduleDaysAhead || 30;
    
    // Criar lista de datas disponíveis (próximos X dias)
    const today = moment().startOf('day');
    const availableDates = [];
    
    // Adicionar datas para os próximos X dias
    for (let i = 0; i < maxDaysAhead; i++) {
      const date = moment(today).add(i, 'days');
      const weekday = date.day(); // 0-6 (domingo-sábado)
      
      // Verificar se o profissional trabalha neste dia da semana
      const availability = await Availability.findOne({
        where: {
          professionalId: selectedProfessional.id,
          weekday,
          active: true,
          companyId: ticket.companyId
        }
      });
      
      // Se há disponibilidade para este dia da semana, adicionar à lista
      if (availability) {
        availableDates.push({
          date: date.format('YYYY-MM-DD'),
          formatted: date.format('DD/MM/YYYY') + ` (${date.format('dddd')})`
        });
      }
    }
    
    if (availableDates.length === 0) {
      await this.sendMessage(`Desculpe, não há datas disponíveis para o profissional ${selectedProfessional.name} nos próximos ${maxDaysAhead} dias.`, ticket, wbot);
      
      // Voltar para a seleção de profissionais
      const selectedService = await ServicesService.findById(state.selectedServiceId, ticket.companyId);
      
      let professionalsMessage = `Você selecionou o serviço: *${selectedService.name}*\n\n`;
      professionalsMessage += "Por favor, selecione outro profissional:\n\n";
      
      state.availableProfessionals.forEach((professional, index) => {
        professionalsMessage += `*${index + 1}* - ${professional.name}\n`;
      });
      
      professionalsMessage += "\nDigite o número correspondente ao profissional desejado.";
      
      await this.sendMessage(professionalsMessage, ticket, wbot);
      await this.saveConversationState(ticket.id, ticket.companyId, state);
      return true;
    }
    
    // Formatar lista de datas disponíveis
    let datesMessage = `Você selecionou o profissional: *${selectedProfessional.name}*\n\n`;
    datesMessage += "Por favor, selecione a data desejada:\n\n";
    
    availableDates.slice(0, 10).forEach((dateObj, index) => {
      datesMessage += `*${index + 1}* - ${dateObj.formatted}\n`;
    });
    
    datesMessage += "\nDigite o número correspondente à data desejada.";
    
    await this.sendMessage(datesMessage, ticket, wbot);
    
    // Atualizar estado
    state.step = SchedulingStep.DATE_SELECTION;
    state.availableDates = availableDates.slice(0, 10); // Limitar a 10 datas
    await this.saveConversationState(ticket.id, ticket.companyId, state);
    
    return true;
  }

  private static async handleDateSelectionStep(
    bodyMessage: string,
    ticket: Ticket,
    contact: Contact,
    wbot: Session,
    state: ChatbotStateData
  ): Promise<boolean> {
    const selection = parseInt(bodyMessage);
    
    // Validar seleção
    if (isNaN(selection) || selection < 1 || selection > state.availableDates.length) {
      await this.sendMessage("Seleção inválida. Por favor, escolha um número válido da lista de datas.", ticket, wbot);
      
      // Reenviar lista de datas
      let datesMessage = "Por favor, selecione a data desejada:\n\n";
      
      state.availableDates.forEach((dateObj, index) => {
        datesMessage += `*${index + 1}* - ${dateObj.formatted}\n`;
      });
      
      datesMessage += "\nDigite o número correspondente à data desejada.";
      
      await this.sendMessage(datesMessage, ticket, wbot);
      await this.saveConversationState(ticket.id, ticket.companyId, state);
      return true;
    }
    
    // Armazenar a data selecionada
    const selectedDate = state.availableDates[selection - 1];
    state.selectedDate = selectedDate.date;
    
    // Buscar horários disponíveis para a data selecionada
    const slots = await AvailabilityService.getAvailableSlots(
      state.selectedProfessionalId,
      state.selectedServiceId,
      selectedDate.date,
      ticket.companyId
    );
    
    if (slots.length === 0) {
      const settings = await ScheduleSettings.findOne({
        where: { companyId: ticket.companyId }
      });
      const noSlotsMessage = settings.noSlotsMessage || "Desculpe, não há horários disponíveis para a data selecionada. Por favor, escolha outra data.";
      
      await this.sendMessage(noSlotsMessage, ticket, wbot);
      
      // Reenviar lista de datas
      let datesMessage = "Por favor, selecione outra data:\n\n";
      
      state.availableDates.forEach((dateObj, index) => {
        datesMessage += `*${index + 1}* - ${dateObj.formatted}\n`;
      });
      
      datesMessage += "\nDigite o número correspondente à data desejada.";
      
      await this.sendMessage(datesMessage, ticket, wbot);
      await this.saveConversationState(ticket.id, ticket.companyId, state);
      return true;
    }
    
    // Formatar lista de horários disponíveis
    let timeMessage = `Você selecionou a data: *${selectedDate.formatted}*\n\n`;
    timeMessage += "Por favor, selecione o horário desejado:\n\n";
    
    const availableTimeSlots = [];
    
    slots.forEach((slot, index) => {
      const startTime = moment(slot.startTime).format('HH:mm');
      timeMessage += `*${index + 1}* - ${startTime}\n`;
      availableTimeSlots.push({
        time: moment(slot.startTime).format('YYYY-MM-DD HH:mm:ss'),
        formatted: startTime
      });
    });
    
    timeMessage += "\nDigite o número correspondente ao horário desejado.";
    
    await this.sendMessage(timeMessage, ticket, wbot);
    
    // Atualizar estado
    state.step = SchedulingStep.TIME_SELECTION;
    state.availableTimeSlots = availableTimeSlots;
    await this.saveConversationState(ticket.id, ticket.companyId, state);
    
    return true;
  }

  private static async handleTimeSelectionStep(
    bodyMessage: string,
    ticket: Ticket,
    contact: Contact,
    wbot: Session,
    state: ChatbotStateData
  ): Promise<boolean> {
    const selection = parseInt(bodyMessage);
    
    // Validar seleção
    if (isNaN(selection) || selection < 1 || selection > state.availableTimeSlots.length) {
      await this.sendMessage("Seleção inválida. Por favor, escolha um número válido da lista de horários.", ticket, wbot);
      
      // Reenviar lista de horários
      let timeMessage = "Por favor, selecione o horário desejado:\n\n";
      
      state.availableTimeSlots.forEach((timeSlot, index) => {
        timeMessage += `*${index + 1}* - ${timeSlot.formatted}\n`;
      });
      
      timeMessage += "\nDigite o número correspondente ao horário desejado.";
      
      await this.sendMessage(timeMessage, ticket, wbot);
      await this.saveConversationState(ticket.id, ticket.companyId, state);
      return true;
    }
    
    // Armazenar o horário selecionado
    const selectedTimeSlot = state.availableTimeSlots[selection - 1];
    state.selectedTime = selectedTimeSlot.time;
    
    // Obter detalhes do serviço e profissional para confirmação
    const service = await ServicesService.findById(state.selectedServiceId, ticket.companyId);
    const professional = await ProfessionalService.findById(state.selectedProfessionalId, ticket.companyId);
    
    // Formatar mensagem de confirmação
    const scheduledAt = moment(selectedTimeSlot.time);
    let confirmationMessage = "Por favor, confirme os detalhes do seu agendamento:\n\n";
    confirmationMessage += `*Serviço:* ${service.name}\n`;
    confirmationMessage += `*Profissional:* ${professional.name}\n`;
    confirmationMessage += `*Data:* ${scheduledAt.format("DD/MM/YYYY")}\n`;
    confirmationMessage += `*Horário:* ${scheduledAt.format("HH:mm")}\n`;
    // Verificar se o preço existe e é um número antes de formatá-lo
    if (service.price && typeof service.price === 'number') {
      confirmationMessage += `*Valor:* R$ ${service.price.toFixed(2)}\n`;
    } else if (service.price) {
      confirmationMessage += `*Valor:* R$ ${service.price}\n`;
    }
    confirmationMessage += `*Duração:* ${service.duration} minutos\n\n`;
    confirmationMessage += "Digite *CONFIRMAR* para finalizar o agendamento ou *CANCELAR* para desistir.";
    
    await this.sendMessage(confirmationMessage, ticket, wbot);
    
    // Atualizar estado
    state.step = SchedulingStep.CONFIRMATION;
    await this.saveConversationState(ticket.id, ticket.companyId, state);
    
    return true;
  }

  private static async handleConfirmationStep(
    bodyMessage: string,
    ticket: Ticket,
    contact: Contact,
    wbot: Session,
    state: ChatbotStateData
  ): Promise<boolean> {
    const response = bodyMessage.toUpperCase();
    
    if (response === "CONFIRMAR") {
      try {
        // Verificar se o horário ainda está disponível (para evitar concorrência)
        const isStillAvailable = await this.verifySlotAvailability(
          state.selectedProfessionalId,
          state.selectedServiceId,
          state.selectedTime,
          ticket.companyId
        );
        
        if (!isStillAvailable) {
          await this.sendMessage(
            "Desculpe, este horário já foi reservado por outro cliente enquanto você decidia. Por favor, escolha outro horário.",
            ticket,
            wbot
          );
          
          // Buscar novamente horários disponíveis
          const slots = await AvailabilityService.getAvailableSlots(
            state.selectedProfessionalId,
            state.selectedServiceId,
            state.selectedDate,
            ticket.companyId
          );
          
          if (slots.length === 0) {
            await this.sendMessage(
              "Desculpe, não há mais horários disponíveis para esta data. Por favor, escolha outra data.",
              ticket,
              wbot
            );
            
            // Voltar para a seleção de datas
            state.step = SchedulingStep.DATE_SELECTION;
            await this.saveConversationState(ticket.id, ticket.companyId, state);
            
            // Reenviar lista de datas
            let datesMessage = "Por favor, selecione outra data:\n\n";
            
            state.availableDates.forEach((dateObj, index) => {
              datesMessage += `*${index + 1}* - ${dateObj.formatted}\n`;
            });
            
            datesMessage += "\nDigite o número correspondente à data desejada.";
            
            await this.sendMessage(datesMessage, ticket, wbot);
            return true;
          }
          
          // Formatar lista de horários disponíveis
          let timeMessage = "Por favor, selecione outro horário disponível:\n\n";
          
          const availableTimeSlots = [];
          
          slots.forEach((slot, index) => {
            const startTime = moment(slot.startTime).format('HH:mm');
            timeMessage += `*${index + 1}* - ${startTime}\n`;
            availableTimeSlots.push({
              time: moment(slot.startTime).format('YYYY-MM-DD HH:mm:ss'),
              formatted: startTime
            });
          });
          
          timeMessage += "\nDigite o número correspondente ao horário desejado.";
          
          await this.sendMessage(timeMessage, ticket, wbot);
          
          // Atualizar estado
          state.step = SchedulingStep.TIME_SELECTION;
          state.availableTimeSlots = availableTimeSlots;
          await this.saveConversationState(ticket.id, ticket.companyId, state);
          return true;
        }
        
        // Criar o agendamento dentro de uma transaction para garantir atomicidade
        const transaction = await sequelize.transaction();
        
        try {
          // Usar mutex para garantir exclusividade do horário durante a criação
          const appointment = await appointmentMutex.runExclusive(async () => {
            const appointmentData = {
              scheduledAt: state.selectedTime,
              professionalId: state.selectedProfessionalId,
              serviceId: state.selectedServiceId,
              contactId: contact.id,
              companyId: ticket.companyId,
              whatsappId: ticket.whatsappId,
              ticketId: ticket.id
            };
            
            // Criar o agendamento
            const newAppointment = await AppointmentService.create(appointmentData);
            
            // Atualizar imediatamente para confirmed
            return await AppointmentService.update(
              newAppointment.id,
              { status: "confirmed" },
              ticket.companyId
            );
          });
          
          await transaction.commit();
          
          // Enviar mensagem de sucesso com detalhes do agendamento
          const service = await ServicesService.findById(state.selectedServiceId, ticket.companyId);
          const professional = await ProfessionalService.findById(state.selectedProfessionalId, ticket.companyId);
          const scheduledAt = moment(state.selectedTime);
          
          // Substitua a parte do código que formata a mensagem de sucesso após confirmar
          let successMessage = "🎉 *Agendamento realizado com sucesso!* 🎉\n\n";
          successMessage += "Aqui estão os detalhes do seu agendamento:\n\n";
          successMessage += `*Serviço:* ${service.name}\n`;
          successMessage += `*Profissional:* ${professional.name}\n`;
          successMessage += `*Data:* ${scheduledAt.format("DD/MM/YYYY")}\n`;
          successMessage += `*Horário:* ${scheduledAt.format("HH:mm")}\n`;
          // Verificar se o preço existe antes de formatá-lo
          if (service.price && typeof service.price === 'number') {
            successMessage += `*Valor:* R$ ${service.price.toFixed(2)}\n`;
          } else if (service.price) {
            successMessage += `*Valor:* R$ ${service.price}\n`;
          }
          successMessage += `*Duração:* ${service.duration} minutos\n\n`;
          successMessage += "Para cancelar este agendamento, acesse o menu principal e escolha a opção 'Consultar meus agendamentos'.\n\n";
          successMessage += "Agradecemos pela preferência!";
          
          await this.sendMessage(successMessage, ticket, wbot);

          // Mudar o estado para DONE e depois limpar
          state.step = SchedulingStep.DONE;
          state.appointmentId = appointment.id;
          await this.saveConversationState(ticket.id, ticket.companyId, state);
          // Agora sim, finalizar o fluxo corretamente
          await this.finishFlowIfNeeded(ticket, state.flowExecutionId);
          await this.removeConversationState(ticket.id, ticket.companyId);
          
        } catch (txError) {
          // Em caso de erro, desfaz a transaction
          await transaction.rollback();
          throw txError;
        }
      } catch (error) {
        logger.error(`[APPOINTMENT_CHATBOT] Erro ao criar agendamento: ${error.message}`);
        await this.sendMessage(
          "Desculpe, ocorreu um erro ao finalizar seu agendamento. Por favor, tente novamente mais tarde ou entre em contato com nossa equipe de suporte.",
          ticket,
          wbot
        );
        
        // Limpar o estado da conversa
        await this.removeConversationState(ticket.id, ticket.companyId);
      }
      
    } else if (response === "CANCELAR") {
      await this.sendMessage(
        "Agendamento cancelado. Caso deseje agendar novamente, digite *AGENDA* a qualquer momento.",
        ticket,
        wbot
      );
      
      // Se estava em um fluxo, atualizar a execução
      if (state.isInFlow && state.flowExecutionId) {
        const execution = await FlowBuilderExecution.findByPk(state.flowExecutionId);
        if (execution) {
          await execution.update({
            variables: {
              ...execution.variables,
              __appointmentCompleted: true,
              __appointmentResult: "cancelled",
              __lastAction: "appointment_cancelled",
              __awaitingResponse: false,
              __awaitingResponseFor: null,
              __responseValidation: null,
              __validationAttempts: 0,
              __lastQuestionTimestamp: null
            },
            status: "completed"
          });

          await execution.reload();
        }
        
        // Mudar o estado para DONE
        state.step = SchedulingStep.DONE;
        await this.saveConversationState(ticket.id, ticket.companyId, state);
        
        // Finalizar o fluxo
        await this.finishFlowIfNeeded(ticket, state.flowExecutionId);
      } else {
        // Limpar o estado da conversa
        await this.removeConversationState(ticket.id, ticket.companyId);
      }
      
    } else {
      await this.sendMessage(
        "Por favor, responda com *CONFIRMAR* para finalizar o agendamento ou *CANCELAR* para desistir.",
        ticket,
        wbot
      );
      await this.saveConversationState(ticket.id, ticket.companyId, state);
    }
    
    return true;
  }

  private static async handleViewAppointmentsStep(
    bodyMessage: string,
    ticket: Ticket,
    contact: Contact,
    wbot: Session,
    state: ChatbotStateData
  ): Promise<boolean> {
    if (bodyMessage === "0") {
      // Voltar para o menu principal
      state.step = SchedulingStep.WELCOME;
      await this.saveConversationState(ticket.id, ticket.companyId, state);
      
      const settings = await ScheduleSettings.findOne({
        where: { companyId: ticket.companyId }
      });
      await this.sendWelcomeMessage(ticket, wbot, settings);
      return true;
    }
    
    const selection = parseInt(bodyMessage);
    
    // Validar seleção
    if (isNaN(selection) || selection < 1 || selection > state.upcomingAppointments.length) {
      await this.sendMessage("Seleção inválida. Por favor, escolha um número válido da lista de agendamentos ou digite *0* para voltar ao menu principal.", ticket, wbot);
      
      // Reenviar lista de agendamentos
      let appointmentsMessage = "Seus agendamentos ativos:\n\n";
      
      state.upcomingAppointments.forEach((appointment, index) => {
        const scheduledAt = moment(appointment.scheduledAt);
        appointmentsMessage += `*${index + 1}* - ${appointment.serviceName} com ${appointment.professionalName}\n`;
        appointmentsMessage += `Data: ${scheduledAt.format("DD/MM/YYYY")}\n`;
        appointmentsMessage += `Horário: ${scheduledAt.format("HH:mm")}\n\n`;
      });
      
      appointmentsMessage += "Digite o número do agendamento para ver mais opções ou *0* para voltar ao menu principal.";
      
      await this.sendMessage(appointmentsMessage, ticket, wbot);
      await this.saveConversationState(ticket.id, ticket.companyId, state);
      return true;
    }
    
    // Mostrar opções para o agendamento selecionado
    const selectedAppointment = state.upcomingAppointments[selection - 1];
    const appointmentDate = moment(selectedAppointment.scheduledAt);
    
    let appointmentDetailsMessage = "Detalhes do agendamento:\n\n";
    appointmentDetailsMessage += `*Serviço:* ${selectedAppointment.serviceName}\n`;
    appointmentDetailsMessage += `*Profissional:* ${selectedAppointment.professionalName}\n`;
    appointmentDetailsMessage += `*Data:* ${appointmentDate.format("DD/MM/YYYY")}\n`;
    appointmentDetailsMessage += `*Horário:* ${appointmentDate.format("HH:mm")}\n\n`;
    appointmentDetailsMessage += "Opções:\n";
    appointmentDetailsMessage += "*1* - Cancelar este agendamento\n";
    appointmentDetailsMessage += "*0* - Voltar para a lista de agendamentos\n";
    
    await this.sendMessage(appointmentDetailsMessage, ticket, wbot);
    
    // Atualizar estado
    state.step = SchedulingStep.CANCEL_APPOINTMENT;
    state.appointmentId = selectedAppointment.id;
    await this.saveConversationState(ticket.id, ticket.companyId, state);
    
    return true;
  }

  private static async handleCancelAppointmentStep(
    bodyMessage: string,
    ticket: Ticket,
    contact: Contact,
    wbot: Session,
    state: ChatbotStateData
  ): Promise<boolean> {
    if (bodyMessage === "0") {
      // Voltar para a lista de agendamentos
      state.step = SchedulingStep.VIEW_APPOINTMENTS;
      await this.saveConversationState(ticket.id, ticket.companyId, state);
      
      // Reenviar lista de agendamentos
      let appointmentsMessage = "Seus agendamentos ativos:\n\n";
      
      state.upcomingAppointments.forEach((appointment, index) => {
        const scheduledAt = moment(appointment.scheduledAt);
        appointmentsMessage += `*${index + 1}* - ${appointment.serviceName} com ${appointment.professionalName}\n`;
        appointmentsMessage += `Data: ${scheduledAt.format("DD/MM/YYYY")}\n`;
        appointmentsMessage += `Horário: ${scheduledAt.format("HH:mm")}\n\n`;
      });
      
      appointmentsMessage += "Digite o número do agendamento para ver mais opções ou *0* para voltar ao menu principal.";
      
      await this.sendMessage(appointmentsMessage, ticket, wbot);
      return true;
    }
    
    if (bodyMessage === "1") {
      // Cancelar o agendamento
      try {
        await AppointmentService.update(
          state.appointmentId,
          {
            status: "cancelled",
            cancellationReason: "Cancelado pelo cliente via WhatsApp"
          },
          ticket.companyId
        );
        
        await this.sendMessage("Seu agendamento foi cancelado com sucesso.", ticket, wbot);
        
        // Se estava em um fluxo, atualizar execução
        if (state.isInFlow && state.flowExecutionId) {
          const execution = await FlowBuilderExecution.findByPk(state.flowExecutionId);
          if (execution) {
            await execution.update({
              variables: {
                ...execution.variables,
                __appointmentCancelled: true,
                __appointmentId: state.appointmentId
              }
            });
          }
          
          // Definir estado como DONE
          state.step = SchedulingStep.DONE;
          await this.saveConversationState(ticket.id, ticket.companyId, state);
          
          // Finalizar o fluxo
          await this.finishFlowIfNeeded(ticket, state.flowExecutionId);
        } else {
          // Voltar para o menu principal
          state.step = SchedulingStep.WELCOME;
          await this.saveConversationState(ticket.id, ticket.companyId, state);
          
          const settings = await ScheduleSettings.findOne({
            where: { companyId: ticket.companyId }
          });
          await this.sendWelcomeMessage(ticket, wbot, settings);
        }
        
      } catch (error) {
        logger.error(`[APPOINTMENT_CHATBOT] Erro ao cancelar agendamento: ${error.message}`);
        await this.sendMessage(
          "Desculpe, ocorreu um erro ao cancelar seu agendamento. Por favor, tente novamente mais tarde ou entre em contato com nossa equipe de suporte.",
          ticket,
          wbot
        );
        
        // Limpar o estado da conversa
        await this.removeConversationState(ticket.id, ticket.companyId);
        await this.finishFlowIfNeeded(ticket, state.flowExecutionId);
      }
      
    } else {
      await this.sendMessage(
        "Opção inválida. Por favor, escolha *1* para cancelar o agendamento ou *0* para voltar para a lista de agendamentos.",
        ticket,
        wbot
      );
      await this.saveConversationState(ticket.id, ticket.companyId, state);
    }
    
    return true;
  }

  // Método estático para limpar estados inativos (para ser chamado por um job)
  static async cleanInactiveStates(): Promise<void> {
    try {
      // Buscar estados expirados
      const expiredStates = await ChatbotState.findAll({
        where: {
          expiresAt: {
            [Op.lt]: new Date() // Busca todos os estados com expiresAt menor que a data atual
          }
        },
        include: [
          { 
            model: Ticket,
            include: [{ model: Contact }] // Inclui contato para garantir que estará disponível
          }
        ]
      });
      
      logger.info(`[APPOINTMENT_CHATBOT] Encontrados ${expiredStates.length} estados inativos para limpeza`);
      
      // Processar cada estado expirado
      for (const state of expiredStates) {
        try {
          // Verificar se o ticket e suas propriedades necessárias existem
          if (state.ticket && state.ticket.contact && state.ticket.contact.number && state.step !== SchedulingStep.DONE) {
            try {
              const wbot = await getWbot(state.ticket.whatsappId);
              
              if (wbot) {
                await this.sendMessage(
                  "Seu atendimento de agendamento foi encerrado devido a inatividade. Para iniciar novamente, digite *AGENDA* a qualquer momento.",
                  state.ticket,
                  wbot
                );
                logger.info(`[APPOINTMENT_CHATBOT] Mensagem de inatividade enviada para ticket ${state.ticketId}`);
                

                await this.finishFlowIfNeeded(state.ticket, state.flowExecutionId);
                
              } else {
                logger.warn(`[APPOINTMENT_CHATBOT] Não foi possível obter wbot para o ticket ${state.ticketId}`);
              }
            } catch (wbotError) {
              logger.error(`[APPOINTMENT_CHATBOT] Erro ao obter wbot para o ticket ${state.ticketId}: ${wbotError.message}`);
            }
          } else {
            logger.warn(`[APPOINTMENT_CHATBOT] Ticket, contato ou número inválido para o estado ${state.id}`);
          }
          
          // Remover do cache em memória
          this.conversationStates.delete(state.ticketId);
          
          // Excluir o registro do banco
          await state.destroy();
          
          logger.info(`[APPOINTMENT_CHATBOT] Estado inativo removido para ticket ${state.ticketId}`);
        } catch (stateError) {
          logger.error(`[APPOINTMENT_CHATBOT] Erro ao processar estado inativo ${state.id}: ${stateError.message}`);
        }
      }
    } catch (error) {
      logger.error(`[APPOINTMENT_CHATBOT] Erro ao limpar estados inativos: ${error.message}`);
    }
  }
}

export default handleAppointmentChatbot;