import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";

const ShowWhatsAppByCompanyIdByDefaultService = async (
    companyId: number,
  ): Promise<Whatsapp> => {
    const whatsapp = await Whatsapp.findOne({ 
      where: {
        companyId,
        isDefault: 1
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
  
  export default ShowWhatsAppByCompanyIdByDefaultService;
  