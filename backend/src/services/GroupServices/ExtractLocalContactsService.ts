// ExtractLocalContactsService.ts
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";
import { logger } from "../../utils/logger";
import Groups from "../../models/Groups";
import AppError from "../../errors/AppError";
import { GroupParticipant } from "bail-lite";

interface ParticipantData {
  id: string;
  admin?: string;
  isAdmin?: boolean;
}

interface ExtractRequest {
  companyId: number;
  groupId: string;
  participants?: ParticipantData[];
}

interface ExtractResult {
  downloadUrl: string;
  totalContacts: number;
  admins: number;
  members: number;
  fileName: string;
}

const ExtractLocalContactsService = async ({
  companyId,
  groupId,
  participants
}: ExtractRequest): Promise<ExtractResult> => {
  try {
    const group = await Groups.findOne({
      where: {
        id: groupId,
        companyId
      }
    });

    if (!group) {
      throw new AppError("Grupo não encontrado");
    }

    // Usar participantes fornecidos ou buscar do grupo
    const groupParticipants: GroupParticipant[] = group.participantsJson || [];

    if (!Array.isArray(groupParticipants) || groupParticipants.length === 0) {
      throw new AppError("Nenhum participante encontrado no grupo");
    }

    logger.info(`[ExtractLocalContacts] Extraindo ${groupParticipants.length} contatos do grupo ${group.subject}`);

    // Processar participantes
    const contactsData = groupParticipants.map((participant, index) => {
      const phoneNumber = participant.id ? participant.id.split('@')[0] : '';
      const isAdmin = participant.admin === 'admin' || participant.admin === 'superadmin';
      
      return {
        'Posição': index + 1,
        'Número': phoneNumber,
        'Número Formatado': formatPhoneNumber(phoneNumber),
        'Tipo': isAdmin ? 'Administrador' : 'Membro',
        'Admin': isAdmin ? 'Sim' : 'Não',
        'ID WhatsApp': participant.id,
        'Grupo': group.subject,
        'Data Extração': new Date().toLocaleString('pt-BR')
      };
    });

    // Separar administradores e membros
    const admins = contactsData.filter(contact => contact.Tipo === 'Administrador');
    const members = contactsData.filter(contact => contact.Tipo === 'Membro');

    // Criar workbook do Excel
    const workbook = XLSX.utils.book_new();

    // Aba principal com todos os contatos
    const allContactsSheet = XLSX.utils.json_to_sheet(contactsData);
    XLSX.utils.book_append_sheet(workbook, allContactsSheet, 'Todos os Contatos');

    // Aba só com números (formato simples)
    const simpleNumbersData = groupParticipants.map(p => ({
      'numero': p.id ? p.id.split('@')[0] : ''
    })).filter(item => item.numero);

    const simpleSheet = XLSX.utils.json_to_sheet(simpleNumbersData);
    XLSX.utils.book_append_sheet(workbook, simpleSheet, 'Números Simples');

    // Aba com administradores
    if (admins.length > 0) {
      const adminsSheet = XLSX.utils.json_to_sheet(admins);
      XLSX.utils.book_append_sheet(workbook, adminsSheet, 'Administradores');
    }

    // Aba com membros
    if (members.length > 0) {
      const membersSheet = XLSX.utils.json_to_sheet(members);
      XLSX.utils.book_append_sheet(workbook, membersSheet, 'Membros');
    }

    // Adicionar aba de resumo
    const summaryData = [
      { 'Informação': 'Nome do Grupo', 'Valor': group.subject },
      { 'Informação': 'Total de Participantes', 'Valor': groupParticipants.length },
      { 'Informação': 'Administradores', 'Valor': admins.length },
      { 'Informação': 'Membros', 'Valor': members.length },
      { 'Informação': 'Data da Extração', 'Valor': new Date().toLocaleString('pt-BR') },
      { 'Informação': 'ID do Grupo', 'Valor': group.jid },
    ];

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

    // Gerar nome do arquivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedGroupName = group.subject ? 
      group.subject.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 30) : 
      'Grupo';
    const fileName = `contatos_${sanitizedGroupName}_${timestamp}.xlsx`;

    // Salvar arquivo
    const publicDir = path.resolve(__dirname, "..", "..", "..", "public");
    const filePath = path.join(publicDir, fileName);

    // Garantir que o diretório existe
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Escrever arquivo
    XLSX.writeFile(workbook, filePath);

    // Gerar URL de download
    const downloadUrl = `${process.env.BACKEND_URL}/public/${fileName}`;

    logger.info(`[ExtractLocalContacts] Arquivo criado: ${fileName}`);

    // Agendar remoção do arquivo após 1 hora
    setTimeout(() => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          logger.info(`[ExtractLocalContacts] Arquivo temporário removido: ${fileName}`);
        }
      } catch (error) {
        logger.error(`[ExtractLocalContacts] Erro ao remover arquivo temporário: ${error}`);
      }
    }, 60 * 60 * 1000); // 1 hora

    return {
      downloadUrl,
      totalContacts: groupParticipants.length,
      admins: admins.length,
      members: members.length,
      fileName
    };

  } catch (error) {
    logger.error(`[ExtractLocalContacts] Erro ao extrair contatos: ${error}`);
    throw new AppError(`Erro ao extrair contatos: ${error.message}`);
  }
};

// Função auxiliar para formatar números de telefone
const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Remove caracteres não numéricos
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Formato brasileiro
  if (cleaned.length === 13 && cleaned.startsWith('55')) {
    // +55 (XX) 9XXXX-XXXX
    const area = cleaned.substring(2, 4);
    const firstPart = cleaned.substring(4, 9);
    const secondPart = cleaned.substring(9, 13);
    return `+55 (${area}) ${firstPart}-${secondPart}`;
  }
  
  // Formato internacional genérico
  if (cleaned.length > 10) {
    return `+${cleaned}`;
  }
  
  return phoneNumber;
};

export default ExtractLocalContactsService;