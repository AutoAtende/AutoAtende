import { Router } from 'express';
import multer from 'multer';
import * as EmailController from '../controllers/emailController';
import DueDateEmailController from '../controllers/DueDateEmailController';
import TicketPdfEmailController from '../controllers/TicketPdfEmailController';
import isAuth from '../middleware/isAuth';
import isSuper from '../middleware/isSuper';

const router = Router();

// Configuração do Multer para processar o arquivo PDF
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Password reset routes
router.post('/email/forgot/request', EmailController.forgotRequest);
router.post('/email/forgot/reset', EmailController.forgotReset);

// Regular email routes
router.get('/email/list', isAuth, EmailController.list);
router.get('/email/list/schedules', isAuth, EmailController.listScheduled);
router.post('/email/scheduleAdd', isAuth, EmailController.scheduleAdd);
router.post('/email/send', isAuth, EmailController.send);

// Email management routes
router.post('/email/cancel/:id', isAuth, EmailController.cancelScheduledEmail);
router.post('/email/reschedule/:id', isAuth, EmailController.rescheduleEmail);
router.get('/email/export', isAuth, EmailController.exportEmails);
router.get('/email/stats', isAuth, EmailController.getEmailStats);
router.post('/email/test-config', isAuth, EmailController.testEmailConfig);
router.post('/email/resend/:id', isAuth, EmailController.resendEmail);

// Due date notification route
router.get('/email/services/sendDueDate', isAuth, isSuper, DueDateEmailController.sendDueDateEmails);

// Nova rota para envio de ticket PDF por email
router.post(
  '/email/send-ticket-pdf/:ticketId',
  isAuth,
  upload.single('pdfFile'),
  TicketPdfEmailController.sendTicketPdf
);

export default router;