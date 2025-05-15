import { getIO } from "../../libs/socket";
import Contact from "../../models/Contact";
import ContactEmployer from "../../models/ContactEmployer";
import ContactCustomField from "../../models/ContactCustomField";
import ContactPosition from "../../models/ContactPosition";
import EmployerPosition from "../../models/EmployerPosition";
import { isNil } from "../../utils/helpers";
import { Session } from "../../libs/wbot";
import GetProfilePicUrl from "../WbotServices/GetProfilePicUrl";

interface ExtraInfo extends ContactCustomField {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  isGroup: boolean;
  isPBX?: boolean;
  email?: string;
  remoteJid?: string;
  companyId: number;
  extraInfo?: ExtraInfo[];
  disableBot?: false;
  whatsappId?: number;
  employerId?: number;
  positionId?: number;
  positionName?: string;
}

const CreateOrUpdateContactService = async ({
  name,
  number: rawNumber,
  remoteJid,
  isGroup,
  isPBX = false,
  email = "",
  companyId,
  extraInfo = [],
  disableBot = false,
  whatsappId,
  employerId,
  positionId,
  positionName
}: Request, wbot: Session, msgContactId?): Promise<Contact> => {
  const number = isGroup ? rawNumber : rawNumber.replace(/[^0-9]/g, "");
  const io = getIO();
  let contact: Contact | null;
  let finalPositionId = positionId;

  if (employerId && positionName) {
    const [position] = await ContactPosition.findOrCreate({
      where: { name: positionName.trim() },
      defaults: { name: positionName.trim() }
    });

    await EmployerPosition.findOrCreate({
      where: {
        employerId,
        positionId: position.id
      }
    });

    finalPositionId = position.id;
  }

  if (finalPositionId && employerId) {
    const position = await ContactPosition.findByPk(finalPositionId);
    if (!position) {
      throw new Error("Posição não encontrada");
    }

    const hasEmployerPosition = await EmployerPosition.findOne({
      where: {
        employerId,
        positionId: finalPositionId
      }
    });

    if (!hasEmployerPosition) {
      await EmployerPosition.create({
        employerId,
        positionId: finalPositionId
      });
    }
  }

  contact = await Contact.findOne({
    where: {
      number,
      companyId
    },
    include: [
      "extraInfo",
      {
        model: ContactEmployer,
        as: 'employer',
        attributes: ['id', 'name']
      },
      {
        model: ContactPosition,
        as: 'position',
        attributes: ['id', 'name']
      }
    ]
  });
  
  if (contact) {
    if (name && (!contact.name || contact.name.match(/^[0-9]*$/)) && !name.match(/^[0-9]*$/)) {
      contact.changed('name', true);
      contact.changed('updatedAt', true);
      let profilePicUrl: string;
      try {
        profilePicUrl = await GetProfilePicUrl(rawNumber, companyId);
      } catch (e) {
        console.log("Erro ao obter foto do perfil 2: " + e);
      }
  
      if (profilePicUrl?.endsWith("nopicture.png")) {
        profilePicUrl = contact.profilePicUrl;
      }
  
      await contact.update({
        name,
        profilePicUrl,
        employerId,
        positionId: finalPositionId
      });
    
  
      const lastUpdate = new Date(contact.updatedAt);
      const now = new Date();
      const diff = now.getTime() - lastUpdate.getTime();
      const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
  
      if (diffDays >= 3) {
        let profilePicUrl: string | undefined;
        try {
          profilePicUrl = await GetProfilePicUrl(rawNumber, companyId);
        } catch (e) {
          console.log("Erro ao obter foto do perfil: " + e);
        }
        if (profilePicUrl?.endsWith("nopicture.png")) {
          profilePicUrl = contact.profilePicUrl;
        }
  
        await contact.update({
          profilePicUrl,
          employerId,
          positionId: finalPositionId
        });
      }
  
      if (isNil(contact.whatsappId)) {
        await contact.update({
          whatsappId: whatsappId as any,
          employerId,
          positionId: finalPositionId
        });
      }
  
      await contact.reload();
      
      io
        .to(`company-${companyId}-mainchannel`)
        .emit(`company-${companyId}-contact`, {
          action: "update",
          contact
        });
    }
  } else {
    // O código para criação de contato permanece igual
    let profilePicUrl: string;
    try {
      profilePicUrl = await GetProfilePicUrl(rawNumber, companyId);
    } catch (e) {
      profilePicUrl = `${process.env.FRONTEND_URL}/assets/nopicture.png`;
    }
  
    const [_contact] = await Contact.findOrCreate({
      where: {
        number,
        companyId
      },
      defaults: {
        name,
        number,
        profilePicUrl,
        email,
        isGroup,
        companyId,
        disableBot,
        whatsappId: whatsappId as any,
        employerId,
        positionId: finalPositionId
      }
    });
  
    // Carrega as relações após criar
    await _contact.reload({
      include: [
        "extraInfo",
        {
          model: ContactEmployer,
          as: 'employer',
          attributes: ['id', 'name']
        },
        {
          model: ContactPosition,
          as: 'position',
          attributes: ['id', 'name']
        }
      ]
    });
  
    await _contact.$set('extraInfo', extraInfo);
    contact = _contact;
  
    io
      .to(`company-${companyId}-mainchannel`)
      .emit(`company-${companyId}-contact`, {
        action: "create",
        contact
      });
  }

  return contact;
};

export default CreateOrUpdateContactService;