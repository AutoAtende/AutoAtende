// ExtractContactsService.ts (ajustes para usar a nova estrutura)
import { Boom } from "@hapi/boom";
import ShowWhatsAppByCompanyIdByDefaultService from "../WhatsappService/ShowWhatsAppByCompanyIdByDefaultService";
import { getWbot } from "../../libs/wbot";
import { getIO } from "../../libs/socket";
import { GroupParticipant } from "baileys";
import { Server as SocketIO } from "socket.io";
import * as fs from "fs";
import * as path from "path";
import XLSX from "xlsx";
import { clearSpecialCharactersAndLetters } from "../../helpers/clearSpecialCharactersAndLetters";

type TypeMessage = "error" | "success";

const messageWebsocket = (
  io: SocketIO,
  companyId: number,
  message: string,
  link: string,
  type: TypeMessage
) => {
  io.emit(`company-${companyId}-extract-contact-${link?.trim()}`, {
    action: type,
    result: { message }
  });
};

const createExcelSheet = (
  dataArray: { id?: string; admin?: string | null }[],
  companyId: number,
  invitationCode: string
): void => {
  const newDataArray = dataArray?.map(item => ({
    numero: clearSpecialCharactersAndLetters(item?.id)
  }));

  // Create a new workbook and add a worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(newDataArray, {
    header: ["numero"],
    skipHeader: false
  });

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  // Convert the workbook to a buffer
  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

  // Specify the file path where you want to save the Excel file
  const filePath = path.resolve(
    __dirname,
    "..",
    "..",
    "..",
    "public",
    `excel_contacts-${companyId}-${invitationCode}.xlsx`
  );

  // Write the buffer to the file
  fs.writeFileSync(filePath, buffer);

  console.log(`Excel file saved to ${filePath}`);
};

export async function ExtractContactsService(
  link: string,
  companyId: number,
  participants?: GroupParticipant[],
  groupCode?: string
) {
  const io = getIO();
  let groupId = "";
  const whatsapp = await ShowWhatsAppByCompanyIdByDefaultService(companyId);
  const wbot = getWbot(whatsapp?.id);

  if (!!participants && participants?.length) {
    createExcelSheet(participants, companyId, groupCode);
  } else {
    const invitationCode = link?.replace("https://chat.whatsapp.com/", "");

    try {
      const groupInfoResponse = await wbot.groupGetInviteInfo(invitationCode);
      groupId = groupInfoResponse.id;
      const groupJoin = await wbot.groupAcceptInvite(invitationCode);
      if (!groupJoin) {
        await wbot.groupAcceptInvite(invitationCode);
      } else {
        const groupMetadata = await wbot.groupMetadata(groupId);
        messageWebsocket(
          io,
          companyId,
          `Total de ${groupMetadata?.participants?.length} contatos extraídos com sucesso.`,
          link,
          "success"
        );
        createExcelSheet(
          groupMetadata?.participants,
          companyId,
          invitationCode
        );
      }
    } catch (error) {
      const _error = error as Boom;
      if (_error.data === 406) {
        messageWebsocket(
          io,
          companyId,
          "Link inválido ou não existe mais.",
          link,
          "error"
        );
      }
      if (_error.data === 409) {
        const groupMetadata = await wbot.groupMetadata(groupId);
        messageWebsocket(
          io,
          companyId,
          `Total de ${groupMetadata?.participants?.length} contatos extraídos com sucesso.`,
          link,
          "success"
        );
        createExcelSheet(
          groupMetadata?.participants,
          companyId,
          invitationCode
        );
      }
      if (_error.data === 304) {
        messageWebsocket(
          io,
          companyId,
          "Você solicitou a entrada no grupo, aguarde a aprovação do administrador.",
          link,
          "error"
        );
      }
      if (_error.data === 410) {
        messageWebsocket(
          io,
          companyId,
          "Link inválido ou não existe mais.",
          link,
          "error"
        );
      }
      if (_error.data === 403) {
        messageWebsocket(
          io,
          companyId,
          "Link de grupo privado, não é possível realizar a extração dos contatos. O Grupo precisa ser público.",
          link,
          "error"
        );
      }
      if (_error.data === 401) {
        messageWebsocket(
          io,
          companyId,
          "Você não pode entrar neste grupo porque um administrador removeu você.",
          link,
          "error"
        );
      }
      if (_error.data === 500) {
        messageWebsocket(
          io,
          companyId,
          "Ops! Houve um erro ao tentar realizar o processo de extração dos contatos, por favor tente novamente mais tarde.",
          link,
          "error"
        );
      }
    }
  }

  return "";
}