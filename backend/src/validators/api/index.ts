// validators/messagesValidators.ts
import * as Yup from 'yup';

export const sendMessageSchema = Yup.object().shape({
  // Defina o esquema de validação para envio de mensagem
});

export const linkPdfSchema = Yup.object().shape({
  // Defina o esquema de validação para link PDF
});

export const linkImageSchema = Yup.object().shape({
  // Defina o esquema de validação para link de imagem
});

export const checkNumberSchema = Yup.object().shape({
  // Defina o esquema de validação para verificação de número
});

export const handleAudioLinkSchema = Yup.object().shape({
  // Defina o esquema de validação para link de áudio
});
