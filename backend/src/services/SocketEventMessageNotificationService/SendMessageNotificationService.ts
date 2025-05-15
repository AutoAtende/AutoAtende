import { getIO } from "../../libs/socket";
import { logger } from "../../utils/logger";

type TypeMessage = 'ERROR' | 'WARNING' | 'SUCCESS'

/**
 * @description Retorna o nome da ação correspondente ao tipo de mensagem.
 * @param {TypeMessage} type - O tipo da mensagem (ERROR, WARNING, SUCCESS).
 * @returns {string} O nome da ação associado ao tipo de mensagem.
 */
const getActionName = (type: TypeMessage) => {
  if (type === 'ERROR') return `message-notification-error`;
  if (type === 'WARNING') return `message-notification-warning`;
  if (type === 'SUCCESS') return `message-notification-success`;
}

/**
 * @description Esta função é uma alternativa ao AppError existente. 
 * Ela permite enviar notificações de mensagens para o frontend de forma 
 * centralizada, utilizando o socket.io. Ao invés de lançar um erro, 
 * esta função emite uma notificação que pode ser capturada pelo cliente, 
 * permitindo uma melhor experiência do usuário ao lidar com mensagens 
 * e atualizações em tempo real.
 * 
 * @param {number | string} companyId - O ID da empresa que está enviando a notificação.
 * @param {string} message - A mensagem a ser enviada como notificação.
 */
export const sendMessageNotificationToFrontend = (userId: number, companyId: number | string, message: string, type: TypeMessage) => {
  const io = getIO();

  io.to(`user-${userId}`).emit(`company-${companyId}-message-notification`, {
    action: getActionName(type),
    message
  });
  logger.warn(`[SOCKET EVENT EMIT] - ${message}`)
}