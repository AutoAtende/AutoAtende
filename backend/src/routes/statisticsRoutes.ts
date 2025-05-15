import express from 'express';
import isAuth from "../middleware/isAuth";
import StatisticsController from '../controllers/StatisticsController';

const statistics = express.Router();

// Rota principal para obter todas as estatísticas
statistics.post('/all', isAuth, StatisticsController.getAllStatistics);

// Rotas individuais para cada tipo de estatística
statistics.post('/tickets-and-times', isAuth, StatisticsController.getTicketsAndTimes);
statistics.post('/tickets-channels', isAuth, StatisticsController.getTicketsChannels);
statistics.post('/tickets-evolution-by-period', isAuth, StatisticsController.getTicketsEvolution);
statistics.post('/tickets-per-users-detail', isAuth, StatisticsController.getTicketsPerUsersDetail);
statistics.post('/tickets-queue', isAuth, StatisticsController.getTicketsQueue);

// Rota para obter contatos (com novos parâmetros de filtro)
statistics.get('/contacts', isAuth, StatisticsController.getContacts);

// Rota para estatísticas por usuário
statistics.get('/per-user', isAuth, StatisticsController.getStatisticsPerUser);

// Rota para filas de tickets
statistics.get('/tickets-queues', isAuth, StatisticsController.getTicketsQueues);

export default statistics;