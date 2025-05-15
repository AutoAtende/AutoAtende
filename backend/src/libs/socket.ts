import { Server as SocketIO } from 'socket.io';
import { Server } from 'http';
import { verify } from "jsonwebtoken";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";

import User from '../models/User';
import Queue from "../models/Queue";
import Ticket from "../models/Ticket";
import Whatsapp from '../models/Whatsapp';
import { getJwtConfig } from "../config/auth";
import { CounterManager } from "./counter";
import { getRedisClient } from "../config/redis";

let io: SocketIO;
const connectionAttempts = new Map();

export const initIO = async (httpServer: Server): Promise<SocketIO> => {
  io = new SocketIO(httpServer, {
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'], 
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization", "Content-Type"]
    },
    connectTimeout: 60000
  });

  // Tentar configurar adaptador Redis para Socket.io, se disponível
  try {
    const redisClient = await getRedisClient();
    const pubClient = redisClient.duplicate();
    const subClient = redisClient.duplicate();
    
    // Importação dinâmica para evitar problemas de dependência
    try {
      const { createAdapter } = await import('@socket.io/redis-adapter');
      const redisAdapter = createAdapter(pubClient, subClient);
      io.adapter(redisAdapter);
      logger.info('Socket.io configurado com adaptador Redis');
    } catch (adapterError) {
      logger.error('Erro ao importar ou configurar adaptador Redis:', adapterError);
    }
  } catch (error) {
    logger.error('Falha ao obter cliente Redis para Socket.io:', error);
  }

  setInterval(() => {
    try {
      const now = Date.now();
      const expiryTime = 10 * 60 * 1000; // 10 minutos
      
      // Não podemos limpar diretamente o Map durante a iteração
      const ipsToRemove = [];
      
      connectionAttempts.forEach((attempts, ip) => {
        // Aqui poderia ter um timestamp armazenado junto com as tentativas
        // Como não temos, vamos limpar IPs com alta contagem periodicamente
        if (attempts > 10) {
          ipsToRemove.push(ip);
        }
      });
      
      ipsToRemove.forEach(ip => {
        connectionAttempts.delete(ip);
        logger.debug(`IP ${ip} removido do mapa de tentativas de conexão`);
      });
      
      logger.debug(`Limpeza do mapa de tentativas de conexão: ${ipsToRemove.length} IPs removidos`);
    } catch (error) {
      logger.error('Erro ao limpar mapa de tentativas de conexão:', error);
    }
  }, 10 * 60 * 1000);

  // Monitoramento periódico de saúde do socket.io
  setInterval(() => {
    try {
      const connectedClients = io.engine.clientsCount;
      logger.info(`Socket.io status: ${connectedClients} clientes conectados`);
      
      // Verificação mais simples das conexões ativas
      if (io.sockets) {
        const activeConnections = Object.keys(io.sockets.sockets).length;
        if (activeConnections > 100) { // Número alto de conexões
          logger.warn(`Alto número de conexões ativas: ${activeConnections}`);
        }
      }
    } catch (error) {
      logger.error('Erro ao verificar estado do Socket.io:', error);
    }
  }, 30000);

  io.use(async (socket, next) => {
    try {
      const { token } = socket.handshake.query;
      
      if (!token || typeof token !== 'string') {
        return next(new Error('Token não fornecido'));
      }
  
      const clientIp = socket.handshake.address;
      const attempts = connectionAttempts.get(clientIp) || 0;
      
      // Rate limiting simples baseado em Map
      if (attempts > 20) { // Limite de 20 tentativas por IP
        logger.warn(`Rate limit excedido para IP ${clientIp}: ${attempts} tentativas`);
        return next(new Error('Muitas tentativas de conexão'));
      }
  
      try {
        const jwtConfig = await getJwtConfig();
        const decoded = verify(token, jwtConfig.secret);
        
        // Verificar expiração do token manualmente para mensagens mais claras
        const tokenData = decoded as any;
        if (tokenData.exp && tokenData.exp < Math.floor(Date.now() / 1000)) {
          logger.warn(`Token expirado para IP ${clientIp}`);
          connectionAttempts.set(clientIp, attempts + 1);
          return next(new Error('Token expirado'));
        }
        
        socket.data.user = decoded;
        connectionAttempts.delete(clientIp); // Limpar contagem de tentativas após sucesso
        next();
      } catch (err) {
        connectionAttempts.set(clientIp, attempts + 1);
        logger.warn(`Falha de autenticação para IP ${clientIp}: ${err.message}`);
        next(new Error('Token inválido'));
      }
    } catch (err) {
      logger.error(`Erro no middleware de autenticação: ${err.message}`);//
      next(err);
    }
  });

  io.on("connection", async (socket) => {
    try {
      const userData = socket.data.user;
      if (!userData?.id) {
        logger.warn("ID de usuário inválido");
        return socket.disconnect(true);
      }

      const user = await User.findByPk(userData.id, { include: [Queue] });
      if (!user) {
        logger.warn(`Usuário ${userData.id} não encontrado`);
        return socket.disconnect(true);
      }

      user.online = true;
      await user.save();
      
      logger.info(`Cliente Conectado => userId: ${user.id}, ip: ${socket.handshake.address}`);

      const counters = new CounterManager();

      socket.join(`company-${user.companyId}`);
      socket.join(`user-${user.id}`);
      socket.join(`company-${user.companyId}-tasks`);
      socket.join(`user-${user.id}-tasks`);
      socket.join(`company-${user.companyId}-mainchannel`);
      socket.join(`company-${user.companyId}-contact-import`);

      if (user.profile === "admin" || user.profile === "superv") {
        socket.join(`company-${user.companyId}-admin-tasks`);
      }

      // Emitir evento de confirmação de conexão
      socket.emit('connection_established', {
        userId: user.id,
        timestamp: new Date(),
        status: 'connected'
      });

      // Manter conexão ativa com pings periódicos
      const pingInterval = setInterval(() => {
        if (socket.connected) {
          socket.emit("ping", { timestamp: new Date() });
        } else {
          clearInterval(pingInterval);
        }
      }, 30000);

      socket.on("joinChatRoom", (chatId: string) => {
        logger.info(`User ${user.id} joined chat room: ${chatId}`);
        socket.join(`company-${user.companyId}-chat-${chatId}`);
      });
  
      socket.on("leaveChatRoom", (chatId: string) => {
        logger.info(`User ${user.id} left chat room: ${chatId}`);
        socket.leave(`company-${user.companyId}-chat-${chatId}`);
      });
  
      // Adicione um evento para notificação de chat
      socket.on("chat-message", async (data) => {
        const { chatId, message } = data;
        
        // Emite para todos na sala específica do chat
        io.to(`company-${user.companyId}-chat-${chatId}`).emit(`company-${user.companyId}-chat-${chatId}`, {
          action: "new-message",
          message
        });
  
        // Emite notificação para todos os usuários da empresa
        io.to(`company-${user.companyId}-mainchannel`).emit("chat-notification", {
          chatId,
          message
        });
  
        logger.info(`Chat message sent in room: company-${user.companyId}-chat-${chatId}`);
      });

      // Monitorar eventos de pong do cliente
      socket.on("pong", (data) => {
        logger.debug(`Pong recebido de ${user.id}: ${JSON.stringify(data)}`);
      });

      socket.on("requestWhatsAppStatus", async ({ whatsAppId }) => {
        try {
          const whatsapp = await Whatsapp.findByPk(whatsAppId);
          if (whatsapp) {
            socket.emit(`company-${whatsapp.companyId}-whatsappSession`, {
              action: "update",
              session: whatsapp
            });
          }
        } catch (err) {
          logger.error("Error fetching WhatsApp status:", err);
        }
      });

      socket.on(`company-${user.companyId}-contact-import`, (data) => {
        try {
          logger.info(`Importação de contatos para company ${user.companyId}:`, {
            jobId: data.jobId,
            action: data.action,
            progress: data?.data?.percentage,
            message: data?.data?.message
          });
          emitContactImportProgress(user.companyId, data);
          
        } catch (error) {
          logger.error('Erro ao processar evento de importação de contatos:', error);
        }
      });

      socket.on("task-update", async (data) => {
        logger.info(`Tarefa atualizada: ${JSON.stringify(data)}`);
        
        io.to(`company-${user.companyId}-tasks`).emit('task-update', {
          ...data,
          timestamp: new Date(),
        });

        if (data.responsibleUserId) {
          io.to(`user-${data.responsibleUserId}-tasks`).emit('task-update', {
            ...data,
            timestamp: new Date(),
          });
        }
      });

      socket.on("joinWaVersions", () => {
        socket.join(`company-${user.companyId}-versions`);
        logger.info(`Usuário ${user.id} entrou na sala de versões do WhatsApp`);
      });

      socket.on("leaveWaVersions", () => {
        socket.leave(`company-${user.companyId}-versions`);
        logger.info(`Usuário ${user.id} saiu da sala de versões do WhatsApp`);
      });

      socket.on(`company-${user.companyId}-asaasServices`, (data) => {
        if (data.action === "update") {
          socket.to(`company-${user.companyId}-mainchannel`).emit("asaasServices", data);
        }
      });
    
      socket.on(`company-${user.companyId}-asaasSchedule`, (data) => {
        if (data.action === "update" || data.action === "error") {
          socket.to(`company-${user.companyId}-mainchannel`).emit("asaasSchedule", data);
        }
      });

      socket.on("joinChatBox", async (ticketId: string) => {
        if (!ticketId || ticketId === 'undefined') return;

        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket || ticket.companyId !== user.companyId) return socket.disconnect(true);

        if (ticket.userId === user.id || user.profile === "admin" || user.allTicket) {
          counters.incrementCounter(`ticket-${ticketId}`);
          socket.join(ticketId);
        } else {
          socket.disconnect(true);
        }
      });

      socket.on("leaveChatBox", (ticketId: string) => {
        if (!ticketId) return socket.disconnect(true);
        counters.decrementCounter(`ticket-${ticketId}`);
        socket.leave(ticketId);
      });

      socket.on("joinNotification", () => {
        const counter = counters.incrementCounter("notification");
        if (counter === 1) {
          if (user.profile === "admin" || user.allTicket) {
            socket.join(`company-${user.companyId}-notification`);
          } else {
            user.queues.forEach((queue) => socket.join(`queue-${queue.id}-notification`));
          }
        }
      });

      socket.on("leaveNotification", () => {
        const counter = counters.decrementCounter("notification");
        if (counter === 0) {
          if (user.profile === "admin") {
            socket.leave(`company-${user.companyId}-notification`);
          } else {
            user.queues.forEach((queue) => socket.leave(`queue-${queue.id}-notification`));
          }
        }
      });

      socket.on("typing", async (data) => {
        try {
          const { ticketId, status } = data;
          if (!ticketId) return;
      
          const ticket = await Ticket.findByPk(ticketId);
          if (!ticket) return;
      
          io.to(ticketId.toString()).emit(`company-${ticket.companyId}-presence`, {
            ticketId: ticket.id,
            presence: status ? "composing" : "available"
          });
        } catch (err) {
          logger.error("Erro ao processar evento typing:", err);
        }
      });
      
      socket.on("recording", async (data) => {
        try {
          const { ticketId, status } = data;
          if (!ticketId) return;
      
          const ticket = await Ticket.findByPk(ticketId);
          if (!ticket) return;
      
          io.to(ticketId.toString()).emit(`company-${ticket.companyId}-presence`, {
            ticketId: ticket.id,
            presence: status ? "recording" : "available"
          });
        } catch (err) {
          logger.error("Erro ao processar evento recording:", err);
        }
      });

      // Adicionar eventos para streaming de áudio
      socket.on("joinAudioStream", async (ticketId: string) => {
        logger.info({
          userId: user.id,
          ticketId
        }, "Usuário entrou em stream de áudio");
        
        socket.join(`audio-stream-${ticketId}`);
      });

      socket.on("leaveAudioStream", (ticketId: string) => {
        logger.info({
          userId: user.id,
          ticketId
        }, "Usuário saiu de stream de áudio");
        
        socket.leave(`audio-stream-${ticketId}`);
      });

      socket.on("audioChunk", async (data: { ticketId: string, chunk: string, last: boolean }) => {
        try {
          const { ticketId, chunk, last } = data;
          
          // Verificar permissão para o ticket
          const ticket = await Ticket.findByPk(ticketId);
          if (!ticket || ticket.companyId !== user.companyId) {
            return socket.disconnect(true);
          }
          
          // Enviar o chunk para outros usuários no stream
          socket.to(`audio-stream-${ticketId}`).emit("incomingAudioChunk", {
            ticketId,
            chunk,
            userId: user.id,
            timestamp: new Date(),
            last
          });
          
          // Se for o último chunk, processar o áudio completo
          if (last) {
            // Lógica para finalizar o streaming e processar o áudio
            // (implementação detalhada necessária)
          }
        } catch (err) {
          logger.error({
            userId: user.id,
            error: err.message
          }, "Erro ao processar chunk de áudio");
        }
      });

      // Monitorar eventos de erro
      socket.on("error", (error) => {
        logger.error(`Erro de socket para usuário ${user.id}:`, error);
      });

      socket.on("disconnect", async (reason) => {
        logger.info(`Cliente desconectado: ${user.id}, razão: ${reason}`);
        user.online = false;
        await user.save();
        
        // Limpar intervalo de ping
        clearInterval(pingInterval);
        
        socket.leave(`company-${user.companyId}-tasks`);
        socket.leave(`user-${user.id}-tasks`);
        if (user.profile === "admin" || user.profile === "superv") {
          socket.leave(`company-${user.companyId}-admin-tasks`);
        }
        socket.leave(`company-${user.companyId}-versions`);

        // Sair de todas as salas de chat
        const rooms = socket.rooms;
        rooms.forEach(room => {
          if (room.startsWith(`company-${user.companyId}-chat-`)) {
            socket.leave(room);
            logger.info(`User ${user.id} left chat room: ${room}`);
          }
        });
      });

    } catch (err) {
      logger.error('Erro na conexão do socket:', err);
      socket.disconnect(true);
    }
  });

  // Gestão periódica de saúde do socket.io
  setInterval(() => {
    try {
      const clientsCount = io.engine.clientsCount;
      logger.debug(`Status do Socket.io: ${clientsCount} clientes conectados`);
    } catch (error) {
      logger.error('Erro ao verificar status do Socket.io:', error);
    }
  }, 60000); // Verificar a cada minuto

  return io;
};

