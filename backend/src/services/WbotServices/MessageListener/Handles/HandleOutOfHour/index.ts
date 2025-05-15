import { isNil } from "../../../../../utils/helpers";
import Setting from "../../../../../models/Setting";
import Ticket from "../../../../../models/Ticket";
import Whatsapp from "../../../../../models/Whatsapp";
import { Session } from "../../../../../libs/wbot";
import formatBody from "../../../../../helpers/Mustache";
import { debounce } from "../../../../../helpers/Debounce";
import { randomValue } from "../../../../../queues";
import { cacheLayer } from "../../../../../libs/cache";
import Queue from "../../../../../models/Queue";
import moment from "moment";


/**
 * @description Trata o envio de mensagens quando a empresa está fora do expediente.
 * Este bloco de código verifica se a mensagem deve ser enviada com base no tipo de agendamento
 * (empresa ou fila) e se a empresa está fora do horário de funcionamento. Se a mensagem de
 * "fora do expediente" deve ser enviada, ela é formatada e enviada ao contato apropriado.
 */
export const handleOutOfHour = async (
    wbot: Session,
    ticket: Ticket,
    scheduleType?: Setting,
    contact?: any,
    currentSchedule?: any,
    whatsapp?: Whatsapp,
    outOfHourMessageControl?: any[]
  ): Promise<boolean> => {
    try {
      if (outOfHourMessageControl.length > 1) outOfHourMessageControl = []; // Limpa o controle se exceder 5000 mensagens
  
      /**
       * Tratamento para envio de mensagem quando a empresa está fora do expediente
       */
      let lastOffMessage = outOfHourMessageControl.find(
        o => o.ticketId === ticket.id || o.dest === contact.number // Verifica se já foi enviada uma mensagem "fora do expediente"
      );
  
      if (
        scheduleType.value === "company" && // Verifica se o tipo de agendamento é "empresa"
        !isNil(currentSchedule) && // Verifica se o agendamento atual não é nulo
        whatsapp.outOfHoursMessage && // Verifica se há mensagem de "fora do expediente"
        (!currentSchedule || currentSchedule.inActivity === false) // Verifica se o agendamento atual não está ativo
      ) {
        if (
          !lastOffMessage || // Se não há mensagem anterior
          (lastOffMessage &&
            //lastOffMessage.time + 1000 * 60 * 5 < new Date().getTime()) // Se a última mensagem foi enviada há mais de 5 minutos
            lastOffMessage.time + 1000 * 1 < new Date().getTime()) // Se a última mensagem foi enviada há mais de 5 segundos
        ) {
          if (lastOffMessage) {
            outOfHourMessageControl = outOfHourMessageControl.filter(
              o => o.ticketId !== ticket.id // Remove a mensagem anterior do controle
            );
            lastOffMessage = null; // Reseta a última mensagem
          }
  
          if (!lastOffMessage) {
            outOfHourMessageControl.push({
              ticketId: ticket.id, // Adiciona nova mensagem ao controle
              dest: contact.number,
              time: new Date().getTime() // Marca o tempo da nova mensagem
            });
          }
  
          const body = formatBody(`\u200e ${whatsapp.outOfHoursMessage}`, ticket); // Formata a mensagem de "fora do expediente"
  
          const debouncedSentMessage = debounce(
            async () => {
              await wbot.sendMessage(
                `${ticket.contact.number}@${
                  ticket.isGroup ? "g.us" : "s.whatsapp.net"
                }`,
                {
                  text: body
                }
              );
            },
            randomValue(1500, 3500), // Define um atraso aleatório para o envio
            ticket.id
          );
          debouncedSentMessage(); // Chama a função de envio
          await cacheLayer.set(`ticket:${ticket?.id}:outOfHour`, "SEND");
          /** @description Reseta o chatbot */
          await ticket.update({
            queueOptionId: null,
            chatbot: false,
            queueId: null,
            amountUsedBotQueues: 0
          });
          return true;
        }
      }
      
      if (scheduleType.value === "queue" && ticket.queueId !== null) {
        /**
         * Tratamento para envio de mensagem quando a fila está fora do expediente
         */
        const queue = await Queue.findByPk(ticket.queueId); // Obtém a fila associada ao ticket
  
        const { schedules }: any = queue; // Obtém os horários da fila
        const now = moment(); // Obtém o momento atual
        const weekday = now.format("dddd").toLowerCase(); // Obtém o dia da semana atual
        let schedule = null; // Inicializa a variável de agendamento
  
        if (Array.isArray(schedules) && schedules.length > 0) {
          schedule = schedules.find(
            s =>
              s.weekdayEn === weekday && // Verifica se o dia da semana corresponde
              s.startTime !== "" &&
              s.startTime !== null &&
              s.endTime !== "" &&
              s.endTime !== null // Verifica se os horários de início e fim estão definidos
          );
        }

        if (
          scheduleType.value === "queue" && // Verifica se o tipo de agendamento é "fila"
          queue.outOfHoursMessage !== null &&
          queue.outOfHoursMessage !== "" &&
          !isNil(schedule) // Verifica se há mensagem de "fora do expediente" e se o agendamento é válido
        ) {
     
          const startTime = moment(schedule.startTime, "HH:mm"); // Obtém o horário de início
          const endTime = moment(schedule.endTime, "HH:mm"); // Obtém o horário de fim
  
          let isOutOfHours = now.isBefore(startTime) || now.isAfter(endTime); // Verifica se está fora do horário
          if (!isOutOfHours) {
            if (schedule.startLunchTime && schedule.endLunchTime) {
              const startLunchTime = moment(schedule.startLunchTime, "HH:mm"); // Obtém horário de início do almoço
              const endLunchTime = moment(schedule.endLunchTime, "HH:mm"); // Obtém horário de fim do almoço
              isOutOfHours = now.isBetween(startLunchTime, endLunchTime); // Verifica se está no horário de almoço
            }
          }
  
          if (isOutOfHours) {
            // Se estiver fora do horário
            if (
              !lastOffMessage || // Se não há mensagem anterior
              (lastOffMessage &&
                lastOffMessage.time + 1000 * 60 * 30 < new Date().getTime()) // Se a última mensagem foi enviada há mais de 30 minutos
            ) {
              const body = formatBody(queue.outOfHoursMessage, ticket); // Formata a mensagem de "fora do expediente"
              const debouncedSentMessage = debounce(
                async () => {
                  await wbot.sendMessage(
                    `${ticket.contact.number}@${
                      ticket.isGroup ? "g.us" : "s.whatsapp.net"
                    }`,
                    {
                      text: body
                    }
                  );
                },
                randomValue(1000, 3000), // Define um atraso aleatório para o envio
                ticket.id
              );
              debouncedSentMessage();
              await cacheLayer.set(`ticket:${ticket?.id}:outOfHour`, "SEND");
              /** @description Reseta o chatbot */
              await ticket.update({
                queueOptionId: null,
                chatbot: false,
                queueId: null,
                amountUsedBotQueues: 0
              });
              return true;
            }
  
            if (!lastOffMessage)
              outOfHourMessageControl.push({
                ticketId: ticket.id, // Adiciona nova mensagem ao controle
                dest: contact.number,
                time: new Date().getTime() // Marca o tempo da nova mensagem
              });
          }
        }
      }
    } catch (e) {
      
      console.log(e);
      await cacheLayer.set(`ticket:${ticket?.id}:outOfHour`, "NULL");
      return false;
    }
  };