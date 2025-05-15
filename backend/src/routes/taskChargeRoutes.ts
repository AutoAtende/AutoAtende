import express from 'express';
import isAuth from '../middleware/isAuth';
import {
  addCharge,
  registerPayment,
  generateChargePDF,
  sendChargeEmail,
  getPaidCharges,
  getPendingCharges,
  getFinancialReport,
  getChargeStatsByEmployer
} from '../controllers/TaskChargeController';

const router = express.Router();

// Rotas para listagens e relatórios
router.get('/task/charges/pending', isAuth, getPendingCharges);
router.get('/task/charges/paid', isAuth, getPaidCharges);
router.get('/task/charges/report', isAuth, getFinancialReport);
router.get('/task/charges/employer/:employerId', isAuth, getChargeStatsByEmployer);

// Rotas para cobranças de tarefas
router.post('/task/:taskId/charge', isAuth, addCharge);
router.post('/task/:taskId/charge/payment', isAuth, registerPayment);
router.get('/task/:taskId/charge/pdf', isAuth, generateChargePDF);
router.post('/task/:taskId/charge/email', isAuth, sendChargeEmail);



export default router;