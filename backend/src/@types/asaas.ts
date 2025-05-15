interface AsaasRule {
    days: number;
    message: string;
    sendPix?: boolean;
    sendBoleto?: boolean;
  }
  
  interface AsaasSettings {
    asaasToken: string;
    whatsappId: number;
    asaasWeekdays: {
      [key: string]: boolean;
    };
    asaasExecutionTime: string;
    asaasMessageInterval: number;
    asaasRules: AsaasRule[];
  }