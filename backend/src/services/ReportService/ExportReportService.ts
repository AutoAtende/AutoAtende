import { Op, Sequelize } from "sequelize";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import { startOfDay, endOfDay, parseISO, format } from "date-fns";
import { pt } from "date-fns/locale";

import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import User from "../../models/User";
import UserRating from "../../models/UserRating";
import Queue from "../../models/Queue";
import Tag from "../../models/Tag";
import Company from "../../models/Company";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

interface ExportReportParams {
  startDate: string;
  endDate: string;
  userId?: number;
  queueIds?: number[];
  tagIds?: number[];
  status?: string;
  employerId?: number;
  includeLogo?: boolean;
  companyId: number;
}

const ExportReportService = async ({
  startDate,
  endDate,
  userId,
  queueIds,
  tagIds,
  status,
  employerId,
  includeLogo = false,
  companyId
}: ExportReportParams): Promise<Buffer> => {
  // Validações iniciais
  if (!startDate || !endDate) {
    throw new AppError("Data inicial e final são obrigatórias");
  }

  try {
    logger.debug("Iniciando ExportReportService com parâmetros:", {
      startDate,
      endDate,
      userId,
      queueIds,
      tagIds,
      status,
      employerId,
      includeLogo,
      companyId
    });

    // Se temos employerId, primeiro buscaremos todos os contatos dessa empresa
    let contactIds: number[] = [];

    if (employerId) {
      logger.debug(`Buscando contatos para employerId ${employerId}`);
      const contacts = await Contact.findAll({
        where: {
          employerId,
          companyId
        },
        attributes: ['id']
      });

      contactIds = contacts.map(contact => contact.id);
      logger.debug(`Encontrados ${contactIds.length} contatos para employerId ${employerId}`);

      // Se não encontrarmos contatos para este employer, retornamos um PDF vazio
      if (contactIds.length === 0) {
        logger.debug("Nenhum contato encontrado, gerando PDF vazio");
        // Criar PDF vazio
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595.28, 841.89]); // A4
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

        page.drawText("Nenhum ticket encontrado para o filtro aplicado.", {
          x: 50,
          y: 800,
          size: 14,
          font: timesRomanFont,
          color: rgb(0, 0, 0)
        });

        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);
      }
    }

    // Construir condições de busca
    const whereCondition: any = {
      companyId,
      createdAt: {
        [Op.between]: [
          startOfDay(parseISO(startDate)),
          endOfDay(parseISO(endDate))
        ]
      }
    };

    if (userId) {
      whereCondition.userId = userId;
    }

    if (queueIds && queueIds.length > 0) {
      whereCondition.queueId = {
        [Op.in]: queueIds
      };
    }

    if (status) {
      whereCondition.status = status;
    }

    // Adicionar filtro por contactIds se tivermos employerId
    if (employerId && contactIds.length > 0) {
      whereCondition.contactId = {
        [Op.in]: contactIds
      };
    }

    logger.debug("Condições WHERE para busca de tickets:", whereCondition);

    // Incluir associações
    const include: any = [
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number", "email", "employerId"]
      },
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "name", "color"]
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name"]
      }
    ];

    // Aplicar filtro por tags
    if (tagIds && tagIds.length > 0) {
      include.push({
        model: Tag,
        as: "tags",
        where: { id: { [Op.in]: tagIds } },
        attributes: ["id", "name", "color"],
        through: { attributes: [] }
      });
    } else {
      // Incluir tags sem filtro
      include.push({
        model: Tag,
        as: "tags",
        attributes: ["id", "name", "color"],
        through: { attributes: [] }
      });
    }

    // Buscar tickets para o relatório
    const tickets = await Ticket.findAll({
      where: whereCondition,
      include,
      order: [["createdAt", "DESC"]],
      raw: false,
      nest: true
    });

    logger.debug(`Encontrados ${tickets.length} tickets para exportação em PDF`);

    // NOVA PARTE: Buscar avaliações para todos os tickets de uma vez
    const ticketIds = tickets.map(ticket => ticket.id);
    const userRatings = await UserRating.findAll({
      where: {
        ticketId: {
          [Op.in]: ticketIds
        }
      },
      attributes: ['ticketId', 'rate']
    });

    // Criar um mapa de avaliações por ID de ticket
    const ratingsMap = new Map();
    userRatings.forEach(rating => {
      ratingsMap.set(rating.ticketId, rating.rate);
    });

    // Buscar empresa para informações de cabeçalho
    const company = await Company.findByPk(companyId);

    if (!company) {
      throw new AppError("Empresa não encontrada");
    }

    // Criar PDF
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    // Margens
    const margin = 50;
    let y = height - margin;

    // Cabeçalho
    if (includeLogo && company) {
      try {
        // Buscar a logo a partir de um diretório genérico
        const logoPath = path.join(__dirname, `../../../public/company${companyId}/logo.png`);
        if (fs.existsSync(logoPath)) {
          const logoImageBytes = fs.readFileSync(logoPath);
          const logoImage = await pdfDoc.embedPng(logoImageBytes);
          const logoDims = logoImage.scale(0.3);

          page.drawImage(logoImage, {
            x: margin,
            y: y - logoDims.height,
            width: logoDims.width,
            height: logoDims.height
          });

          y -= logoDims.height + 20;
        }
      } catch (error) {
        logger.error("Erro ao carregar logo:", error);
        // Continua sem o logo
      }
    }

    // Título
    page.drawText("Relatório de Atendimentos", {
      x: margin,
      y,
      size: 20,
      font: timesRomanBold,
      color: rgb(0, 0, 0)
    });

    y -= 30;

    // Período
    page.drawText(`Período: ${format(parseISO(startDate), "dd/MM/yyyy", { locale: pt })} a ${format(parseISO(endDate), "dd/MM/yyyy", { locale: pt })}`, {
      x: margin,
      y,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0)
    });

    y -= 20;

    // Filtros aplicados
    let filterText = "Filtros: ";
    let filterCount = 0;

    if (userId) {
      const user = await User.findByPk(userId);
      if (user) {
        filterText += `Atendente: ${user.name}`;
        filterCount++;
      }
    }

    if (status) {
      if (filterCount > 0) filterText += " | ";
      const statusMap = { open: "Aberto", pending: "Pendente", closed: "Fechado" };
      filterText += `Status: ${statusMap[status] || status}`;
      filterCount++;
    }

    if (queueIds && queueIds.length > 0) {
      if (filterCount > 0) filterText += " | ";
      if (queueIds.length === 1) {
        const queue = await Queue.findByPk(queueIds[0]);
        filterText += `Fila: ${queue ? queue.name : queueIds[0]}`;
      } else {
        filterText += `Filas: ${queueIds.length} selecionadas`;
      }
      filterCount++;
    }

    if (employerId) {
      if (filterCount > 0) filterText += " | ";
      const employer = await Contact.findOne({
        where: { id: employerId },
        attributes: ['name']
      });
      filterText += `Empresa: ${employer ? employer.name : employerId}`;
      filterCount++;
    }

    if (filterCount > 0) {
      page.drawText(filterText, {
        x: margin,
        y,
        size: 10,
        font: timesRomanFont,
        color: rgb(0, 0, 0)
      });
      y -= 20;
    }

    y -= 20;

    // Cabeçalho da tabela
    const columns = [
      { title: "ID", width: 40 },
      { title: "Contato", width: 100 },
      { title: "Fila", width: 100 },
      { title: "Atendente", width: 100 },
      { title: "Status", width: 70 },
      { title: "Avaliação", width: 60 },
      { title: "Criado em", width: 80 }
    ];

    // Desenhar cabeçalho da tabela
    let x = margin;
    columns.forEach(column => {
      page.drawText(column.title, {
        x,
        y,
        size: 12,
        font: timesRomanBold,
        color: rgb(0, 0, 0)
      });
      x += column.width;
    });

    y -= 20;

    // Dados da tabela
    const rowHeight = 25;
    let currentPage = page;

    // Função para truncar texto
    const truncateText = (text: string, maxLength: number): string => {
      return text ? (text.length > maxLength ? text.substring(0, maxLength) + "..." : text) : "N/A";
    };

    tickets.forEach((ticket, index) => {
      // Verificar se precisa de nova página
      if (y < margin + 50) {
        currentPage = pdfDoc.addPage([595.28, 841.89]);
        y = height - margin;

        // Desenhar cabeçalho da tabela na nova página
        x = margin;
        columns.forEach(column => {
          currentPage.drawText(column.title, {
            x,
            y,
            size: 12,
            font: timesRomanBold,
            color: rgb(0, 0, 0)
          });
          x += column.width;
        });

        y -= 20;
      }

      // Dados da linha
      x = margin;

      // ID
      currentPage.drawText(ticket.id.toString(), {
        x,
        y,
        size: 10,
        font: timesRomanFont,
        color: rgb(0, 0, 0)
      });
      x += columns[0].width;

      // Contato
      const contactName = ticket.contact ? ticket.contact.name : "N/A";
      currentPage.drawText(truncateText(contactName, 12), {
        x,
        y,
        size: 10,
        font: timesRomanFont,
        color: rgb(0, 0, 0)
      });
      x += columns[1].width;

      // Fila
      const queueName = ticket.queue ? ticket.queue.name : "N/A";
      currentPage.drawText(truncateText(queueName, 12), {
        x,
        y,
        size: 10,
        font: timesRomanFont,
        color: rgb(0, 0, 0)
      });
      x += columns[2].width;

      // Atendente
      const userName = ticket.user ? ticket.user.name : "N/A";
      currentPage.drawText(truncateText(userName, 12), {
        x,
        y,
        size: 10,
        font: timesRomanFont,
        color: rgb(0, 0, 0)
      });
      x += columns[3].width;

      // Status
      const statusText = ticket.status === "open" ? "Aberto" :
        ticket.status === "pending" ? "Pendente" :
          ticket.status === "closed" ? "Fechado" : ticket.status;
      currentPage.drawText(statusText, {
        x,
        y,
        size: 10,
        font: timesRomanFont,
        color: rgb(0, 0, 0)
      });
      x += columns[4].width;

      // Avaliação
      const ratingValue = ratingsMap.has(ticket.id) ? ratingsMap.get(ticket.id).toString() : "N/A";
      currentPage.drawText(ratingValue, {
        x,
        y,
        size: 10,
        font: timesRomanFont,
        color: rgb(0, 0, 0)
      });
      x += columns[5].width;

      // Data de criação
      const createdAtText = format(new Date(ticket.createdAt), "dd/MM/yyyy", { locale: pt });
      currentPage.drawText(createdAtText, {
        x,
        y,
        size: 10,
        font: timesRomanFont,
        color: rgb(0, 0, 0)
      });

      y -= rowHeight;
    });

    // Rodapé
    const lastPage = pdfDoc.getPage(pdfDoc.getPageCount() - 1);
    lastPage.drawText(`Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm:ss", { locale: pt })}`, {
      x: margin,
      y: margin / 2,
      size: 10,
      font: timesRomanFont,
      color: rgb(0, 0, 0)
    });

    // Finalizar PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (err) {
    logger.error("Erro ao gerar PDF:", err);
    throw new AppError(
      err instanceof AppError ? err.message : "Erro ao gerar PDF",
      err instanceof AppError ? err.statusCode : 500
    );
  }
};

export default ExportReportService;