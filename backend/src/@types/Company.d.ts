// @types/Company.d.ts
export interface CompanyData {
  name: string;
  phone?: string;
  email?: string;
  password?: string;
  status?: boolean;
  planId?: number;
  campaignsEnabled?: boolean;
  dueDate?: Date;
  recurrence?: string;
  cnpj?: string;
  razaosocial?: string;
  cep?: string;
  estado?: string;
  cidade?: string;
  bairro?: string;
  logradouro?: string;
  numero?: string;
  diaVencimento?: string;
}

export interface CompanyRequestData extends CompanyData {
  tipoPessoa?: 'F' | 'J';
  documento?: string;
}

export interface CompanyWithPlan extends CompanyData {
  plan?: {
    id: number;
    name: string;
    users: number;
    connections: number;
    queues: number;
    value: number;
    useCampaigns: boolean;
    useSchedules: boolean;
    useInternalChat: boolean;
    useExternalApi: boolean;
  };
}

export interface CompanyWithMetrics extends CompanyWithPlan {
  metrics: {
    users: {
      total: number;
      active: number;
      percentage: number;
    };
    connections: {
      total: number;
      active: number;
      percentage: number;
    };
    whatsapp: {
      messages: number;
      lastSync: Date;
    };
    storage: {
      totalSize: number;
      files: number;
      lastUpdate: Date;
    };
  };
}

export interface Schedule {
  id?: number;
  weekday: string;
  weekdayEn: string;
  startTime: string;
  endTime: string;
  startLunchTime?: string;
  endLunchTime?: string;
}