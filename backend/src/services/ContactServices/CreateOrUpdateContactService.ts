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
  isGroup = false, // ✅ Valor padrão para isGroup
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
    logger.debug(`[CreateOrUpdateContactService] Iniciando processamento: ${JSON.stringify({
      name,
      rawNumber,
      isGroup,
      companyId
    })}`);

    // ✅ Validação de entrada
    if (!rawNumber || !companyId) {
      throw new Error("Número e companyId são obrigatórios");
    }

    // ✅ Determinar número baseado no tipo de contato
    let number: string;
    let finalRemoteJid: string;
    
    if (isGroup) {
      // Para grupos: manter JID completo ou construir se necessário
      if (rawNumber.includes('@g.us')) {
        number = rawNumber;
        finalRemoteJid = rawNumber;
      } else if (remoteJid && remoteJid.includes('@g.us')) {
        number = remoteJid;
        finalRemoteJid = remoteJid;
      } else {
        // Construir JID do grupo
        const groupId = rawNumber.replace(/[^0-9]/g, "");
        number = `${groupId}@g.us`;
        finalRemoteJid = number;
      }
      logger.debug(`[CreateOrUpdateContactService] Grupo processado: ${number}`);
    } else {
      // Para contatos individuais: apenas dígitos
      number = rawNumber.replace(/[^0-9]/g, "");
      finalRemoteJid = remoteJid || `${number}@s.whatsapp.net`;
      
      if (number.length < 8) {
        throw new Error("Número de telefone muito curto");
      }
      logger.debug(`[CreateOrUpdateContactService] Contato individual processado: ${number}`);
    }

    const io = getIO();
    let contact: Contact | null;
    let finalPositionId = positionId;

    // ✅ Processar posição apenas para contatos individuais
    if (!isGroup && employerId && positionName) {
      try {
        logger.debug(`[CreateOrUpdateContactService] Processando posição: ${positionName}`);
        
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
        logger.debug(`[CreateOrUpdateContactService] Posição processada: ID ${finalPositionId}`);
      } catch (positionError) {
        logger.error(`[CreateOrUpdateContactService] Erro ao processar posição: ${positionError.message}`);
        // Não falhar por causa da posição, apenas logar o erro
      }
    }

    // ✅ Validar relacionamento empregador-posição
    if (!isGroup && finalPositionId && employerId) {
      try {
        const position = await ContactPosition.findByPk(finalPositionId);
        if (!position) {
          logger.warn(`[CreateOrUpdateContactService] Posição ${finalPositionId} não encontrada`);
          finalPositionId = undefined;
        } else {
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
      } catch (relationError) {
        logger.error(`[CreateOrUpdateContactService] Erro na validação empregador-posição: ${relationError.message}`);
        finalPositionId = undefined;
      }
    }

    // ✅ Buscar contato existente incluindo isGroup
    try {
      contact = await Contact.findOne({
        where: {
          number,
          companyId,
          isGroup
        },
        include: [
          "extraInfo",
          {
            model: ContactEmployer,
            as: 'employer',
            attributes: ['id', 'name'],
            required: false
          },
          {
            model: ContactPosition,
            as: 'position',
            attributes: ['id', 'name'],
            required: false
          }
        ]
      });

      logger.debug(`[CreateOrUpdateContactService] Busca de contato: ${contact ? 'encontrado' : 'não encontrado'}`);
    } catch (searchError) {
      logger.error(`[CreateOrUpdateContactService] Erro ao buscar contato: ${searchError.message}`);
      contact = null;
    }
    
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

      // ✅ Atualizar foto de perfil com proteção contra erros
      const lastUpdate = new Date(contact.updatedAt);
      const now = new Date();
      const diffDays = Math.ceil((now.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24));

      if (shouldUpdate || diffDays >= 3) {
        let profilePicUrl: string | undefined;
        
        try {
          // Só buscar foto para contatos individuais
          if (!isGroup && wbot && number) {
            profilePicUrl = await GetProfilePicUrl(rawNumber, companyId);
            logger.debug(`[CreateOrUpdateContactService] Foto obtida: ${profilePicUrl ? 'sim' : 'não'}`);
          }
        } catch (profileError) {
          logger.debug(`[CreateOrUpdateContactService] Erro ao obter foto: ${profileError.message}`);
          // Não falhar por causa da foto
        }

        // Só atualizar foto se obteve uma válida
        if (profilePicUrl && !profilePicUrl.endsWith("nopicture.png")) {
          updateData.profilePicUrl = profilePicUrl;
          shouldUpdate = true;
        }
      }

      // ✅ Aplicar atualizações se houver
      if (shouldUpdate) {
        try {
          contact.changed('updatedAt', true);
          await contact.update(updateData);
          await contact.reload();
          
          logger.info(`[CreateOrUpdateContactService] ${isGroup ? 'Grupo' : 'Contato'} atualizado: ${contact.name} (${contact.id})`);
          
          io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
            action: "update",
            contact
          });
        } catch (updateError) {
          logger.error(`[CreateOrUpdateContactService] Erro ao atualizar contato: ${updateError.message}`);
          throw updateError;
        }
      }

    } else {
      // ✅ CONTATO NÃO EXISTE - CRIAR NOVO
      logger.debug(`[CreateOrUpdateContactService] Criando novo ${isGroup ? 'grupo' : 'contato'}: ${name || number}`);
      
      let profilePicUrl: string = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/assets/nopicture.png`;
      
      try {
        // Só buscar foto para contatos individuais
        if (!isGroup && wbot && number) {
          const fetchedUrl = await GetProfilePicUrl(rawNumber, companyId);
          if (fetchedUrl && !fetchedUrl.endsWith("nopicture.png")) {
            profilePicUrl = fetchedUrl;
          }
          logger.debug(`[CreateOrUpdateContactService] Foto para novo contato: ${profilePicUrl}`);
        }
      } catch (profileError) {
        logger.debug(`[CreateOrUpdateContactService] Erro ao obter foto para novo contato: ${profileError.message}`);
        // Usar foto padrão
      }

      // ✅ Criar contato com dados corretos baseados no tipo
      try {
        const [_contact] = await Contact.findOrCreate({
          where: {
            number,
            companyId,
            isGroup
          },
          defaults: {
            name: name || (isGroup ? number.split('@')[0] : number),
            number,
            profilePicUrl,
            email: isGroup ? "" : (email || ""),
            isGroup,
            companyId,
            disableBot: isGroup ? false : disableBot,
            whatsappId: whatsappId as any,
            employerId: isGroup ? null : employerId,
            positionId: isGroup ? null : finalPositionId,
            remoteJid: finalRemoteJid,
            isPBX: isGroup ? false : isPBX
          }
        });

        // ✅ Carregar as relações após criar
        await _contact.reload({
          include: [
            "extraInfo",
            ...(isGroup ? [] : [
              {
                model: ContactEmployer,
                as: 'employer',
                attributes: ['id', 'name'],
                required: false
              },
              {
                model: ContactPosition,
                as: 'position',
                attributes: ['id', 'name'],
                required: false
              }
            ])
          ]
        });

        // ✅ Adicionar informações extras (apenas para contatos individuais)
        if (!isGroup && extraInfo && extraInfo.length > 0) {
          try {
            await _contact.$set('extraInfo', extraInfo);
          } catch (extraError) {
            logger.error(`[CreateOrUpdateContactService] Erro ao adicionar extraInfo: ${extraError.message}`);
            // Não falhar por causa das informações extras
          }
        }

        contact = _contact;

        logger.info(`[CreateOrUpdateContactService] ${isGroup ? 'Grupo' : 'Contato'} criado: ${contact.name} (${contact.id}) - Número: ${number}`);

        io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
          action: "create",
          contact
        });

      } catch (createError) {
        logger.error(`[CreateOrUpdateContactService] Erro ao criar contato: ${createError.message}`);
        throw createError;
      }
    }

    return contact;

  } catch (error) {
    logger.error(`[CreateOrUpdateContactService] Erro geral: ${error.message}`, {
      name,
      rawNumber,
      isGroup,
      companyId,
      stack: error.stack
    });
    throw error;
  }
};

export default CreateOrUpdateContactService;