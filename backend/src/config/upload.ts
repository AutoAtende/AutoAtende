import path from "path";
import multer from "multer";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";

export const publicFolder = process.env.BACKEND_PUBLIC_PATH || path.resolve(__dirname, '..', '..', 'public');

// Garantir que a pasta pública existe
if (!fs.existsSync(publicFolder)) {
  fs.mkdirSync(publicFolder, { recursive: true });
}

// Tipos de mídia permitidos
const ALLOWED_MIME_TYPES = [
  // Imagens
  'image/jpeg',
  'image/pjpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  
  // Vídeos
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-ms-wmv',
  'video/x-matroska',
  'video/3gpp',
  'video/3gpp2',
  
  // Áudios
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/webm',
  'audio/aac',
  'audio/mp4',
  'audio/x-m4a',
  'audio/mp3',
  'audio/x-wav',
  
  // Documentos
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
];

// Configuração principal
export default {
  directory: publicFolder,
  fileSize: 50 * 1024 * 1024, // 50MB para suportar vídeos
  storage: multer.diskStorage({
    destination: async function (req, file, cb) {
      try {
        let companyId = req.user?.companyId;
        let typeArch = req.body.typeArch;
        const fileId = req.body.fileId;
        const fileListId = req.params.fileListId;
        const landingPageId = req.params.landingPageId;
        
        // Log detalhado
        logger.info(`[UPLOAD DESTINATION] Iniciando processamento de destino`);
        logger.info(`[UPLOAD DESTINATION] TypeArch: ${typeArch}, FileId: ${fileId}, FileListId: ${fileListId}, LandingPageId: ${landingPageId}`);
        logger.info(`[UPLOAD DESTINATION] Arquivo: ${file.originalname}, MIME: ${file.mimetype}`);

        // Verificação de companyId
        if (!companyId) {
          const authHeader = req.headers.authorization;
          if (!authHeader) {
            throw new Error("Authorization header is missing");
          }

          const [, token] = authHeader.split(" ");
          const whatsapp = await Whatsapp.findOne({ where: { token } });
          
          if (!whatsapp?.companyId) {
            throw new Error("Invalid or missing companyId");
          }

          companyId = whatsapp.companyId;
        }

        // Caminho base da empresa
        const companyPath = path.resolve(publicFolder, `company${companyId}`);
        
        // Criar diretório da empresa se não existir
        if (!fs.existsSync(companyPath)) {
          logger.info(`[UPLOAD DESTINATION] Criando diretório da empresa: ${companyPath}`);
          fs.mkdirSync(companyPath, { recursive: true });
          fs.chmodSync(companyPath, 0o755);
        }

        // Determinar o diretório de destino
        let folder = companyPath;

        // Verificar se é um upload de Chat
        if (typeArch === "chat" || req.path.includes("/chats/")) {
          const chatDir = path.resolve(companyPath, "chats");
          if (!fs.existsSync(chatDir)) {
            fs.mkdirSync(chatDir, { recursive: true });
            fs.chmodSync(chatDir, 0o755);
          }
          folder = chatDir;
          logger.info(`[UPLOAD DESTINATION] Destino final para chat: ${folder}`);
          return cb(null, folder);
        }
        
        // Verificar se é um upload de Landing Page
        if (typeArch === "landingPage" || 
            req.path.includes("/landing-pages/") && 
            req.path.includes("/media/upload")) {
          
          logger.info(`[UPLOAD DESTINATION] Detectado upload de Landing Page`);
          
          // Pasta para landing pages
          const landingPageDir = path.resolve(companyPath, "landingPages");
          if (!fs.existsSync(landingPageDir)) {
            logger.info(`[UPLOAD DESTINATION] Criando diretório de landing pages: ${landingPageDir}`);
            fs.mkdirSync(landingPageDir, { recursive: true });
            fs.chmodSync(landingPageDir, 0o755);
          }
          
          // Se tiver ID da landing page, criar subdiretório específico
          if (landingPageId) {
            const specificLandingPageDir = path.resolve(landingPageDir, landingPageId.toString());
            if (!fs.existsSync(specificLandingPageDir)) {
              logger.info(`[UPLOAD DESTINATION] Criando diretório específico da landing page: ${specificLandingPageDir}`);
              fs.mkdirSync(specificLandingPageDir, { recursive: true });
              fs.chmodSync(specificLandingPageDir, 0o755);
            }
            folder = specificLandingPageDir;
          } else {
            folder = landingPageDir;
          }
          
          // Para consistência em todo o sistema
          req.body.typeArch = "landingPage";
          req.body.fileId = landingPageId || "landingPage";
          
          logger.info(`[UPLOAD DESTINATION] Destino final para landing page: ${folder}`);
          return cb(null, folder);
        }
        
        // Tratamento para uploadList
        const isFileListUpload = req.path.includes("/uploadList/");
        if (isFileListUpload) {
          folder = path.resolve(companyPath, "fileList", fileListId);
          req.body.typeArch = "fileList";
          req.body.fileId = fileListId;
        } 
        // Garantir que typeArch esteja definido para uploads do flow-builder
        else if (req.path.includes("/flow-builder/media/upload")) {
          typeArch = "flowBuilder";
          req.body.typeArch = "flowBuilder";
          folder = path.resolve(companyPath, "flowBuilder");
          logger.info("[UPLOAD DESTINATION] Definindo typeArch como flowBuilder para upload de mídia do flow-builder");
        }
        // Tratamento específico para quick-messages
        else if (req.path.includes("/quick-messages/")) {
          typeArch = "quickMessage";
          req.body.typeArch = "quickMessage";
          folder = path.resolve(companyPath, "quickMessage");
          logger.info("[UPLOAD DESTINATION] Definindo typeArch como quickMessage para upload de resposta rápida");
        }
        else if (req.path.includes("/professionals/profile-image")){
          typeArch = "professionals";
          req.body.typeArch = "professionals";
          folder = path.resolve(companyPath, "professionals");
          logger.info("[UPLOAD DESTINATION] Definindo typeArch como professionals para upload de foto de perfil de profissional");
        }
        // Tratamento para outros tipos
        else if (typeArch) {
          switch (typeArch) {
            case "internalChat":
              folder = path.resolve(companyPath, "internalChat");
              break;
            case "fileList":
            case "file":
              const targetId = fileId || fileListId;
              folder = path.resolve(companyPath, "fileList", targetId || "");
              break;
            case "quickMessage":
              folder = path.resolve(companyPath, "quickMessage");
              break;
            case "flowBuilder":
              folder = path.resolve(companyPath, "flowBuilder");
              break;
            case "logo":
              folder = path.resolve(companyPath, "logo");
              break;
            case "logos":
              folder = path.resolve(companyPath, "logos");
              break;
            case "background":
              folder = path.resolve(companyPath, "background");
              break;
            case "backgrounds":
              folder = path.resolve(companyPath, "backgrounds");
              break;
            case "professionals":
              folder = path.resolve(companyPath, "professionals");
              break;
            default:
              folder = path.resolve(companyPath, typeArch || "default", fileId || "");
          }
        }

        // Garantir que o diretório existe com permissões adequadas
        if (!fs.existsSync(folder)) {
          logger.info(`[UPLOAD DESTINATION] Criando diretório: ${folder}`);
          fs.mkdirSync(folder, { recursive: true });
          fs.chmodSync(folder, 0o755);
        } else {
          // Verificar e ajustar permissões mesmo se o diretório já existir
          try {
            fs.accessSync(folder, fs.constants.W_OK);
          } catch (err) {
            logger.info(`[UPLOAD DESTINATION] Ajustando permissões para diretório existente: ${folder}`);
            fs.chmodSync(folder, 0o755);
          }
        }

        logger.info(`[UPLOAD DESTINATION] Destino final confirmado: ${folder}`);
        cb(null, folder);
      } catch (err) {
        logger.error(`[UPLOAD DESTINATION] Erro ao definir destino: ${err.message}`);
        logger.error(`[UPLOAD DESTINATION] Stack: ${err.stack}`);
        cb(err, null);
      }
    },
    
    filename(req, file, cb) {
      try {
        // Validações básicas de segurança
        if (!file.originalname) {
          throw new Error("Nome de arquivo inválido");
        }
        
        // Limitar comprimento do nome original
        const truncatedName = file.originalname.length > 100 
          ? file.originalname.substring(0, 100) 
          : file.originalname;
          
        // Remover caracteres potencialmente problemáticos
        const sanitizedName = truncatedName.replace(/[^a-zA-Z0-9.-]/g, '_');
        
        // Gerar nome seguro com UUID
        const fileExtension = path.extname(sanitizedName);
        const fileName = `${uuidv4()}${fileExtension}`;
        
        // Preservar informação do nome original
        req.body.originalFilename = sanitizedName;

        logger.info(`[UPLOAD FILENAME] Gerando nome: ${fileName} - Original: ${sanitizedName}`);
        cb(null, fileName);
      } catch (err) {
        logger.error(`[UPLOAD FILENAME] Erro ao gerar nome do arquivo: ${err.message}`);
        cb(err, null);
      }
    }
  })
}