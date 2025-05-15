import express from 'express';
import isAuth from "../middleware/isAuth";
import multer from 'multer';
import uploadConfig from '../config/upload';
import ProfessionalController from "../controllers/ProfessionalController";
import ServiceController from "../controllers/ServiceController";
import AvailabilityController from "../controllers/AvailabilityController";
import AppointmentController from "../controllers/AppointmentController";
import ScheduleSettingsController from "../controllers/ScheduleSettingsController";

const routes = express.Router();
const upload = multer(uploadConfig);

// Rota para upload de imagem de perfil do profissional
routes.post(
    "/professionals/profile-image",
    isAuth,
    (req, res, next) => {
      req.body.typeArch = "professionals";
      next();
    },
    upload.single('profileImage'),
    ProfessionalController.uploadProfileImage
  );

// Profissionais
routes.get("/professionals", isAuth, ProfessionalController.index);
routes.post("/professionals", isAuth, ProfessionalController.store);
routes.get("/professionals/:id", isAuth, ProfessionalController.show);
routes.put("/professionals/:id", isAuth, ProfessionalController.update);
routes.delete("/professionals/:id", isAuth, ProfessionalController.delete);

// Serviços
routes.get("/services", isAuth, ServiceController.index);
routes.post("/services", isAuth, ServiceController.store);
routes.get("/services/:id", isAuth, ServiceController.show);
routes.put("/services/:id", isAuth, ServiceController.update);
routes.delete("/services/:id", isAuth, ServiceController.delete);

// Disponibilidades
routes.get("/professionals/:professionalId/availabilities", isAuth, AvailabilityController.index);
routes.post("/professionals/:professionalId/availabilities", isAuth, AvailabilityController.store);
routes.put("/availabilities/:id", isAuth, AvailabilityController.update);
routes.delete("/availabilities/:id", isAuth, AvailabilityController.delete);
routes.get("/availability/slots", isAuth, AvailabilityController.slots);

// Agendamentos
routes.get("/appointments", isAuth, AppointmentController.index);
routes.post("/appointments", isAuth, AppointmentController.store);
routes.get("/appointments/:id", isAuth, AppointmentController.show);
routes.put("/appointments/:id", isAuth, AppointmentController.update);
routes.delete("/appointments/:id", isAuth, AppointmentController.delete);
routes.post("/appointments/:uuid/customer-confirmation", isAuth, AppointmentController.customerConfirmation);
routes.get("/contacts/:contactId/appointments/:status?", isAuth, AppointmentController.getByContactAndStatus);

// Configurações de agendamento
routes.get("/schedule/settings", isAuth, ScheduleSettingsController.show);
routes.put("/schedule/settings", isAuth, ScheduleSettingsController.update);

export default routes;