import multer from 'multer';
import uploadConfig from '../config/upload';
import * as VoiceController from '../controllers/VoiceController';
import { Router } from 'express';
import isAuth from '../middleware/isAuth';
import isAdmin from '../middleware/isAdmin';

const upload = multer(uploadConfig);

// Rotas para voz
const routes = Router();


// Upload e processamento de áudio
routes.post(
  '/tickets/:ticketId/audio',
  isAuth,
  upload.single('audio'),
  VoiceController.uploadAudio
);

// Geração de fala a partir de texto
routes.post(
  '/messages/:messageId/speech',
  isAuth,
  VoiceController.generateSpeech
);

// Configurações de voz
routes.get('/voice/config', isAuth, VoiceController.getVoiceConfig);
routes.put('/voice/config', isAuth, isAdmin, VoiceController.updateVoiceConfig);

// Histórico de mensagens de voz
routes.get(
  '/tickets/:ticketId/voice-messages',
  isAuth,
  VoiceController.getVoiceMessages
);

export default routes;