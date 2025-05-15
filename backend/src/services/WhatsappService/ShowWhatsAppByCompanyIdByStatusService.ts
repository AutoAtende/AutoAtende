import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";

const ShowWhatsAppByCompanyIdByStatusService = async (
    companyId: number,
  ): Promise<Whatsapp> => {
    const whatsapp = await Whatsapp.findOne({ 
      where: {
        companyId,
        status: "CONNECTED"
      }
     })
  
    if (whatsapp?.companyId !== companyId) {
      throw new AppError("ERR_ACCESS_ANOTHER_COMPANY", 401);
    }
  
    if (!whatsapp) {
      throw new AppError("ERR_NO_WAPP_FOUND", 404);
    }
  
    return whatsapp;
  };
  
  export default ShowWhatsAppByCompanyIdByStatusService;
  