import { Router } from 'express';
import multer from 'multer';
import isAuth from '../middleware/isAuth';
import isAdmin from '../middleware/isAdmin';
import LandingPageController from '../controllers/LandingPageController';
import FormController from '../controllers/FormController';
import LandingPageMediaController from '../controllers/LandingPageMediaController';
import uploadConfig from '../config/upload';

const landingPageRoutes = Router();
const upload = multer(uploadConfig);

// O FormController já é exportado como uma instância singleton
const landingPageMediaController = new LandingPageMediaController();
const landingPageController = new LandingPageController();

// Limitador de taxa para submissões de formulário - acessando o método estático diretamente da classe
// Esta é a linha corrigida:
const FormControllerClass = Object.getPrototypeOf(FormController).constructor;
const formSubmissionRateLimiter = FormControllerClass.getFormSubmissionRateLimiter();

// Rotas públicas para landing pages
landingPageRoutes.get('/landing-pages/company/:companyId/l/:slug', landingPageController.renderPublic);

// Rota para registrar visitas na landing page
landingPageRoutes.post('/landing-pages/company/:companyId/l/:landingPageId/visit', landingPageController.recordVisit);

// Rota pública para submissão de formulário (com rate limiting)
landingPageRoutes.post(
  '/landing-pages/company/:companyId/l/:landingPageId/form/:formId/submit',
  formSubmissionRateLimiter,
  FormController.submitForm
);

// Landing Pages - CRUD administrativo
landingPageRoutes.get('/landing-pages', isAuth, isAdmin, landingPageController.index);
landingPageRoutes.get('/landing-pages/:id', isAuth, isAdmin, landingPageController.show);
landingPageRoutes.post('/landing-pages', isAuth, isAdmin, landingPageController.store);
landingPageRoutes.put('/landing-pages/:id', isAuth, isAdmin, landingPageController.update);
landingPageRoutes.delete('/landing-pages/:id', isAuth, isAdmin, landingPageController.destroy);

// Ações específicas para landing pages
landingPageRoutes.put('/landing-pages/:id/toggle-active', isAuth, isAdmin, landingPageController.toggleActive);
landingPageRoutes.get('/landing-pages/:id/qrcode', isAuth, isAdmin, landingPageController.generateQRCode);
landingPageRoutes.get('/landing-pages/check-slug/:slug/:id?', isAuth, isAdmin, landingPageController.checkSlug);

// Formulários associados às landing pages
landingPageRoutes.get('/landing-pages/:landingPageId/forms', isAuth, isAdmin, FormController.index);
landingPageRoutes.get('/forms/:id', isAuth, isAdmin, FormController.show);
landingPageRoutes.post('/forms', isAuth, isAdmin, FormController.store);
landingPageRoutes.put('/forms/:id', isAuth, isAdmin, FormController.update);
landingPageRoutes.delete('/forms/:id', isAuth, isAdmin, FormController.destroy);

// Submissões de formulários
landingPageRoutes.get('/landing-pages/:landingPageId/submissions', isAuth, isAdmin, FormController.getSubmissions);
landingPageRoutes.get('/forms/:formId/submissions', isAuth, isAdmin, FormController.getSubmissions);

// Gerenciamento de arquivos para landing pages
landingPageRoutes.post(
  '/landing-pages/:landingPageId/media/upload',
  isAuth,
  isAdmin,
  (req, res, next) => {
    req.body.typeArch = "landingPage";
    next();
  },
  upload.single('file'),
  landingPageMediaController.upload
);
landingPageRoutes.get('/landing-pages/:landingPageId/media', isAuth, isAdmin, landingPageMediaController.list);
landingPageRoutes.delete('/landing-pages/:landingPageId/media/:id', isAuth, isAdmin, landingPageMediaController.delete);

export default landingPageRoutes;