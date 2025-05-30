import express from "express";
import isAuth from "../middleware/isAuth";
import isSuper from "../middleware/isSuper";

import * as CompanyController from "../controllers/CompanyController";
import { celebrate, Joi, Segments } from "celebrate";

const routes = express.Router();

routes.post("/companies/cadastro", celebrate({
  [Segments.BODY]: {
    name: Joi.string().min(3).required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    planId: Joi.number().required(),
    cnpj: Joi.string().required(),
    razaosocial: Joi.string().allow(null, ''),
    cep: Joi.string().required(),
    estado: Joi.string().required(),
    cidade: Joi.string().required(),
    bairro: Joi.string().required(),
    logradouro: Joi.string().required(),
    numero: Joi.string().allow(null, ''),
    complemento: Joi.string().allow(null, '')
  }
}), CompanyController.signup);

// Rotas públicas (não requerem autenticação)
routes.get("/companies/check-email/:email", celebrate({
  [Segments.PARAMS]: {
    email: Joi.string().email().required()
  }
}), CompanyController.checkEmail);

routes.get("/companies/check-phone/:phone", celebrate({
  [Segments.PARAMS]: {
    phone: Joi.string().required()
  }
}), CompanyController.checkPhone);


routes.get("/companies/apicnpj/:cnpj", celebrate({
  [Segments.PARAMS]: {
    cnpj: Joi.string().required()
  }
}), CompanyController.apiCnpj);

// Settings públicas
routes.get('/company-settings-all', CompanyController.getAllSettingsFirst);

routes.get("/companiesPlan", CompanyController.indexPlan);

// Rotas de configurações
routes.get('/company-settings/:companyId', celebrate({
  [Segments.PARAMS]: {
    companyId: Joi.number().required()
  }
}), CompanyController.getAllSettings);

routes.get('/company-settings-one', celebrate({
  [Segments.QUERY]: {
    key: Joi.string().required()
  }
}), CompanyController.getSetting);


// CRUD básico de empresas (requer super admin)
routes.get("/companies", isAuth, isSuper, CompanyController.index);
routes.post("/companies", isAuth, isSuper, CompanyController.store);
routes.get("/companies/basic/list", isAuth, isSuper, CompanyController.listBasic);
routes.get("/companies/total", isAuth, isSuper, CompanyController.total);

// Ações específicas em empresas
routes.get("/companies/:id", celebrate({
  [Segments.PARAMS]: {
    id: Joi.number().required()
  }
}), isAuth, isSuper, CompanyController.show);

routes.put("/companies/:id", celebrate({
  [Segments.PARAMS]: {
    id: Joi.number().required()
  },
  [Segments.BODY]: {
    name: Joi.string().min(2).max(100),
    email: Joi.string().email(),
    phone: Joi.string(),
    urlPBX: Joi.string().allow('').allow(null),
    planId: Joi.number(),
    dueDate: Joi.date(),
    recurrence: Joi.string().valid("MENSAL", "BIMESTRAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL")
  }
}), isAuth, isSuper, CompanyController.updateFromAdmin);

routes.delete("/companies/:id", celebrate({
  [Segments.PARAMS]: {
    id: Joi.number().required()
  }
}), isAuth, isSuper, CompanyController.remove);

// Rotas de planos
routes.get("/companies/listPlan/:id", celebrate({
  [Segments.PARAMS]: {
    id: Joi.number().required()
  }
}), isAuth, CompanyController.listPlan);

routes.put("/companies/:id/block", celebrate({
  [Segments.PARAMS]: {
    id: Joi.number().required()
  }
}), isAuth, isSuper, CompanyController.block);

routes.put('/company-settings/:id', celebrate({
  [Segments.PARAMS]: {
    id: Joi.number().required()
  },
  [Segments.BODY]: {
    key: Joi.string().required(),
    value: Joi.string().required()
  }
}), isAuth, CompanyController.updateSetting);

routes.get(
  "/companies/:id/details",
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.number().required()
    }
  }),
  isAuth,
  CompanyController.getDetails
);


routes.post("/companies/:id/send-invoice-email", celebrate({
  [Segments.PARAMS]: {
    id: Joi.number().required()
  }
}), isAuth, isSuper, CompanyController.sendInvoiceEmail);

routes.post("/companies/:id/send-invoice-whatsapp", celebrate({
  [Segments.PARAMS]: {
    id: Joi.number().required()
  }
}), isAuth, isSuper, CompanyController.sendInvoiceWhatsapp);

routes.put("/companies/:id/schedules", celebrate({
  [Segments.PARAMS]: {
    id: Joi.number().required()
  },
  [Segments.BODY]: {
    schedules: Joi.array().items(
      Joi.object({
        weekday: Joi.string().required(),
        weekdayEn: Joi.string().required(),
        startTime: Joi.string().allow('', null),
        endTime: Joi.string().allow('', null),
        startLunchTime: Joi.string().allow('', null),
        endLunchTime: Joi.string().allow('', null)
      })
    ).required(),
    type: Joi.string().valid('company', 'queue').required(),
    queueId: Joi.number().when('type', {
      is: 'queue',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  }
}), isAuth, CompanyController.updateSchedules);

// Adicionar novas rotas para gerenciamento de horários
routes.get("/companies/:id/queues", celebrate({
  [Segments.PARAMS]: {
    id: Joi.number().required()
  }
}), isAuth, CompanyController.getCompanyQueues);

routes.get("/companies/:id/schedules", celebrate({
  [Segments.PARAMS]: {
    id: Joi.number().required()
  },
  [Segments.QUERY]: {
    type: Joi.string().valid('company', 'queue').default('company'),
    queueId: Joi.number().when('type', {
      is: 'queue',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  }
}), isAuth, CompanyController.getSchedules);

routes.get(
  "/companies/:companyId/users",
  celebrate({
    [Segments.PARAMS]: {
      companyId: Joi.number().required()
    },
    [Segments.QUERY]: {
      pageNumber: Joi.number(),
    }
  }),
  isAuth, isSuper, CompanyController.listUsers
);

routes.get(
  "/companies/:companyId/invoices",
  celebrate({
    [Segments.PARAMS]: {
      companyId: Joi.number().required()
    }
  }),
  isAuth, isSuper,CompanyController.listInvoices
);

// Rota para buscar resumo de usuários (contadores)
routes.get(
  "/companies/:companyId/users/summary",
  celebrate({
    [Segments.PARAMS]: {
      companyId: Joi.number().required()
    }
  }),
  isAuth, isSuper, CompanyController.getUsersSummary
);

// Rota para buscar resumo de faturas (contadores)
routes.get(
  "/companies/:companyId/invoices/summary",
  celebrate({
    [Segments.PARAMS]: {
      companyId: Joi.number().required()
    },
    [Segments.QUERY]: {
      year: Joi.number(),
      month: Joi.number()
    }
  }),
  isAuth, isSuper, CompanyController.getInvoicesSummary
);

routes.put("/companies/:id/unblock", isAuth, isSuper, CompanyController.unblock);

routes.get(
  "/companies/export/:format",
  celebrate({
    [Segments.PARAMS]: {
      format: Joi.string().valid('pdf', 'excel').required()
    }
  }),
  isAuth, isSuper, CompanyController.exportCompanies
);

export default routes;