export const getIO = (): SocketIO => {
  if (!io) {
    throw new AppError("Socket IO não inicializado");
  }
  return io;
};

// Adicionando função para emitir eventos de autenticação
export const emitAuthEvent = (companyId: number, userId: number, data: any) => {
  if (!io) {
    logger.error("Socket IO não inicializado ao tentar emitir evento de autenticação");
    return;
  }

  try {
    // Emitir evento para toda a empresa
    io.to(`company-${companyId}`).emit(`company-${companyId}-auth`, {
      ...data,
      user: {
        id: userId,
        ...data.user
      },
      timestamp: new Date()
    });

    logger.info(`Evento de autenticação emitido para company-${companyId} - usuário ${userId}`, {
      action: data.action
    });
  } catch (error) {
    logger.error('Erro ao emitir evento de autenticação:', error);
  }
};

export const emitTaskUpdate = (companyId: number, data: any) => {
  if (!io) {
    logger.error("Socket IO não inicializado ao tentar emitir atualização de tarefa");
    return;
  }

  try {
    io.to(`company-${companyId}-tasks`).emit('task-update', {
      ...data,
      timestamp: new Date()
    });

    if (data.responsibleUserId) {
      io.to(`user-${data.responsibleUserId}-tasks`).emit('task-update', {
        ...data,
        timestamp: new Date()
      });
    }

    io.to(`company-${companyId}-admin-tasks`).emit('task-update', {
      ...data,
      timestamp: new Date()
    });

    logger.info(`Evento task-update emitido para company-${companyId}`, {
      data: JSON.stringify(data)
    });
  } catch (error) {
    logger.error('Erro ao emitir evento task-update:', error);
  }
};

