// ImportContacts.ts (ajustes para usar a nova estrutura)
import { head, uniq } from "../../utils/helpers";
import XLSX from "xlsx";
import { Server as SocketIO } from "socket.io";

import CheckContactNumber from "../../helpers/CheckContactNumber";
import { logger } from "../../utils/logger";
import { removeFilePublicFolder } from "./RemoveGroupProfilePicService";
import { getIO } from "../../libs/socket";
import Groups from "../../models/Groups";
import { getWbot } from "../../libs/wbot";
import ShowWhatsAppByCompanyIdByDefaultService from "../WhatsappService/ShowWhatsAppByCompanyIdByDefaultService";

export const clearSpecialCharactersAndLetters = (input: string): string => {
  if (!input) {
    return ''
  }
  const onlyNumbers = input.replace(/\D/g, '');
  return onlyNumbers;
}

const updateMessageToUserWebSocket = (
  io: SocketIO,
  companyId: number,
  groupId: string,
  message: string
) => {
  io.emit(`company-${companyId}-upload-contact-${groupId}`, {
    action: "running",
    result: { message }
  });
};

const prepareContactToUpdateGroup = (contacts: number[]): string[] => {
  return contacts?.map(contact => `${contact}@s.whatsapp.net`);
};

export async function ImportContacts(
  groupId: string,
  companyId: number,
  file: Express.Multer.File | undefined
) {
  const io = getIO();
  updateMessageToUserWebSocket(
    io,
    companyId,
    groupId,
    "Iniciando importação dos contatos, aguarde..."
  );
  const workbook = XLSX.readFile(file?.path as string);
  const worksheet = head(Object.values(workbook.Sheets)) as any;
  const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 0 });
  
  const contacts = rows?.map(row => {
    let number = "";

    if (
      row.numero || 
      row.número || 
      row.Numero || 
      row.Número
    ) {
      number = row.numero || row.número || row.Numero || row.Número;
      if (number) {
        number = `${number}`.replace(/\D/g, "");
      }
    }

    return { number, groupId, companyId };
  });

  let whatsappValids = [];
  let whatsappInValids = [];
  const whatsapp = await ShowWhatsAppByCompanyIdByDefaultService(companyId);
  const wbot = getWbot(whatsapp?.id);

  if (contacts) {
    updateMessageToUserWebSocket(
      io,
      companyId,
      groupId,
      "Validando os números..."
    );
    for (let contact of contacts) {
      try {
        if (contact.number) {
          const response = await CheckContactNumber(contact.number, companyId);
          const number = response.jid.replace(/\D/g, "");
          const whatsappNumber = clearSpecialCharactersAndLetters(String(whatsapp?.number).replace(':44', ''));
          if (whatsappNumber !== number) {
            if (number) {
              whatsappValids.push(number);
            }
          }
        }
      } catch (e) {
        if (contact?.number) {
          whatsappInValids.push(contact.number);
        }
      }
    }
  }

  if (whatsappValids?.length) {
    updateMessageToUserWebSocket(
      io,
      companyId,
      groupId,
      "Importando os contatos validados..."
    );
    const contactsPrepared = prepareContactToUpdateGroup(whatsappValids);
    try {
      const group = await Groups.findOne({
        where: {
          id: groupId,
          companyId
        }
      });

      if (!group) {
        throw new Error("Grupo não encontrado");
      }

      // Obter participantes atuais
      let currentParticipants = [];
      try {
        currentParticipants = JSON.parse(group.participants);
      } catch (error) {
        currentParticipants = [];
      }

      // Combinar participantes atuais com novos
      const updatedParticipants = uniq([...currentParticipants, ...contactsPrepared]);

      // Adicionar ao grupo
      await wbot.groupParticipantsUpdate(
        group.jid,
        contactsPrepared,
        "add"
      );

      // Atualizar metadados do grupo
      const groupMetadata = await wbot.groupMetadata(group.jid);
      
      // Extrair administradores
      const adminParticipants = groupMetadata.participants
        .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
        .map(p => p.id);
      
      // Atualizar no banco de dados
      await group.update({
        participants: JSON.stringify(groupMetadata.participants),
        participantsJson: groupMetadata.participants,
        adminParticipants
      });

      updateMessageToUserWebSocket(io, companyId, groupId, "Concluído.");
    } catch (error) {
      console.log(error);
      whatsappValids = [];
      whatsappInValids = [];
      await removeFilePublicFolder(file?.path);
      updateMessageToUserWebSocket(
        io,
        companyId,
        groupId,
        "Houve um problema na importação dos contatos, por favor tente novamente, se o problema persistir, entre em contato com o suporte técnico."
      );
    }
  } else {
    updateMessageToUserWebSocket(io, companyId, groupId, "Nenhum contato importado.");
  }

  await removeFilePublicFolder(file?.path);

  return {
    whatsappInValids: whatsappInValids?.length ? whatsappInValids : [],
    whatsappValids: whatsappValids?.length
  };
}