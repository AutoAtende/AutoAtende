// validators/CompanyValidators.ts

import * as Yup from 'yup';

// Tipo de dados para Company
export type CompanyData = {
  name: string;
  id?: number | string;
  phone?: string;
  email?: string;
  status?: boolean;
  planId?: number;
  campaignsEnabled?: boolean;
  dueDate?: any;
  recurrence?: string;
};

// Schema de validação para Company
export const CompanySchema = Yup.object().shape({
  name: Yup.string().required('O nome da empresa é obrigatório'),
  id: Yup.number().nullable().transform((value, originalValue) => (originalValue === '' ? null : value)),
  phone: Yup.string().nullable().transform((value, originalValue) => (originalValue === '' ? null : value)),
  email: Yup.string().email('Email inválido').nullable().transform((value, originalValue) => (originalValue === '' ? null : value)),
  status: Yup.boolean().nullable().transform((value, originalValue) => (originalValue === '' ? null : value)),
  planId: Yup.number().nullable().transform((value, originalValue) => (originalValue === '' ? null : value)),
  campaignsEnabled: Yup.boolean().nullable().transform((value, originalValue) => (originalValue === '' ? null : value)),
  dueDate: Yup.date().nullable().transform((value, originalValue) => (originalValue === '' ? null : value)),
  recurrence: Yup.string().nullable().transform((value, originalValue) => (originalValue === '' ? null : value))
});
