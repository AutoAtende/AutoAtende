import * as Yup from 'yup';

// Definindo o tipo de dados para Invoices
export type InvoicesData = {
  id?: number;                     // ID da fatura (opcional, pois pode ser gerado automaticamente)
  detail: string;                 // Detalhes da fatura
  status: 'pending' | 'paid' | 'canceled'; // Status da fatura (deve ser um dos valores predefinidos)
  value: number;                  // Valor da fatura
  txId: string;                   // ID da transação
  payGw: string;                  // Gateway de pagamento
  payGwData?: string;             // Dados do gateway de pagamento (opcional)
  createdAt?: Date;               // Data de criação (opcional)
  updatedAt?: Date;               // Data de atualização (opcional)
  dueDate: Date;                 // Data de vencimento
  stripePaymentIntentId?: string; // ID da intenção de pagamento do Stripe (opcional)
  companyId: number;              // ID da empresa associada
};

export type InvoicesQuery = { searchParam: string; pageNumber: string };


// Definição do validador para o modelo Invoices
export const InvoicesSchema = Yup.object().shape({
  id: Yup.number().integer().positive().optional(),
  detail: Yup.string().required('Detalhes são obrigatórios'),
  status: Yup.string().oneOf(['pending', 'paid', 'canceled'], 'Status inválido').required('Status é obrigatório'),
  value: Yup.number().positive('O valor deve ser positivo').required('Valor é obrigatório'),
  txId: Yup.string().required('TxId é obrigatório'),
  payGw: Yup.string().required('PayGw é obrigatório'),
  payGwData: Yup.string().optional(),
  createdAt: Yup.date().optional(),
  updatedAt: Yup.date().optional(),
  dueDate: Yup.date().required('Data de vencimento é obrigatória'),
  stripePaymentIntentId: Yup.string().optional(),
  companyId: Yup.number().integer().positive().required('ID da empresa é obrigatório'),
});