export const emitWaVersionUpdate = (companyId: number, data: any) => {
  if (!io) {
    logger.error("Socket IO não inicializado ao tentar emitir atualização de versão do WhatsApp");
    return;
  }

  try {
    io.to(`company-${companyId}-versions`).emit('waversion', {
      ...data,
      timestamp: new Date()
    });

    logger.info(`Evento waversion emitido para company-${companyId}`, {
      data: JSON.stringify(data)
    });
  } catch (error) {
    logger.error('Erro ao emitir evento waversion:', error);
  }
};

// Ajuste na função emitContactImportProgress do socket.ts
export const emitContactImportProgress = (companyId: number, data: any) => {
  if (!io) {
    logger.error("Socket IO não inicializado ao tentar emitir progresso de importação");
    return;
  }

  try {
    // Garantir que o evento seja enviado com todos os dados necessários
    const emitData = {
      ...data,
      timestamp: new Date()
    };
    
    // Log detalhado para debug
    logger.info(`Emitindo evento contact-import para company-${companyId}`, {
      action: emitData.action,
      jobId: emitData.jobId,
      data: JSON.stringify(emitData.data || {})
    });
    
    // Emitir para o canal principal da empresa
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact-import`, emitData);
    
    // Emitir também para o canal específico do jobId, se existir
    if (emitData.jobId) {
      io.to(`job-${emitData.jobId}`).emit(`company-${companyId}-contact-import`, emitData);
    }
  } catch (error) {
    logger.error('Erro ao emitir evento contact-import:', error);
  }
};

export const emitChatNotification = (companyId: number, chatId: string, data: any) => {
  if (!io) {
    logger.error("Socket IO não inicializado ao tentar emitir notificação de chat");
    return;
  }

  try {
    io.to(`company-${companyId}-chat-${chatId}`).emit(`company-${companyId}-chat-${chatId}`, {
      action: 'new-message',
      ...data
    });

    logger.info(`Chat notification emitido para company-${companyId}-chat-${chatId}`, {
      data: JSON.stringify(data)
    });
  } catch (error) {
    logger.error('Erro ao emitir chat notification:', error);
  }
};