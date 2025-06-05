import { getIO } from "../../libs/socket";
import Contact from "../../models/Contact";
import ContactEmployer from "../../models/ContactEmployer";
import ContactCustomField from "../../models/ContactCustomField";
import ContactPosition from "../../models/ContactPosition";
import EmployerPosition from "../../models/EmployerPosition";
import { isNil } from "../../utils/helpers";
import { Session } from "../../libs/wbot";
import GetProfilePicUrl from "../WbotServices/GetProfilePicUrl";
import { logger } from "../../utils/logger";

export interface ExtraInfo extends ContactCustomField {
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
  disableBot?: boolean;
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
}: Request, wbot?: Session, msgContactId?: string): Promise<Contact> => {
  
  try {
    // ✅ CORREÇÃO: Determinar número baseado no tipo de contato
    let number: string;
    
    if (isGroup) {
      // ✅ Para grupos: usar JID completo ou rawNumber se já estiver correto
      if (rawNumber.includes('@g.us')) {
        number = rawNumber; // Já está no formato correto
      } else if (remoteJid && remoteJid.includes('@g.us')) {
        number = remoteJid; // Usar remoteJid se estiver correto
      } else {
        // Fallback: construir JID se necessário
        number = rawNumber.includes('@') ? rawNumber : `${rawNumber}@g.us`;
      }
    } else {
      // ✅ Para contatos individuais: apenas dígitos
      number = rawNumber.replace(/[^0-9]/g, "");
    }

    logger.debug(`[CreateOrUpdateContactService] Processando ${isGroup ? 'grupo' : 'contato'}: ${name || number}`);

    const io = getIO();
    let contact: Contact | null;
    let finalPositionId = positionId;

    // Processar posição se necessário (apenas para contatos individuais)
    if (!isGroup && employerId && positionName) {
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

    if (!isGroup && finalPositionId && employerId) {
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

    // ✅ CORREÇÃO: Buscar contato incluindo isGroup para evitar conflitos
    contact = await Contact.findOne({
      where: {
        number,
        companyId,
        isGroup // ✅ INCLUIR isGroup na busca
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
      // ✅ CONTATO EXISTE - ATUALIZAR SE NECESSÁRIO
      let shouldUpdate = false;
      const updateData: any = {};

      // Atualizar nome se fornecido e for melhor que o atual
      if (name && (!contact.name || contact.name.match(/^[0-9]*$/)) && !name.match(/^[0-9]*$/)) {
        updateData.name = name;
        shouldUpdate = true;
      }

      // Atualizar empregador e posição (apenas para contatos individuais)
      if (!isGroup) {
        if (employerId && employerId !== contact.employerId) {
          updateData.employerId = employerId;
          shouldUpdate = true;
        }
        
        if (finalPositionId && finalPositionId !== contact.positionId) {
          updateData.positionId = finalPositionId;
          shouldUpdate = true;
        }
      }

      // Atualizar whatsappId se não estiver definido
      if (isNil(contact.whatsappId) && whatsappId) {
        updateData.whatsappId = whatsappId;
        shouldUpdate = true;
      }

      // Atualizar foto de perfil (verificar se precisa atualizar)
      const lastUpdate = new Date(contact.updatedAt);
      const now = new Date();
      const diff = now.getTime() - lastUpdate.getTime();
      const diffDays = Math.ceil(diff / (1000 * 3600 * 24));

      if (shouldUpdate || diffDays >= 3) {
        let profilePicUrl: string | undefined;
        
        try {
          // ✅ Só buscar foto para contatos individuais
          if (!isGroup && wbot) {
            profilePicUrl = await GetProfilePicUrl(rawNumber, companyId);
          }
        } catch (e) {
          logger.debug(`[CreateOrUpdateContactService] Erro ao obter foto do perfil: ${e}`);
        }

        // Só atualizar foto se obteve uma válida
        if (profilePicUrl && !profilePicUrl.endsWith("nopicture.png")) {
          updateData.profilePicUrl = profilePicUrl;
          shouldUpdate = true;
        }
      }

      // Aplicar atualizações se houver
      if (shouldUpdate) {
        contact.changed('updatedAt', true);
        await contact.update(updateData);
        
        await contact.reload();
        
        logger.debug(`[CreateOrUpdateContactService] ${isGroup ? 'Grupo' : 'Contato'} atualizado: ${contact.name}`);
        
        io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
          action: "update",
          contact
        });
      }

    } else {
      // ✅ CONTATO NÃO EXISTE - CRIAR NOVO
      logger.debug(`[CreateOrUpdateContactService] Criando novo ${isGroup ? 'grupo' : 'contato'}: ${name || number}`);
      
      let profilePicUrl: string;
      
      try {
        // ✅ Só buscar foto para contatos individuais
        if (!isGroup && wbot) {
          profilePicUrl = await GetProfilePicUrl(rawNumber, companyId);
        } else {
          profilePicUrl = `${process.env.FRONTEND_URL}/assets/nopicture.png`;
        }
      } catch (e) {
        logger.debug(`[CreateOrUpdateContactService] Erro ao obter foto do perfil: ${e}`);
        profilePicUrl = `${process.env.FRONTEND_URL}/assets/nopicture.png`;
      }

      // ✅ CORREÇÃO: Criar contato com dados corretos baseados no tipo
      const [_contact] = await Contact.findOrCreate({
        where: {
          number,
          companyId,
          isGroup // ✅ INCLUIR isGroup no where
        },
        defaults: {
          name: name || (isGroup ? number.split('@')[0] : number),
          number, // ✅ JID completo para grupos, dígitos para contatos
          profilePicUrl,
          email: isGroup ? "" : email, // Grupos não têm email
          isGroup,
          companyId,
          disableBot: isGroup ? false : disableBot, // Grupos não têm disableBot
          whatsappId: whatsappId as any,
          employerId: isGroup ? null : employerId, // Grupos não têm empregador
          positionId: isGroup ? null : finalPositionId, // Grupos não têm posição
          remoteJid: remoteJid || (isGroup ? number : `${number}@s.whatsapp.net`), // ✅ remoteJid correto
          isPBX: isGroup ? false : isPBX // Grupos não são PBX
        }
      });

      // Carregar as relações após criar (apenas para contatos individuais)
      await _contact.reload({
        include: [
          "extraInfo",
          ...(isGroup ? [] : [
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
          ])
        ]
      });

      // Adicionar informações extras (apenas para contatos individuais)
      if (!isGroup && extraInfo && extraInfo.length > 0) {
        await _contact.$set('extraInfo', extraInfo);
      }

      contact = _contact;

      logger.info(`[CreateOrUpdateContactService] ${isGroup ? 'Grupo' : 'Contato'} criado: ${contact.name} (${number})`);

      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
        action: "create",
        contact
      });
    }

    return contact;

  } catch (error) {
    logger.error(`[CreateOrUpdateContactService] Erro ao processar ${isGroup ? 'grupo' : 'contato'}: ${error.message}`);
    throw error;
  }
};

export default CreateOrUpdateContactService;