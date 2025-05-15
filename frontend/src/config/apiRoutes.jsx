const apiRoutes = {
  sendMessage: {
    description: "Enviar mensagem de texto",
    endpoint: "/messages/send",
    method: "POST",
    fields: [
      {
        name: "number",
        type: "text",
        description: "Número do destinatário",
        placeholder: "5511999999999",
        required: true
      },
      {
        name: "body",
        type: "textarea",
        description: "Conteúdo da mensagem",
        placeholder: "Olá! Esta é uma mensagem de teste.",
        required: true
      },
      {
        name: "queueId",
        type: "text",
        description: "ID da fila (opcional)",
        placeholder: "1"
      },
      {
        name: "status",
        type: "text",
        description: "Status do ticket (open, pending, closed)",
        placeholder: "closed"
      },
      {
        name: "medias",
        type: "file",
        description: "Arquivos de mídia (opcional)",
        multiple: true,
        accept: "image/*,video/*,audio/*,application/pdf"
      }
    ]
  },
  sendPdfLink: {
    description: "Enviar link de PDF",
    endpoint: "/messages/send/linkPdf",
    method: "POST",
    fields: [
      {
        name: "number",
        type: "text",
        description: "Número do destinatário",
        placeholder: "5511999999999",
        required: true
      },
      {
        name: "url",
        type: "text",
        description: "URL do PDF",
        placeholder: "https://exemplo.com/documento.pdf",
        required: true
      },
      {
        name: "caption",
        type: "textarea",
        description: "Legenda/descrição",
        placeholder: "Confira este documento PDF"
      },
      {
        name: "queueId",
        type: "text",
        description: "ID da fila (opcional)",
        placeholder: "1"
      },
      {
        name: "status",
        type: "text",
        description: "Status do ticket (open, pending, closed)",
        placeholder: "closed"
      }
    ]
  },
  sendImageLink: {
    description: "Enviar link de imagem",
    endpoint: "/messages/send/linkImage",
    method: "POST",
    fields: [
      {
        name: "number",
        type: "text",
        description: "Número do destinatário",
        placeholder: "5511999999999",
        required: true
      },
      {
        name: "url",
        type: "text",
        description: "URL da imagem",
        placeholder: "https://exemplo.com/imagem.jpg",
        required: true
      },
      {
        name: "caption",
        type: "textarea",
        description: "Legenda/descrição",
        placeholder: "Confira esta imagem"
      },
      {
        name: "queueId",
        type: "text",
        description: "ID da fila (opcional)",
        placeholder: "1"
      },
      {
        name: "status",
        type: "text",
        description: "Status do ticket (open, pending, closed)",
        placeholder: "closed"
      }
    ]
  },
  checkNumber: {
    description: "Verificar número no WhatsApp",
    endpoint: "/messages/checkNumber",
    method: "POST",
    fields: [
      {
        name: "number",
        type: "text",
        description: "Número a verificar",
        placeholder: "5511999999999",
        required: true
      }
    ]
  },
  internalMessage: {
    description: "Criar mensagem interna",
    endpoint: "/messages/internal",
    method: "POST",
    fields: [
      {
        name: "ticketId",
        type: "text",
        description: "ID do ticket",
        placeholder: "123",
        required: true
      },
      {
        name: "body",
        type: "textarea",
        description: "Conteúdo da mensagem",
        placeholder: "Esta é uma mensagem interna",
        required: true
      },
      {
        name: "medias",
        type: "file",
        description: "Arquivos de mídia (opcional)",
        multiple: true,
        accept: "image/*,video/*,audio/*,application/pdf"
      }
    ]
  },
  updateQueueTicket: {
    description: "Atualizar fila de um ticket",
    endpoint: "/ticket/QueueUpdate/{ticketId}",
    method: "POST",
    fields: [
      {
        name: "ticketId",
        type: "text",
        description: "ID do ticket",
        placeholder: "123",
        required: true
      },
      {
        name: "queueId",
        type: "text",
        description: "ID da nova fila",
        placeholder: "1",
        required: true
      }
    ]
  },
  closeTicket: {
    description: "Fechar um ticket",
    endpoint: "/ticket/close",
    method: "POST",
    fields: [
      {
        name: "ticketId",
        type: "text",
        description: "ID do ticket",
        placeholder: "123",
        required: true
      }
    ]
  },
  addTagToTicket: {
    description: "Adicionar tag a um ticket",
    endpoint: "/ticket/TagUpdate",
    method: "POST",
    fields: [
      {
        name: "ticketId",
        type: "text",
        description: "ID do ticket",
        placeholder: "123",
        required: true
      },
      {
        name: "tagId",
        type: "text",
        description: "ID da tag",
        placeholder: "1",
        required: true
      }
    ]
  },
  removeTagFromTicket: {
    description: "Remover tag de um ticket",
    endpoint: "/ticket/TagRemove",
    method: "DELETE",
    fields: [
      {
        name: "ticketId",
        type: "text",
        description: "ID do ticket",
        placeholder: "123",
        required: true
      },
      {
        name: "tagId",
        type: "text",
        description: "ID da tag",
        placeholder: "1",
        required: true
      }
    ]
  },
  listTickets: {
    description: "Listar tickets da empresa",
    endpoint: "/ticket/ListTickets",
    method: "POST",
    fields: [
      {
        name: "companyId",
        type: "text",
        description: "ID da empresa (opcional)",
        placeholder: "1"
      }
    ]
  },
  listTicketsByTag: {
    description: "Listar tickets por tag",
    endpoint: "/ticket/ListByTag",
    method: "POST",
    fields: [
      {
        name: "tagId",
        type: "text",
        description: "ID da tag",
        placeholder: "1",
        required: true
      }
    ]
  },
  createTicket: {
    description: "Criar novo ticket",
    endpoint: "/ticket/create",
    method: "POST",
    fields: [
      {
        name: "contactId",
        type: "text",
        description: "ID do contato",
        placeholder: "123",
        required: true
      },
      {
        name: "status",
        type: "text",
        description: "Status inicial do ticket",
        placeholder: "open"
      },
      {
        name: "userId",
        type: "text",
        description: "ID do usuário responsável",
        placeholder: "1"
      },
      {
        name: "queueId",
        type: "text",
        description: "ID da fila",
        placeholder: "1"
      },
      {
        name: "whatsappId",
        type: "text",
        description: "ID do WhatsApp",
        placeholder: "1"
      }
    ]
  },
  createPBXTicket: {
    description: "Criar ticket para integração PBX",
    endpoint: "/ticket/createPBX",
    method: "POST",
    fields: [
      {
        name: "phoneNumber",
        type: "text",
        description: "Número do telefone",
        placeholder: "5511999999999",
        required: true
      },
      {
        name: "contactName",
        type: "text",
        description: "Nome do contato",
        placeholder: "João Silva"
      },
      {
        name: "status",
        type: "text",
        description: "Status do ticket",
        placeholder: "closed"
      },
      {
        name: "ramal",
        type: "text",
        description: "Número do ramal",
        placeholder: "123"
      },
      {
        name: "idFilaPBX",
        type: "text",
        description: "ID da fila no sistema PBX",
        placeholder: "10"
      },
      {
        name: "message",
        type: "textarea",
        description: "Mensagem interna",
        placeholder: "Atendimento via PBX"
      },
      {
        name: "medias",
        type: "file",
        description: "Arquivos de mídia (opcional)",
        multiple: true,
        accept: "image/*,video/*,audio/*,application/pdf"
      }
    ]
  },
  getTicketHistory: {
    description: "Obter histórico de tickets com mensagens",
    endpoint: "/ticket/history",
    method: "POST",
    fields: [
      {
        name: "startDate",
        type: "text",
        description: "Data inicial (YYYY-MM-DD)",
        placeholder: "2023-01-01",
        required: true
      },
      {
        name: "endDate",
        type: "text",
        description: "Data final (YYYY-MM-DD)",
        placeholder: "2023-12-31",
        required: true
      },
      {
        name: "contactNumber",
        type: "text",
        description: "Número do contato (opcional)",
        placeholder: "5511999999999"
      }
    ]
  },
  listInvoices: {
    description: "Listar faturas da empresa",
    endpoint: "/invoices",
    method: "POST",
    fields: [
      {
        name: "companyId",
        type: "text",
        description: "ID da empresa (opcional)",
        placeholder: "1"
      }
    ]
  },
  getInvoice: {
    description: "Obter detalhes de uma fatura",
    endpoint: "/invoices/invoiceId",
    method: "POST",
    fields: [
      {
        name: "Invoiceid",
        type: "text",
        description: "ID da fatura",
        placeholder: "123",
        required: true
      }
    ]
  },
  listContacts: {
    description: "Listar todos os contatos",
    endpoint: "/contacts",
    method: "POST",
    fields: [
      {
        name: "companyId",
        type: "text",
        description: "ID da empresa (opcional)",
        placeholder: "1"
      }
    ]
  },
  searchContacts: {
    description: "Pesquisar contatos com paginação",
    endpoint: "/contacts/list",
    method: "POST",
    fields: [
      {
        name: "searchParam",
        type: "text",
        description: "Termo de pesquisa",
        placeholder: "João",
        required: true
      },
      {
        name: "pageNumber",
        type: "number",
        description: "Número da página",
        placeholder: "1",
        required: true
      },
      {
        name: "companyId",
        type: "text",
        description: "ID da empresa (opcional)",
        placeholder: "1"
      }
    ]
  },
  getContact: {
    description: "Obter detalhes de um contato",
    endpoint: "/contacts/contactId",
    method: "POST",
    fields: [
      {
        name: "contactId",
        type: "text",
        description: "ID do contato",
        placeholder: "123",
        required: true
      },
      {
        name: "companyId",
        type: "text",
        description: "ID da empresa (opcional)",
        placeholder: "1"
      }
    ]
  },
  findOrCreateContact: {
    description: "Buscar ou criar contato",
    endpoint: "/contacts/findOrCreate",
    method: "POST",
    fields: [
      {
        name: "contactNumber",
        type: "text",
        description: "Número do contato",
        placeholder: "5511999999999",
        required: true
      },
      {
        name: "contactName",
        type: "text",
        description: "Nome do contato",
        placeholder: "João Silva",
        required: true
      }
    ]
  },
  updateContact: {
    description: "Atualizar um contato",
    endpoint: "/contacts/contactId",
    method: "PUT",
    fields: [
      {
        name: "contactId",
        type: "text",
        description: "ID do contato",
        placeholder: "123",
        required: true
      },
      {
        name: "contactName",
        type: "text",
        description: "Nome do contato",
        placeholder: "João Silva",
        required: true
      },
      {
        name: "contactEmail",
        type: "email",
        description: "Email do contato",
        placeholder: "joao@exemplo.com"
      },
      {
        name: "companyId",
        type: "text",
        description: "ID da empresa (opcional)",
        placeholder: "1"
      }
    ]
  },
  deleteContact: {
    description: "Remover um contato",
    endpoint: "/contacts/contactId/delete",
    method: "DELETE",
    fields: [
      {
        name: "contactId",
        type: "text",
        description: "ID do contato",
        placeholder: "123",
        required: true
      }
    ]
  },
  toggleBot: {
    description: "Ativar/desativar bot para um contato",
    endpoint: "/contacts/toggleDisableBot/contactId",
    method: "PUT",
    fields: [
      {
        name: "contactId",
        type: "text",
        description: "ID do contato",
        placeholder: "123",
        required: true
      }
    ]
  },
  deleteAllContacts: {
    description: "Remover todos os contatos",
    endpoint: "/contacts/delete/all",
    method: "DELETE",
    fields: [
      {
        name: "companyId",
        type: "text",
        description: "ID da empresa (opcional)",
        placeholder: "1"
      }
    ]
  },
  uploadContacts: {
    description: "Importar contatos de arquivo",
    endpoint: "/contacts/upload",
    method: "POST",
    fields: [
      {
        name: "file",
        type: "file",
        description: "Arquivo de contatos (XLS/XLSX/CSV)",
        accept: ".xls,.xlsx,.csv",
        required: true
      }
    ]
  },
  createCompany: {
    description: "Criar uma nova empresa",
    endpoint: "/company/new",
    method: "POST",
    fields: [
      {
        name: "name",
        type: "text",
        description: "Nome da empresa",
        placeholder: "Minha Empresa Ltda",
        required: true
      },
      {
        name: "email",
        type: "email",
        description: "Email da empresa",
        placeholder: "contato@minhaempresa.com",
        required: true
      },
      {
        name: "phone",
        type: "text",
        description: "Telefone da empresa",
        placeholder: "5511999999999"
      },
      {
        name: "status",
        type: "text",
        description: "Status da empresa (true/false)",
        placeholder: "true"
      }
    ]
  },
  updateCompany: {
    description: "Atualizar dados de uma empresa",
    endpoint: "/company/edit/{id}",
    method: "POST",
    fields: [
      {
        name: "id",
        type: "text",
        description: "ID da empresa",
        placeholder: "1",
        required: true
      },
      {
        name: "name",
        type: "text",
        description: "Nome da empresa",
        placeholder: "Minha Empresa Ltda"
      },
      {
        name: "email",
        type: "email",
        description: "Email da empresa",
        placeholder: "contato@minhaempresa.com"
      },
      {
        name: "phone",
        type: "text",
        description: "Telefone da empresa",
        placeholder: "5511999999999"
      },
      {
        name: "status",
        type: "text",
        description: "Status da empresa (true/false)",
        placeholder: "true"
      }
    ]
  },
  blockCompany: {
    description: "Bloquear uma empresa",
    endpoint: "/company/block",
    method: "POST",
    fields: [
      {
        name: "companyId",
        type: "text",
        description: "ID da empresa",
        placeholder: "1",
        required: true
      }
    ]
  },
  getDashboardOverview: {
    description: "Obter visão geral do dashboard",
    endpoint: "/dashboard/overview",
    method: "POST",
    fields: [
      {
        name: "period",
        type: "text",
        description: "Período (day, week, month)",
        placeholder: "week",
        required: true
      },
      {
        name: "date",
        type: "text",
        description: "Data de referência (YYYY-MM-DD)",
        placeholder: "2023-12-31",
        required: true
      },
      {
        name: "userId",
        type: "text",
        description: "ID do usuário para filtrar (opcional)",
        placeholder: "1"
      },
      {
        name: "queueId",
        type: "text",
        description: "ID da fila para filtrar (opcional)",
        placeholder: "1"
      }
    ]
  }
};

export default apiRoutes;