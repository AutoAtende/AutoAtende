import { Request } from "express";

type Response = {
  whatsappId: number;
  companyId: number;
  isApi?: boolean
};

export const returnWhatsAppIdAndCompanyIdByParams = async (
  req: Request
): Promise<Response> => {
  return {
    whatsappId: +req?.params?.whatsappId,
    companyId: +req?.params?.companyId,
    isApi: req?.params?.isApi ? Boolean(req?.params?.isApi) : false
  };
};
