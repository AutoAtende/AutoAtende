import { title } from "process";

const messages = {
  pt: {
    translations: {
      languages: {
        undefined: "Idioma",
        ptBr: "Português",
        es: "Español",
        en: "English",
        tr: "Türkçe",
      },
      companySelector: {
        selectCompany: "Acessar como administrador...",
        accessingAs: "Acessando como administrador da empresa",
        returnToSuperAdmin: "Retornar à conta principal",
        returnedToSuperAdmin: "Retornado à conta de super administrador",
      },
      whitelabel: {
        titles: {
          generalSettings: "Configurações Gerais",
          colorSettings: "Configurações de Cores",
          logosAndBackgrounds: "Logos, Ícones e Imagens de Fundo"
        },
        labels: {
          systemName: "Nome do sistema",
          copyright: "Copyright",
          privacyPolicy: "Link da Política de Privacidade",
          terms: "Link dos Termos de uso",
          chooseColor: "Escolha a cor a ser alterada"
        },
        colors: {
          primaryColorLight: "Cor Primária Modo Claro",
          secondaryColorLight: "Cor Secundária Modo Claro",
          primaryColorDark: "Cor Primária Modo Escuro",
          secondaryColorDark: "Cor Secundária Modo Escuro",
          iconColorLight: "Cor do Ícone Modo Claro",
          iconColorDark: "Cor do Ícone Modo Escuro",
          chatlistLight: "Fundo Chat Interno Modo Claro",
          chatlistDark: "Fundo Chat Interno Modo Escuro",
          boxLeftLight: "Mensagens de Outros Modo Claro",
          boxLeftDark: "Mensagens de Outros Modo Escuro",
          boxRightLight: "Mensagens do Usuário Modo Claro",
          boxRightDark: "Mensagens do Usuário Modo Escuro"
        },
        images: {
          appLogoLight: "Logotipo para tema claro",
          appLogoDark: "Logotipo para tema escuro",
          appLogoFavicon: "Icone do FavIcon",
          appLogoPWAIcon: "Ícone do PWA",
          loginBackground: "Imagem de fundo para tela de login",
          signupBackground: "Imagem de fundo para tela de cadastro"
        },
        success: {
          settingUpdated: "Configuração atualizada com sucesso",
          backgroundUpdated: "Imagem de fundo atualizada com sucesso",
          backgroundDeleted: "Imagem de fundo removida com sucesso",
          logoUpdated: "Logo atualizado com sucesso"
        },
        errors: {
          settingUpdateFailed: "Erro ao atualizar configuração",
          backgroundUploadFailed: "Erro ao fazer upload da imagem de fundo",
          backgroundDeleteFailed: "Erro ao remover imagem de fundo",
          logoUploadFailed: "Erro ao fazer upload do logo"
        }
      },
      company: {
        delete: "Excluir",
        save: "Salvar",
        cancel: "Cancelar",
        user: "Usuário",
        monthly: "Mensal",
        bimonthly: "Bimestral",
        quarterly: "Trimestral",
        semiannual: "Semestral",
        annual: "Anual",
        recurrence: "Recorrência",
        enabled: "Habilitadas",
        disabled: "Desabilitadas",
        campaigns: "Campanhas",
        active: "Ativo",
        inactive: "Inativo",
        status: "Status",
        plan: "Plano",
      },
      ticket: {
        notifications: {
          notificationWarningMessageUser:
            "Este ticket não pode ser reaberto porque não possui uma conexão vinculada. O ticket foi fechado porque a conexão foi deletada.",
        },
        buttons: {
          cancel: "Cancelar",
          confirm: "Confirmar",
          refresh: "Atualizar a listagem de atendimentos",
        },
        emailPdf: {
          title: "Enviar Atendimento por E-mail",
          emailLabel: "E-mail do Destinatário",
          subjectLabel: "Assunto",
          messageLabel: "Mensagem",
          sendButton: "Enviar",
          cancelButton: "Cancelar",
          success: "E-mail enviado com sucesso!",
          error: "Erro ao enviar e-mail. Tente novamente.",
          missingInfo: "Preencha todos os campos obrigatórios.",
        },
        pdfExport: {
          generating: "Gerando PDF...",
          elementsNotFound:
            "Não foi possível encontrar o conteúdo do atendimento",
          fileTooLarge: "O arquivo PDF gerado é muito grande. Máximo de 10MB.",
          generationError: "Erro ao gerar PDF. Tente novamente.",
        },
        menuItem: {
          sku: "Definir Valor e SKU do Ticket",
          transfer: "Transferir Atendimento",
          schedule: "Agendamento",
          deleteTicket: "Deletar Ticket",
          createTask: "Criar Tarefa",
        },
        queueModal: {
          title: "Selecione o setor",
          queue: "Setor"
        },
        tagModal: {
          title: "Selecione as tags",
          select: "Tags",
          placeholder: "Selecione uma ou mais tags"
        },
        vcard: {
          buttonSave: "Salvar",
          buttonConversation: "Conversar",
        },
        toasts: {
          savedContactSuccess: "Contato salvo com sucesso.",
        },
        sku: {
          skuValue: "Valor do Ticket",
          skuCode: "Código SKU",
          updatedTicketValueSuccessSku: "Valor atualizado com sucesso!",
        },
        actionButtons: {
          exportPDF: "Exportar para PDF",
          close: "Fechar",
        },
        noMessagesSelected: "Nenhuma mensagem selecionada",
      },
      genericError: "Ops! Houve um erro, atualize a página e tente novamente, se o problema persistir entre em contato com o suporte técnico.",
      signup: {
        title: "Criar Conta",
        unavailable: "Cadastro indisponível no momento",
        steps: {
          person: "Dados Pessoais",
          company: "Dados da Empresa",
          address: "Endereço",
          access: "Acesso",
        },
        form: {
          personType: "Tipo de Pessoa",
          personTypes: {
            physical: "Pessoa Física",
            legal: "Pessoa Jurídica",
          },
          cpf: "CPF",
          cnpj: "CNPJ",
          fullName: "Nome Completo",
          razaoSocial: "Razão Social",
          email: "E-mail",
          phone: "Telefone",
          password: "Senha",
          cep: "CEP",
          estado: "Estado",
          cidade: "Cidade",
          bairro: "Bairro",
          logradouro: "Logradouro",
          numero: "Número",
          noNumber: "Sem número",
          plan: "Plano",
          users: "Usuários",
          queues: "Setores",
          loading: "Carregando...",
          acceptTerms: "Li e aceito os",
          terms: "Termos de Uso",
          and: "e",
          privacy: "Política de Privacidade",
        },
        validation: {
          required: "Campo obrigatório",
          invalidPhone: "Telefone inválido",
          emailExists: "Este email já está em uso",
          phoneExists: "Este telefone já está em uso",
          invalidDocument: "Documento inválido",
          terms: "Você precisa aceitar os termos de uso",
          documento: {
            invalido: "Documento inválido ou com sequência repetida",
            sequencia: "Documento com sequência repetida não é permitido"
          },
          nome: {
            min: "Nome deve ter pelo menos 3 caracteres",
            completo: "Insira nome e sobrenome completos",
            repetido: "Nome contém muitos caracteres repetidos"
          },
          phone: {
            invalido: "Telefone inválido - deve ter entre 10 e 11 dígitos",
            sequencia: "Telefone com sequência repetida não é permitido",
            ddd: "DDD inválido"
          },
          cep: {
            invalido: "CEP inválido - deve ter 8 dígitos",
            sequencia: "CEP com sequência repetida não é permitido"
          },
          endereco: {
            estadoInvalido: "Estado inválido",
            cidadeMin: "Cidade deve ter pelo menos 2 caracteres",
            bairroMin: "Bairro deve ter pelo menos 2 caracteres",
            logradouroMin: "Logradouro deve ter pelo menos 5 caracteres",
            bairroCidade: "Bairro não pode ser igual à cidade",
            logradouroBairro: "Logradouro não pode ser igual ao bairro",
            logradouroCidade: "Logradouro não pode ser igual à cidade"
          },
          password: {
            requirements: "Requisitos da senha",
            length: "Mínimo de 8 caracteres",
            lowercase: "Pelo menos uma letra minúscula",
            uppercase: "Pelo menos uma letra maiúscula",
            number: "Pelo menos um número",
            special: "Pelo menos um caractere especial (@$!%*?&)",
            comum: "Senha muito fraca ou previsível",
            sequencia: "Senha não pode conter sequências repetidas",
            contemNome: "Senha não deve conter seu nome",
            contemEmail: "Senha não deve conter seu email"
          },
          email: {
            dominio: "Domínio de email não parece válido"
          },
          numero: {
            zeros: "Número não pode ser apenas zeros"
          }
        },
        errors: {
          dadosInconsistentes: "Dados inválidos ou inconsistentes",
          verificarCampos: "Verifique os campos destacados e tente novamente"
        },
        passwordStrength: {
          weak: "Senha fraca",
          medium: "Senha média",
          strong: "Senha forte",
        },
        buttons: {
          next: "Próximo",
          back: "Voltar",
          submit: "Cadastrar",
          login: "Entrar",
          loginText: "Já tem uma conta?",
          backToLogin: "Voltar para Login",
          forgotPassword: "Esqueci minha senha",
        },
        toasts: {
          success: "Cadastro realizado com sucesso!",
          error: "Erro ao realizar cadastro",
          errorPassword: "Erro ao validar senha",
          errorPlan: "Erro ao selecionar plano",
          errorFields: "Erro ao validar campos",
          errorDocument: "Erro ao validar documento",
          errorAddress: "Erro ao buscar endereço",
          errorEmail: "Erro ao validar email",
          errorPhone: "Erro ao validar telefone",
        },
      },
      forgotPassword: {
        title: "Esqueci minha senha",
        resetTitle: "Redefinir senha",
        email: "E-mail",
        token: "Código de verificação",
        newPassword: "Nova senha",
        confirmPassword: "Confirme a nova senha",
        sendEmail: "Enviar e-mail",
        resetPassword: "Redefinir senha",
        cancel: "Cancelar",
        invalidEmail: "E-mail inválido",
        requiredEmail: "E-mail é obrigatório",
        requiredToken: "Código de verificação é obrigatório",
        invalidToken: "Código de verificação inválido",
        requiredPassword: "Nova senha é obrigatória",
        minPassword: "A senha deve ter pelo menos 8 caracteres",
        passwordRequirements:
          "A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número",
        passwordMatch: "As senhas não correspondem",
        requiredConfirmPassword: "Confirmação de senha é obrigatória",
        emailSent: "E-mail enviado com sucesso! Verifique sua caixa de entrada",
        emailError: "Erro ao enviar e-mail. Tente novamente",
        resetSuccess: "Senha redefinida com sucesso!",
        resetError: "Erro ao redefinir senha. Tente novamente",
        sendEmailTooltip: "Enviar e-mail com código de verificação",
        resetPasswordTooltip: "Confirmar nova senha",
      },
      voiceSettings: {
        title: "Configurações de Voz",
        configInfo: "Configure como o sistema processará mensagens de voz e respostas de áudio para este assistente.",
        transcriptionSection: "Transcrição de Voz",
        enableTranscription: "Habilitar transcrição automática de mensagens de voz",
        transcriptionHelp: "Quando ativado, as mensagens de áudio recebidas serão automaticamente transcritas para texto.",
        responsesSection: "Respostas em Áudio",
        enableResponses: "Habilitar respostas em áudio",
        responsesHelp: "Quando ativado, as respostas do assistente serão convertidas em áudio quando o contato enviar mensagens de voz.",
        voice: "Voz do Assistente",
        speed: "Velocidade da Fala",
        buttons: {
          save: "Salvar Configurações",
          saving: "Salvando...",
          cancel: "Cancelar"
        },
        toasts: {
          loadError: "Erro ao carregar configurações de voz",
          saveSuccess: "Configurações de voz salvas com sucesso",
          saveError: "Erro ao salvar configurações de voz"
        }
      },
      micPermission: {
        title: "Permissão de Microfone Necessária",
        description: "Para gravar mensagens de voz, é necessário permitir o acesso ao microfone.",
        instructions: "Clique em 'Permitir' quando o navegador solicitar a permissão ou abra as configurações do navegador para conceder acesso.",
        openSettings: "Abrir Configurações",
        cancel: "Cancelar",
        openSettingsManually: "Por favor, abra as configurações do seu navegador manualmente para permitir o acesso ao microfone."
      },
      reports: {
        title: 'Relatórios de Atendimento',
        description: 'Visualize e analise dados de atendimentos realizados em sua empresa.',
        filters: {
          title: 'Filtros',
          startDate: 'Data Inicial',
          endDate: 'Data Final',
          status: 'Status',
          user: 'Atendente',
          queues: 'Setor',
          queue: "Setor",
          allQueue: "Todos os Setores",
          tags: 'Tags',
          search: 'Buscar',
          period: "Periodo",
          filterBy: "Filtrar por",
          employer: "Empresa",
          allEmployers: "Todas as empresas",
          clearFilters: 'Limpar Filtros',
          allStatus: 'Todos os Status',
          statusOpen: 'Aberto',
          statusPending: 'Pendente',
          statusClosed: 'Fechado',
          allUsers: 'Todos os Atendentes'
        },
        tabs: {
          data: 'Dados',
          export: 'Exportar',
          charts: 'Gráficos',
          exportCsv: "Exportar CSV"
        },
        table: {
          columns: {
            id: 'ID',
            contact: 'Contato',
            queue: 'Setor',
            user: 'Atendente',
            status: 'Status',
            rating: 'Avaliação',
            createdAt: 'Criado em',
            updatedAt: 'Atualizado em',
            tags: 'Tags'
          },
          noData: 'Nenhum dado encontrado para os filtros selecionados.',
          rowsPerPage: 'Linhas por página:',
          of: 'de',
          unknown: 'Desconhecido'
        },
        status: {
          open: 'Aberto',
          pending: 'Pendente',
          closed: 'Fechado'
        },
        export: {
          preview: 'Prévia',
          previewNote: 'Mostrando {shown} de {total} registros',
          summary: 'Resumo',
          totalTickets: 'Total de Atendimentos',
          totalMessages: 'Total de Mensagens',
          avgMessagesPerTicket: 'Média de Mensagens por Atendimento',
          avgAttendanceTime: 'Tempo Médio de Atendimento',
          statusDistribution: 'Distribuição por Status',
          reportTitle: 'Relatório de Atendimentos',
          periodLabel: 'Período',
          options: 'Opções de Exportação',
          includeLogo: 'Incluir Logo da Empresa',
          exportPdf: 'Exportar PDF',
          generating: 'Gerando...',
          success: 'Relatório exportado com sucesso!',
          error: 'Erro ao exportar relatório. Tente novamente.',
          logoPlaceholder: 'Logo da empresa (será incluída no PDF)'
        },
        exportCsv: {
          title: "Exportação para CSV",
          description: "Exporte os tickets filtrados para um arquivo CSV que pode ser aberto em Excel ou outros programas de planilha.",
          filePreview: "Prévia do Arquivo CSV",
          preview: "PRÉVIA",
          generating: "Gerando CSV...",
          filters: "Filtros",
          exportButton: "Exportar CSV",
          fileStructure: "Estrutura do arquivo de retorno",
          success: "CSV gerado com sucesso. O download começará automaticamente.",
          errorCsv: "Erro ao gerar arquivo CSV. Tente novamente.",
          noDataToExport: "Não há dados para exportar com os filtros selecionados.",
          infoMessage: "O arquivo CSV incluirá todos os tickets que correspondem aos filtros aplicados. Os dados serão exportados em formato de tabela com cabeçalhos.",
          instructions: "Instruções de Uso",
          instruction1: "O arquivo CSV gerado pode ser importado em programas como Microsoft Excel, Google Sheets ou LibreOffice Calc.",
          instruction2: "Para abrir em Excel, basta clicar duas vezes no arquivo baixado ou usar a opção 'Abrir' no Excel e localizar o arquivo.",
          instruction3: "Caso os caracteres especiais não apareçam corretamente, escolha a opção UTF-8 ao abrir o arquivo."
        },
        charts: {
          title: 'Análise Gráfica',
          daily: 'Diário',
          weekly: 'Semanal',
          monthly: 'Mensal',
          ticketsByQueue: 'Atendimentos por Setor',
          ticketsByStatus: 'Atendimentos por Status',
          ticketsTrend: 'Tendência de Atendimentos',
          tickets: 'Atendimentos',
          topUsers: 'Top Atendentes',
          topQueues: 'Top Setores',
          noData: 'Nenhum dado disponível para o período selecionado.'
        },
        errors: {
          loadFailed: 'Falha ao carregar os dados. Tente novamente.',
          chartLoadFailed: 'Falha ao carregar os gráficos. Tente novamente.',
          summaryLoadFailed: 'Falha ao carregar o resumo. Tente novamente.'
        }
      },

      queueModal: {
        title: {
          add: "Adicionar Setor",
          edit: "Editar Setor"
        },
        form: {
          name: "Nome",
          color: "Cor",
          orderQueue: "Ordem na Setor",
          integrationId: "Integração",
          greetingMessage: "Mensagem de Saudação",
          outOfHoursMessage: "Mensagem Fora do Horário",
          keywords: "Palavras-chave (separadas por vírgula)",
          closeTicket: "Fechar Ticket Automaticamente",
          newTicketOnTransfer: "Abrir um Novo Ticket na Transferência",
          tags: "Tags"
        },
        tabs: {
          queue: "Setor",
          schedules: "Horários",
          options: "Opções",
          preview: "Pré-visualização"
        },
        buttons: {
          attach: "Anexar Arquivo",
          cancel: "Cancelar",
          okAdd: "Adicionar",
          okEdit: "Salvar",
          saveSchedules: "Salvar Horários",
          back: "Voltar"
        },
        confirmationModal: {
          deleteTitle: "Excluir Mídia",
          deleteMessage: "Tem certeza que deseja excluir este arquivo de mídia?",
          deleteOptionTitle: "Excluir Opção",
          deleteOptionMessage: "Tem certeza que deseja excluir esta opção? Esta ação não pode ser desfeita."
        },
        toasts: {
          success: "Setor salvo com sucesso!",
          deleted: "Mídia excluída com sucesso!",
          fileAttached: "Arquivo anexado com sucesso!",
          fileRemoved: "Arquivo removido com sucesso!",
          deleteError: "Erro ao excluir mídia.",
          saveError: "Erro ao salvar Setor.",
          promptError: "Erro ao carregar prompts.",
          integrationError: "Erro ao carregar integrações.",
          queueError: "Erro ao carregar dados do setor.",
          optionsError: "Erro ao carregar opções do setor.",
          optionLoadError: "Erro ao carregar subopções.",
          transfersError: "Erro ao carregar dados para transferências.",
          contactSearchError: "Erro ao buscar contatos.",
          previewError: "Erro ao carregar prévia da opção.",
          optionSaved: "Opção salva com sucesso!",
          optionSaveError: "Erro ao salvar opção.",
          optionDeleted: "Opção excluída com sucesso!",
          optionDeleteError: "Erro ao excluir opção.",
          scheduleSaved: "Clique em salvar para registrar as alterações",
          contactSelected: "Contato selecionado com sucesso!",
          childOptionsError: "Erro ao carregar opções filhas.",
          tagsError: "Erro ao carregar tags."
        },
        preview: {
          title: "Pré-visualização do Setor",
          queueInfo: "Informações do Setor",
          messages: "Mensagens",
          options: "Opções Disponíveis",
          noValue: "Não definido",
          noMessage: "Nenhuma mensagem definida",
          noOptions: "Nenhuma opção disponível"
        }
      },
      queueOptions: {
        title: "Opções de Atendimento",
        addChild: "Adicionar Sub-opção",
        editing: "Editando Opção",
        add: "Adicionar Opção",
        optionType: "Tipo de Opção",
        title: "Título",
        message: "Mensagem",
        noMessage: "Sem mensagem",
        save: "Salvar",
        delete: "Excluir",
        preview: "Pré-visualizar",
        untitled: "Sem título",
        attachFile: "Anexar Arquivo",
        selectedContact: "Contato selecionado",
        selectContact: "Selecionar Contato",
        changeContact: "Alterar Contato",
        targetQueue: "Setor de Destino",
        selectQueue: "Selecione um setor",
        targetUser: "Atendente de Destino",
        selectUser: "Selecione um Atendente",
        targetWhatsapp: "Conexão de Destino",
        selectWhatsapp: "Selecione uma Conexão",
        validationType: "Tipo de Validação",
        selectValidationType: "Selecione um Tipo de Validação",
        validationRegex: "Expressão Regular",
        validationRegexPlaceholder: "Ex: ^[0-9]{11}$",
        validationRegexHelp: "Expressão regular para validar a entrada do usuário",
        validationErrorMessage: "Mensagem de Erro",
        validationErrorMessagePlaceholder: "Por favor, insira um valor válido",
        conditionalLogicTitle: "Lógica Condicional",
        conditionalLogicDescription: "Configure condições para direcionar o usuário para diferentes opções",
        conditionalVariable: "Variável Condicional",
        selectConditionalVariable: "Selecione uma Variável",
        conditions: "Condições",
        operator: "Operador",
        value: "Valor",
        targetOption: "Opção de Destino",
        selectTargetOption: "Selecione uma Opção",
        addCondition: "Adicionar Condição",
        defaultOption: "Opção Padrão",
        defaultOptionDescription: "Opção que será selecionada se nenhuma condição for atendida",
        noDefaultOption: "Sem opção padrão",
        optionTypes: {
          text: "Texto",
          audio: "Áudio",
          video: "Vídeo",
          image: "Imagem",
          document: "Documento",
          contact: "Contato",
          transferQueue: "Transferir para Setor",
          transferUser: "Transferir para Atendente",
          transferWhatsapp: "Transferir para Conexão",
          validation: "Validação",
          conditional: "Condicional"
        },
        validationTypes: {
          cpf: "CPF",
          email: "E-mail",
          phone: "Telefone",
          custom: "Personalizado"
        },
        conditionalVariables: {
          lastMessage: "Última Mensagem do Usuário"
        },
        operators: {
          equals: "Igual a",
          contains: "Contém",
          startsWith: "Começa com",
          endsWith: "Termina com",
          regex: "Expressão Regular"
        },
        contactSearch: {
          title: "Buscar Contato",
          searchPlaceholder: "Digite nome ou número",
          noResults: "Nenhum contato encontrado",
          startTyping: "Digite para buscar contatos",
          cancel: "Cancelar"
        },
        preview: {
          title: "Pré-visualização da Opção",
          mediaFile: "Arquivo de mídia",
          contactCard: "Cartão de Contato",
          transferTo: "Transferir para",
          note: "Esta é uma prévia de como a opção será exibida para o usuário",
          close: "Fechar"
        }
      },
      login: {
        title: "Login",
        title2: "Fazer login",
        forgotPassword: "Esqueci minha senha",
        invalidCredentials: "Email ou senha incorretos. Por favor, tente novamente.",
        missingFields: "Por favor, preencha todos os campos.",
        rememberMe: "Lembrar-me",
        form: {
          email: "Email",
          password: "Senha",
          emailPlaceholder: "Digite seu e-mail",
          passwordPlaceholder: "Digite sua senha"
        },
        buttons: {
          submit: "Entrar",
          register: "Não tem um conta? Cadastre-se!",
          returlogin: "Voltar ao menu principal",
          send: "Enviar E-mail",
        },
      },
      plans: {
        form: {
          name: "Nome",
          users: "Usuários",
          connections: "Conexões",
          queue: "Setores",
          campaigns: "Campanhas",
          schedules: "Agendamentos",
          email: "E-mail",
          chat: "Chat Interno",
          isVisible: "Mostrar",
          delete: "Deseja realmente excluir esse registro?",
          api: "Api Externa",
          kanban: "Kanban",
          whiteLabel: "Estilizador",
          integrations: "Integrações",
          openAIAssistants: "Agentes IA",
          flowBuilder: "Flow Builder",
          apiOfficial: "API Oficial",
          chatBotRules: "Regras de ChatBot",
          storageLimit: "Limite de Armazenamento (MB)",
          contentLimit: "Limite de Conteúdo Agentes (MB)",
          enabled: "Habilitadas",
          disabled: "Desabilitadas",
          clear: "Cancelar",
          save: "Salvar",
          yes: "Sim",
          no: "Não",
          money: "R$",
        },
      },
      companies: {
        title: "Gerenciamento de Empresas",
        searchPlaceholder: "Buscar empresa...",
        table: {
          id: "ID",
          status: "Status",
          name: "Nome/Razão Social",
          email: "E-mail",
          value: "Valor",
          dueDate: "Vencimento",
          actions: "Ações",
        },
        status: {
          active: "Ativo",
          inactive: "Inativo",
        },
        buttons: {
          new: "Nova Empresa",
          view: "Visualizar",
          edit: "Editar",
          delete: "Excluir",
          cancel: "Cancelar",
          save: "Salvar",
          emailInvoice: "Enviar Fatura por E-mail",
          whatsappInvoice: "Enviar Fatura por WhatsApp",
        },
        fields: {
          personType: "Tipo de Pessoa",
          name: "Nome",
          companyName: "Razão Social",
          document: "Documento",
          email: "E-mail",
          phone: "Telefone",
          status: "Status",
          plan: "Plano",
          zipCode: "CEP",
          state: "Estado",
          city: "Cidade",
          neighborhood: "Bairro",
          street: "Logradouro",
          number: "Número",
          currentPlan: "Plano Atual",
          value: "Valor",
          dueDate: "Data de Vencimento",
          dueDay: "Dia do Vencimento",
          recurrence: "Recorrência",
        },
        personType: {
          individual: "Pessoa Física",
          company: "Pessoa Jurídica",
        },
        recurrence: {
          monthly: "Mensal",
          quarterly: "Trimestral",
          semiannual: "Semestral",
          annual: "Anual",
        },
        details: {
          title: "Detalhes da Empresa",
          tabs: {
            main: "Dados Principais",
            address: "Endereço",
            billing: "Plano e Faturamento",
            resources: "Recursos",
          },
        },
        resources: {
          whatsapp: "Conexões WhatsApp",
          users: "Usuários",
          queues: "Setores",
        },
        edit: {
          title: "Editar Empresa",
          tabs: {
            main: "Dados Principais",
            address: "Endereço",
            billing: "Plano e Faturamento",
          },
          validation: {
            nameRequired: "Nome é obrigatório",
            nameMin: "Nome deve ter no mínimo 2 caracteres",
            emailRequired: "E-mail é obrigatório",
            emailInvalid: "E-mail inválido",
            phoneRequired: "Telefone é obrigatório",
            phoneOnlyNumbers: "Telefone deve conter apenas números",
            phoneMin: "Telefone deve ter no mínimo 10 números",
            phoneMax: "Telefone deve ter no máximo 11 números",
            planRequired: "Plano é obrigatório",
            dueDayFormat: "Dia de vencimento deve ser um número",
            dueDayRange: "Dia de vencimento deve estar entre 1 e 28",
            zipFormat: "CEP deve ter 8 números",
            stateFormat: "Estado deve ter 2 letras",
          },
          errors: {
            loadPlans: "Erro ao carregar planos",
            update: "Erro ao atualizar empresa",
          },
          success: "Empresa atualizada com sucesso",
        },
        deleteDialog: {
          title: "Confirmar Exclusão",
          message: "Tem certeza que deseja excluir a empresa {name}?",
        },
        toasts: {
          loadError: "Erro ao carregar empresas",
          deleted: "Empresa excluída com sucesso",
          deleteError: "Erro ao excluir empresa",
          invoiceSentemailSuccess: "Fatura enviada por e-mail com sucesso",
          invoiceSentwhatsappSuccess: "Fatura enviada por WhatsApp com sucesso",
          invoiceSentemailError: "Erro ao enviar fatura por e-mail",
          invoiceSentwhatsappError: "Erro ao enviar fatura por WhatsApp",
        },
        confirmations: {
          deleteTitle: "Excluir Empresa",
          deleteMessage: "Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.",
        },
        notifications: {
          deleteSuccess: "Empresa excluída com sucesso",
          deleteError: "Erro ao excluir empresa",
          updateSuccess: "Empresa atualizada com sucesso",
          updateError: "Erro ao atualizar empresa",
        }
      },
      auth: {
        toasts: {
          success: "Login efetuado com sucesso!",
        },
        token: "Token",
      },
      companyModal: {
        form: {
          numberAttendants: "Quantidade de Atendendes",
          numberConections: "Quantidade de Conexões",
        },
        success: "Empresa alterada com sucesso.",
        add: "Empresa adicionada com sucesso.",
      },

      dashboard: {
        title: "Dashboard",
        performance: {
          title: "Dashboard de Desempenho"
        },
        selectDateRange: "Por favor selecione um período de datas",
        noData: "Nenhum dado disponível",
        noAttendantsData: "Nenhum dado de atendente disponível para o período selecionado",
        summary: {
          title: "Resumo do Período",
          resolutionRate: "Taxa de Resolução",
          avgSupportTime: "Tempo Médio de Atendimento",
          npsScore: "NPS Score",
          activeAttendants: "Atendentes Ativos"
        },
        tooltips: {
          hour: "Horário",
          attendances: "Atendimentos",
          filter: "Filtros avançados",
          export: "Exportar",
          refresh: "Atualizar dados"
        },
        trend: {
          tooltip: "Comparado com o período anterior",
          hourly: "vs última hora",
          daily: "vs ontem",
          weekly: "vs semana anterior"
        },
        filters: {
          title: "Filtros",
          showAdvanced: "Mostrar filtros avançados",
          hideAdvanced: "Ocultar filtros avançados"
        },
        date: {
          initialDate: "Data Inicial",
          finalDate: "Data Final"
        },
        timeRange: {
          today: "Hoje",
          week: "7 dias",
          month: "30 dias",
          custom: "Personalizado"
        },
        chart: {
          total: "Total",
          resolved: "Resolvidos",
          pending: "Pendentes",
          userPerformance: "Atendimentos por Usuário",
          npsScore: "NPS Score"
        },
        charts: {
          attendancesByHour: "Atendimentos por Hora",
          attendances: "Atendimentos",
          hourlyAttendance: "Atendimentos por Horário",
          messagesByDay: "Mensagens por Dia da Semana",
          agentDistribution: "Distribuição por Agente (%)"
        },
        status: {
          ongoing: "Em Atendimento",
          pending: "Aguardando",
          finished: "Finalizados",
          resolutionRate: "Taxa Resolução",
          online: "Online",
          offline: "Offline"
        },
        cards: {
          ongoing: "Em Atendimento",
          pending: "Aguardando",
          finished: "Finalizados",
          activeAttendants: "Atendentes Ativos",
          totalMessages: "Total de Mensagens",
          avgTime: "Tempo Médio",
          totalContacts: "Contatos Totais",
          resolutionRate: "Taxa de Resolução",
          avgResponseTime: "Tempo Médio de Resposta"
        },
        metrics: {
          messages: "Mensagens Trocadas",
          contacts: "Total de Contatos",
          resolutionRate: "Taxa de Resolução (%)",
          responseTime: "Tempo Resp.",
          satisfaction: "Satisfação"
        },
        nps: {
          title: "Net Promoter Score (NPS)",
          score: "NPS Score (%)",
          promoters: "Promotores",
          passives: "Neutros",
          detractors: "Detratores"
        },
        table: {
          attendant: "Atendente",
          name: "Nome",
          status: "Status",
          rating: "Avaliação",
          total: "Total",
          ongoing: "Em Andamento",
          finished: "Finalizados",
          waitTime: "TME",
          supportTime: "TMA",
          unknown: "Desconhecido",
          email: "Email",
          totalTickets: "Total de Tickets",
          avgWaitTime: "Tempo Médio de Espera (min)",
          avgSupportTime: "Tempo Médio de Atendimento (min)"
        },
        tables: {
          attendantsPerformance: "Desempenho dos Atendentes",
          departmentComparison: "Comparativo entre Departamentos",
          agentPerformance: "Desempenho dos Agentes"
        },
        buttons: {
          cancel: "Cancelar",
          apply: "Aplicar",
          applyFilters: "Aplicar Filtros",
          clear: "Limpar"
        },
        export: {
          pdf: "Exportar PDF",
          excel: "Exportar Excel"
        },
        time: {
          minutes: "min"
        },
        report: {
          title: "Relatório de Atendimentos",
          period: "Período",
          to: "até",
          attendantsPerformance: "Desempenho dos Atendentes",
          error: "Erro ao gerar o relatório",
          startPeriod: "Período Início",
          endPeriod: "Período Fim",
          summary: "Resumo",
          attendants: "Atendentes"
        },
        notifications: {
          loadError: "Erro ao carregar dados do dashboard",
          pdfExport: "Relatório PDF exportado com sucesso!",
          excelExport: "Relatório Excel exportado com sucesso!"
        },
        tabs: {
          all: "Todos",
          support: "Atendimento",
          sales: "Comercial",
          general: "Geral",
          performance: "Performance"
        },
        departments: {
          support: "Atendimento",
          sales: "Comercial"
        },
        actions: {
          details: "Ver detalhes",
          changeView: "Alterar visualização"
        }
      },
      internalChat: {
        deletePrompt: "Esta ação não pode ser revertida, confirmar?",
      },

      messageRules: {
        title: "Identificadores de Mensagens",
        searchPlaceholder: "Buscar por nome, padrão ou descrição...",
        emptyState: {
          title: "Nenhum identificador encontrado",
          description: "Você ainda não possui identificadores de mensagens configurados. Adicione seu primeiro identificador para automatizar o roteamento de mensagens.",
          button: "Adicionar Identificador"
        },
        table: {
          name: "Nome",
          pattern: "Padrão",
          connection: "Conexão",
          queue: "Setor",
          user: "Atendente",
          tags: "Etiquetas",
          priority: "Prioridade",
          status: "Status",
          actions: "Ações"
        },
        tabs: {
          all: "Todos",
          active: "Ativos",
          inactive: "Inativos"
        },
        form: {
          name: "Nome do identificador",
          pattern: "Padrão de texto",
          patternHint: "Digite um texto que deve ser encontrado nas mensagens. Ex: 'pedido', 'suporte', 'orçamento'",
          isRegex: "Usar expressão regular",
          isRegexHint: "Habilite para usar expressões regulares (regex) para padrões mais complexos",
          description: "Descrição",
          connection: "Conexão",
          allConnections: "Todas as conexões",
          queue: "Setor destino",
          noQueue: "Selecione um setor",
          user: "Atendente destino",
          noUser: "Selecione um atendente",
          priority: "Prioridade",
          priorityHint: "Regras com maior prioridade são aplicadas primeiro (0-100)",
          tags: "Etiquetas a aplicar",
          selectTags: "Selecione etiquetas",
          active: "Ativo",
          errors: {
            requiredName: "O nome é obrigatório",
            requiredPattern: "O padrão de texto é obrigatório"
          }
        },
        buttons: {
          add: "Adicionar Identificador",
          edit: "Editar",
          delete: "Excluir",
          save: "Salvar",
          cancel: "Cancelar",
          activate: "Ativar",
          deactivate: "Desativar"
        },
        modal: {
          addTitle: "Adicionar Identificador de Mensagem",
          editTitle: "Editar Identificador de Mensagem",
        },
        confirmModal: {
          title: "Excluir Identificador",
          message: "Tem certeza que deseja excluir este identificador de mensagem? Esta ação não pode ser desfeita."
        },
        toasts: {
          created: "Identificador criado com sucesso!",
          updated: "Identificador atualizado com sucesso!",
          deleted: "Identificador excluído com sucesso!",
          activated: "Identificador ativado com sucesso!",
          deactivated: "Identificador desativado com sucesso!"
        },
        noRecords: "Nenhum identificador encontrado para os filtros selecionados.",
        active: "Ativo",
        inactive: "Inativo",
        allConnections: "Todas as conexões"
      },
      messageIdentifiers: {
        title: "Identificadores de Mensagens",
        description: "Configure regras para o processamento automático de mensagens",
        createRule: "Criar novo identificador",
        editRule: "Editar identificador",
        deleteRule: "Excluir identificador",
        selectConnection: "Selecione a conexão",
        selectTags: "Selecione as tags",
        selectQueue: "Selecione o setor",
        selectUser: "Selecione o usuário (opcional)",
        patternHelp: "O sistema verificará cada mensagem recebida para encontrar este padrão",
        regexHelp: "Use expressões regulares para padrões mais complexos",
        priorityHelp: "Regras com maior prioridade serão aplicadas primeiro"
      },
      messageHistoryModal: {
        close: "Fechar",
        title: "Histórico de edição da mensagem",
      },
      uploads: {
        titles: {
          titleFileUpload: "Enviar arquivos",
          titleFileList: "Lista de arquivos"
        },
        fields: {
          message: "Adicionar uma descrição"
        },
        buttons: {
          cancel: "Cancelar",
          send: "Enviar"
        }
      },
      whatsappModal: {
        title: {
          add: "Nova Conexão",
          edit: "Editar Conexão",
          editOfficial: "Editar Conexão WhatsApp Oficial",
          addOfficial: "Adicionar Conexão WhatsApp Oficial"
        },
        form: {
          name: "Nome",
          default: "Padrão",
          group: "Permitir Grupos",
          autoImport: "Importar contatos",
          autoReject: "Recusar ligações",
          availableQueues: "Setores",
          uploadMedia: "Upload de Mídia",
          clearMedia: "Limpar Mídia",
          token: "Token de Acesso",
          fileSize: "Tamanho máximo do arquivo: 5MB",
          showQrCodeAfterSave: "Exibir QRCode após salvar a conexão",
          importOldMessagesEnable: "Importar mensagens antigas",
          importOldMessagesGroups: "Importar mensagens de grupos",
          closedTicketsPostImported: "Fechar tickets após importação",
          importOldMessages: "Data inicial para importação",
          importRecentMessages: "Data final para importação",
          importAlert: "A importação pode demorar dependendo da quantidade de mensagens. Por favor, aguarde.",
          queueRedirection: "Redirecionamento de Setor",
          queueRedirectionDesc: "Selecione para qual setor os tickets serão redirecionados e após quanto tempo",
          sendIdQueue: "Setor de Redirecionamento",
          timeSendQueue: "Tempo para Redirecionamento (minutos)",
          integrationId: "ID da Integração",
          prompt: "Prompt de IA",
          disabled: "Desabilitado",
          greetingMessage: "Mensagem de Saudação",
          complationMessage: "Mensagem de Conclusão",
          outOfHoursMessage: "Mensagem Fora de Expediente",
          ratingMessage: "Mensagem de Avaliação",
          collectiveVacationMessage: "Mensagem de Férias Coletivas",
          collectiveVacationStart: "Início das Férias Coletivas",
          collectiveVacationEnd: "Fim das Férias Coletivas",
          timeCreateNewTicket: "Tempo para Criar Novo Ticket (minutos)",
          maxUseBotQueues: "Limite de Uso do Chatbot",
          timeUseBotQueues: "Intervalo de Uso do Chatbot (minutos)",
          expiresTicket: "Encerrar Tickets Após (horas)",
          whenExpiresTicket: "Quando Encerrar",
          closeLastMessageOptions1: "Última mensagem do cliente",
          closeLastMessageOptions2: "Última mensagem do atendente",
          expiresInactiveMessage: "Mensagem de Inatividade",
          timeInactiveMessage: "Tempo para Mensagem de Inatividade (minutos)",
          inactiveMessage: "Mensagem de Inativo",
          color: "Cor da Badge",
          connectionInfo: "Informações da Conexão",
          metaApiConfig: "Configuração da API Meta",
          officialWppBusinessId: "ID do WhatsApp Business",
          officialPhoneNumberId: "ID do Número de Telefone",
          officialAccessToken: "Token de Acesso",
          queuesAndIntegrations: "Filas e Integrações",
          messages: "Mensagens",
          settings: "Configurações"
        },
        buttons: {
          okAdd: "Salvar",
          okEdit: "Salvar",
          cancel: "Cancelar",
          refresh: "Atualizar Token",
          copy: "Copiar Token",
          upload: "Adicionar Imagem",
          help: "Ajuda"
        },
        tabs: {
          general: "Geral",
          integrations: "Integrações",
          messages: "Mensagens",
          chatbot: "Chatbot",
          assessments: "Avaliações",
          schedules: "Horários"
        },
        help: {
          title: "Ajuda - WhatsApp",
          description: "Configuração da conexão com WhatsApp",
          required: "Campos Obrigatórios",
          name: "Nome: Identificação única da conexão",
          queue: "Setor: Setor padrão para direcionamento dos tickets"
        },
        validation: {
          nameRequired: "Nome é obrigatório",
          nameMin: "Nome deve ter no mínimo 2 caracteres",
          nameMax: "Nome deve ter no máximo 50 caracteres",
          collectiveVacationStartRequired: "Data inicial das férias é obrigatória",
          collectiveVacationEndRequired: "Data final das férias é obrigatória",
          collectiveVacationEndAfterStart: "Data final deve ser posterior à data inicial",
          timeCreateNewTicketMin: "Tempo deve ser maior ou igual a 0",
          maxUseBotQueuesMin: "Limite deve ser maior ou igual a 0",
          expiresTicketMin: "Tempo deve ser maior ou igual a 0",
          tokenRequired: "Token de acesso é obrigatório",
          businessIdRequired: "ID do WhatsApp Business é obrigatório",
          phoneNumberIdRequired: "ID do Número de Telefone é obrigatório"
        },
        success: {
          saved: "WhatsApp salvo com sucesso!",
          update: "WhatsApp atualizado com sucesso!"
        },
        tokenRefreshed: "Token atualizado com sucesso!",
        tokenCopied: "Token copiado para a área de transferência!",
        scheduleSaved: "Horários salvos com sucesso!",
        errors: {
          fetchData: "Erro ao carregar dados",
          fetchWhatsApp: "Erro ao carregar dados do WhatsApp",
          saveWhatsApp: "Erro ao salvar WhatsApp",
          fileSize: "Arquivo muito grande. Máximo permitido: 5MB",
          requiredFields: "Preencha todos os campos obrigatórios"
        }
      },
      profile: {
        title: "Perfil",
        roles: {
          admin: "Administrador",
          user: "Usuário",
          superv: "Supervisor",
        },
        buttons: {
          edit: "Editar Perfil",
        },
        stats: {
          openTickets: "Tickets Abertos",
          closedToday: "Fechados Hoje",
          averageResponseTime: "Tempo Médio de Resposta",
          rating: "Avaliação",
        },
        fields: {
          name: "Nome",
          email: "Email",
          workHours: "Horário de Trabalho",
        },
      },

      queueIntegrationModal: {
        title: {
          add: "Adicionar projeto",
          edit: "Editar projeto",
        },
        form: {
          id: "ID",
          type: "Tipo",
          name: "Nome",
          projectName: "Nome do Projeto",
          language: "Linguagem",
          jsonContent: "JsonContent",
          urlN8N: "URL",
          n8nApiKey: "Chave de API do n8n",
          OpenApiKey: "Chave de API da OpenAI",
          typebotSlug: "Typebot - Slug",
          selectFlow: "Nome do Fluxo",
          typebotExpires: "Tempo em minutos para expirar uma conversa",
          typebotKeywordFinish: "Palavra para finalizar o ticket",
          typebotKeywordRestart: "Palavra para reiniciar o fluxo",
          typebotRestartMessage: "Mensagem ao reiniciar a conversa",
          typebotUnknownMessage: "Mensagem de opção inválida",
          typebotDelayMessage: "Intervalo (ms) entre mensagens",
        },
        buttons: {
          okAdd: "Salvar",
          okEdit: "Salvar",
          cancel: "Cancelar",
          test: "Testar Bot",
        },
        messages: {
          testSuccess: "Integração testada com sucesso!",
          addSuccess: "Integração adicionada com sucesso.",
          editSuccess: "Integração editada com sucesso.",
        },
      },
      promptModal: {
        form: {
          name: "Nome",
          prompt: "Prompt",
          voice: "Voz",
          max_tokens: "Máximo de Tokens na resposta",
          temperature: "Temperatura",
          apikey: "API Key",
          max_messages: "Máximo de mensagens no Histórico",
          voiceKey: "Chave da API de Voz",
          voiceRegion: "Região de Voz",
        },
        success: "Prompt salvo com sucesso!",
        title: {
          add: "Adicionar Prompt",
          edit: "Editar Prompt",
        },
        buttons: {
          okAdd: "Salvar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
      },
      prompts: {
        title: "Prompts",
        noDataFound: "Ops, nada por aqui!",
        noDataFoundMessage: "Nenhuma prompt foi encontrada. Não se preocupe, você pode criar o primeiro! Clique no botão abaixo para começar.",
        table: {
          name: "Nome",
          queue: "Setor",
          max_tokens: "Máximo Tokens Resposta",
          actions: "Ações",
        },
        empty: {
          title: "Ops, nada por aqui!",
          message: "Nenhuma prompt foi encontrada. Não se preocupe, você pode criar o primeiro! Clique no botão abaixo para começar."
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage: "Você tem certeza? Essa ação não pode ser revertida!",
        },
        buttons: {
          add: "Criar Prompt",
        },
      },
      contactsImport: {
        notifications: {
          started: "Importação iniciada! Você será notificado sobre o progresso.",
          error: "Erro ao iniciar importação. Tente novamente.",
          noFile: "Selecione um arquivo CSV para importar",
          progress: "Importação em andamento: {percentage}% concluído",
          complete: "Importação concluída! {validCount} contatos importados com sucesso. {invalidCount} contatos inválidos.",
          importError: "Erro na importação: {message}"
        },
        instructions: {
          title: "Para realizar a importação de contatos, é necessário que você siga as orientações abaixo:",
          csvFormat: "O arquivo a ser importado deve estar no formato .CSV.",
          numberFormat: "Os números de WhatsApp devem ser inseridos sem espaços e separados por ponto e vírgula (;).",
          exampleTitle: "Exemplo de como deve ser preenchido a planilha."
        }
      },
      contacts: {
        title: "Gerenciamento de Contatos",
        subtitle: "de",
        searchPlaceholder: "Buscar contatos...",
        emptyMessage: "Nenhum contato encontrado",
        noContactsFound: "Nenhum contato encontrado",
        noContactsFoundMessage: "Nenhum contato cadastrado ainda.",
        addContactMessage: "Adicione um novo contato para começar!",
        import: {
          title: "Importar Contatos",
          steps: {
            selectFile: "Selecionar Arquivo",
            mapFields: "Mapear Campos",
            review: "Revisar",
            result: "Resultado"
          },
          mapFields: "Mapeamento de campos",
          selectFilePrompt: "Selecione um arquivo CSV ou Excel para importar contatos",
          dragAndDrop: "Arraste e solte seu arquivo aqui",
          or: "ou",
          browse: "Procurar",
          supportedFormats: "Formatos suportados: CSV, XLS, XLSX",
          needTemplate: "Precisa de um modelo?",
          downloadTemplate: "Baixar modelo",
          processingFile: "Processando arquivo...",
          mapFieldsInfo: "Selecione quais colunas do seu arquivo correspondem a cada campo de contato. Campos marcados com * são obrigatórios.",
          fullContact: "Importar dados completos (incluir campos adicionais)",
          selectField: "Selecione um campo",
          extraFields: "Campos adicionais",
          extraFieldsInfo: "Mapeie campos adicionais que serão importados como informações extras do contato.",
          noExtraFields: "Nenhum campo adicional mapeado.",
          addExtraField: "Adicionar campo extra",
          extraFieldName: "Nome do campo extra",
          value: "Valor",
          validationErrors: "Foram encontrados {{count}} erros de validação",
          errorDetails: "{{count}} registros com problemas",
          rowError: "Linha {{row}}: {{error}}",
          moreErrors: "...e mais {{count}} erros",
          validation: {
            nameRequired: "O campo Nome é obrigatório",
            numberRequired: "O campo Número é obrigatório",
            emptyName: "Nome em branco",
            emptyNumber: "Número em branco",
            invalidNumberFormat: "Formato de número inválido",
            invalidEmail: "Email inválido",
            companyNotFound: "Empresa \"{{company}}\" não encontrada, será criada automaticamente",
            positionNotFound: "Cargo \"{{position}}\" não encontrado, será criado automaticamente",
            dataErrors: "{{count}} registros contêm erros"
          },
          reviewAndImport: "Revisar e importar",
          reviewInfo: "Verifique se os dados estão corretos antes de iniciar a importação.",
          summary: "Resumo",
          totalRecords: "Total de registros",
          validRecords: "Registros válidos",
          invalidRecords: "Registros com avisos",
          importMode: "Modo de importação",
          fullContactMode: "Cadastro completo",
          basicContactMode: "Cadastro básico",
          mappedFields: "Campos mapeados",
          notMapped: "Não mapeado",
          extraField: "Campo extra",
          previewData: "Visualização dos dados",
          showingFirst: "Mostrando os primeiros {{count}} de {{total}} registros",
          importingContacts: "Importando contatos...",
          pleaseWait: "Por favor, aguarde. Isso pode levar alguns minutos.",
          importComplete: "Importação concluída",
          importFailed: "Falha na importação",
          totalProcessed: "Total processado",
          successful: "Sucesso",
          failed: "Falhas",
          errors: "Erros",
          successMessage: "{{count}} contatos foram importados com sucesso.",
          failureMessage: "Nenhum contato foi importado. Verifique os erros e tente novamente.",
          importAnother: "Importar mais contatos",
          import: "Importar",
          errors: {
            invalidFileType: "Tipo de arquivo inválido",
            emptyFile: "Arquivo vazio",
            parsingFailed: "Falha ao processar arquivo",
            readFailed: "Falha ao ler arquivo",
            processingFailed: "Falha ao processar arquivo",
            fetchEmployersFailed: "Erro ao buscar empregadores",
            fetchPositionsFailed: "Erro ao buscar posições",
            validationFailed: "Validação falhou. Corrija os erros antes de continuar.",
            importFailed: "Falha na importação",
            generalError: "Erro geral na importação",
            timeout: "Tempo de importação excedido",
            statusCheckFailed: "Falha ao verificar status da importação",
            templateGenerationFailed: "Falha ao gerar modelo"
          }
        },
        table: {
          id: "ID",
          name: "Nome",
          number: "Número",
          email: "Email",
          company: "Empresa",
          tags: "Tags",
          bot: "Bot",
          actions: "Ações",
          whatsapp: "WhatsApp",
          groupId: "ID do Grupo",
          botEnabled: "Bot Ativado",
          botDisabled: "Bot Desativado",
          disableBot: "Status do Bot",
          noTags: "Sem tags"
        },
        buttons: {
          add: "Adicionar Contato",
          addContact: "Adicionar Contato",
          edit: "Editar Contato",
          delete: "Excluir Contato",
          deleteAll: "Excluir Todos",
          addOrDelete: "Gerenciar",
          import: "Importar",
          export: "Exportar",
          importExport: "Importar/Exportar",
          startChat: "Iniciar conversa",
          block: "Bloquear contato",
          unblock: "Desbloquear contato",
          manage: "Opções"
        },
        bulkActions: {
          selectedContacts: "{{count}} contatos selecionados",
          actions: "Ações em massa",
          enableBot: "Ativar Bot",
          disableBot: "Desativar Bot",
          block: "Bloquear",
          unblock: "Desbloquear",
          delete: "Excluir"
        },
        confirmationModal: {
          deleteTitleNoHasContactCreated: "Nenhum contato cadastrado",
          deleteTitleNoHasContactCreatedMessage: "Você ainda não tem contatos cadastrados. Clique em 'Adicionar' para criar um novo contato.",
          deleteTitle: "Excluir contato",
          deleteMessage: "Esta ação é irreversível. Tem certeza que deseja excluir este contato?",
          deleteAllTitle: "Excluir todos os contatos",
          deleteAllMessage: "Esta ação é irreversível. Tem certeza que deseja excluir todos os contatos?",
          blockTitle: "Bloquear contato",
          blockMessage: "Ao bloquear este contato, você não poderá mais enviar ou receber mensagens dele.",
          unblockTitle: "Desbloquear contato",
          unblockMessage: "Ao desbloquear este contato, você voltará a receber mensagens dele.",
          bulkEnableBotTitle: "Ativar Bot para contatos selecionados",
          bulkEnableBotMessage: "Tem certeza que deseja ativar o bot para todos os contatos selecionados?",
          bulkDisableBotTitle: "Desativar Bot para contatos selecionados",
          bulkDisableBotMessage: "Tem certeza que deseja desativar o bot para todos os contatos selecionados?",
          bulkBlockTitle: "Bloquear contatos selecionados",
          bulkBlockMessage: "Tem certeza que deseja bloquear todos os contatos selecionados? Você não poderá mais enviar ou receber mensagens deles.",
          bulkUnblockTitle: "Desbloquear contatos selecionados",
          bulkUnblockMessage: "Tem certeza que deseja desbloquear todos os contatos selecionados? Você voltará a receber mensagens deles.",
          bulkDeleteTitle: "Excluir contatos selecionados",
          bulkDeleteMessage: "Esta ação é irreversível. Tem certeza que deseja excluir todos os contatos selecionados?",
          genericTitle: "Confirmar ação",
          genericMessage: "Tem certeza que deseja executar esta ação?"
        },
        toasts: {
          deleted: "Contato excluído com sucesso!",
          deletedAll: "Todos os contatos foram excluídos com sucesso!",
          blocked: "Contato bloqueado com sucesso!",
          unblocked: "Contato desbloqueado com sucesso!",
          bulkBotEnabled: "Bot ativado para os contatos selecionados!",
          bulkBotDisabled: "Bot desativado para os contatos selecionados!",
          bulkBlocked: "Contatos selecionados foram bloqueados!",
          bulkUnblocked: "Contatos selecionados foram desbloqueados!",
          bulkDeleted: "Contatos selecionados foram excluídos!",
          noContactsSelected: "Nenhum contato selecionado",
          unknownAction: "Ação desconhecida",
          bulkActionError: "Erro ao executar ação em massa"
        },
        form: {
          name: "Nome",
          number: "Número",
          email: "E-Mail",
          company: "Empresa",
          position: "Cargo"
        },
        filters: {
          byTag: "Filtrar por tag",
          selectTags: "Selecione as tags a serem filtradas",
          noTagsAvailable: "Nenhuma tag disponível"
        }
      },
      contactModal: {
        title: {
          new: "Novo Contato",
          edit: "Editar Contato"
        },
        helpText: "Preencha os dados do contato. Número de telefone deve estar no formato: DDI DDD NÚMERO (Ex: 55 16 996509803)",
        sections: {
          basic: "Informações Básicas",
          tags: "Tags",
          organization: "Informações Organizacionais",
          additional: "Informações Adicionais"
        },
        form: {
          name: "Nome",
          number: "Número",
          email: "Email",
          numberFormat: "Formato: DDI DDD NÚMERO (Ex: 55 16 996509803)",
          numberTooltip: "Use o formato: DDI DDD NÚMERO (Ex: 55 16 996509803)",
          company: "Empresa",
          position: "Cargo",
          selectCompanyFirst: "Selecione uma empresa primeiro",
          positionHelp: "Digite para criar um novo cargo ou selecione um existente",
          disableBot: "Desativar Bot",
          extraName: "Nome do Campo",
          extraValue: "Valor do Campo",
          noExtraInfo: "Sem informações adicionais. Clique no botão abaixo para adicionar."
        },
        buttons: {
          cancel: "Cancelar",
          save: "Salvar",
          update: "Atualizar",
          remove: "Remover",
          addExtraInfo: "Adicionar Campo",
          okEdit: "Editar",
          okAdd: "Adicionar"
        },
        tags: {
          saveFirst: "As tags poderão ser adicionadas após salvar o contato."
        },
        success: {
          created: "Contato criado com sucesso!",
          updated: "Contato atualizado com sucesso!",
          profilePic: "Foto de perfil atualizada com sucesso!"
        },
        warnings: {
          tagsSyncFailed: "Contato salvo, mas houve um erro ao adicionar as tags"
        },
        errors: {
          loadData: "Erro ao carregar dados necessários",
          loadCompanies: "Erro ao carregar empresas",
          saveGeneric: "Erro ao salvar contato. Verifique os dados e tente novamente."
        }
      },
      contactTagsManager: {
        selectTags: "Selecione as tags",
        noTags: "Nenhuma tag atribuída a este contato",
        success: {
          updated: "Tags atualizadas com sucesso!"
        },
        errors: {
          loadTags: "Erro ao carregar tags",
          loadContactTags: "Erro ao carregar tags do contato",
          updateTags: "Erro ao atualizar tags"
        }
      },
      newPositionModal: {
        title: "Novo Cargo",
        form: {
          name: "Nome"
        },
        buttons: {
          cancel: "Cancelar",
          save: "Salvar"
        },
        validation: {
          required: "O campo Nome é obrigatório."
        },
        success: "Cargo criado com sucesso!",
        error: "Erro ao criar crgo. Tente novamente mais tarde."
      },
      employerManagement: {
        title: "Gerenciamento de Empresas",
        tabs: {
          employers: "Empresas",
          report: "Relatório"
        },
        search: "Buscar empresas...",
        buttons: {
          import: "Importar Empresas",
          add: "Adicionar Empresa",
          edit: "Editar",
          delete: "Excluir",
          confirm: "Confirmar",
          cancel: "Cancelar",
          refresh: "Atualizar",
          view: "Visualizar"
        },
        table: {
          name: "Nome",
          positions: "Cargos",
          createdAt: "Criada em",
          status: "Status",
          actions: "Ações",
          positionsLabel: "cargos"
        },
        status: {
          active: "Ativo",
          inactive: "Inativo"
        },
        statistics: {
          total: "Total de Empresas",
          active: "Empresas Ativas",
          recent: "Adicionadas Recentemente"
        },
        emptyState: {
          title: "Nenhuma empresa cadastrada",
          message: "Cadastre sua primeira empresa para começar a gerenciar seus funcionários"
        },
        deleteConfirm: {
          title: "Confirmar Exclusão",
          message: "Tem certeza que deseja excluir esta empresa?"
        },
        viewDetails: {
          title: "Detalhes da Empresa",
          name: "Nome",
          createdAt: "Criada em",
          customFields: "Campos Personalizados",
          noCustomFields: "Esta empresa não possui campos personalizados."
        },
        success: {
          delete: "Empresa excluída com sucesso",
          import: "{{count}} empresas importadas com sucesso"
        },
        info: {
          duplicates: "{{count}} empresas já existiam no sistema"
        },
        warnings: {
          importErrors: "Alguns registros não puderam ser importados. Verifique o console."
        },
        errors: {
          fetchEmployers: "Erro ao carregar empresas",
          fetchDetails: "Erro ao carregar detalhes da empresa",
          delete: "Erro ao excluir empresa",
          invalidFileFormat: "Formato de arquivo não suportado. Use CSV ou XLS/XLSX",
          import: "Erro ao importar arquivo",
          noData: "Erro ao carregar dados"
        }
      },
      newapi: {
        title: "API Playground",
        helpButton: "Ajuda",
        helpTooltip: "Ver documentação detalhada da API",
        selectRoute: "Selecione a rota:",
        selectLanguage: "Linguagem:",
        replaceToken: "Substitua (SEU_TOKEN_AQUI) pelo seu token de autenticação.",
        method: "Método",
        endpoint: "Endpoint",
        pathParamsInfo: "* Os parâmetros de caminho indicados entre chaves {param} serão substituídos pelos valores correspondentes.",
        steps: {
          selectRoute: "Selecionar Rota",
          generateCode: "Gerar Código",
          testApi: "Testar API"
        },
        tabs: {
          select: "Selecionar",
          generate: "Gerar Código",
          test: "Testar API"
        },
        languages: {
          javascript: "JavaScript",
          python: "Python",
          php: "PHP"
        },
        buttons: {
          send: "Enviar",
          delete: "Excluir",
          close: "Fechar"
        },
        success: {
          requestSuccessful: "Requisição realizada com sucesso!"
        },
        errors: {
          requestError: "Erro na requisição:",
          processingError: "Erro ao processar a requisição",
          serverError: "Erro",
          noResponse: "Não foi possível conectar ao servidor. Verifique sua conexão.",
          unknownServerError: "Erro desconhecido do servidor"
        },
        warnings: {
          noToken: "Não foi detectado nenhum token de autenticação. É necessário ter um WhatsApp conectado ou fornecer um token manualmente."
        },
        formValidation: {
          required: "O campo {field} é obrigatório",
          invalidEmail: "Email inválido",
          mustBeNumber: "Deve ser um número",
          onlyNumbers: "Formato inválido. Apenas números são permitidos."
        },
        codeBlock: {
          copied: "Código copiado para a área de transferência!",
          copyToClipboard: "Copiar para a área de transferência"
        },
        help: {
          title: "Documentação da API AutoAtende",
          introduction: "A API do AutoAtende permite que você integre recursos de mensagens, tickets, contatos e outras funcionalidades em suas aplicações. Todas as requisições requerem autenticação via token no header Authorization.",
          authTitle: "Autenticação",
          authDescription: "Todas as requisições à API devem incluir um token de autenticação no header Authorization, no formato Bearer token. Você pode obter o token nas configurações do WhatsApp no painel do AutoAtende.",
          authExample: "Exemplo de como incluir o token no header:",
          closeButton: "Fechar",
          parametersTitle: "Parâmetros",
          responsesTitle: "Respostas",
          exampleTitle: "Exemplo",
          required: "obrigatório",
          noParameters: "Esta rota não requer parâmetros adicionais.",
          noResponsesSpecified: "Não há detalhes específicos sobre as respostas desta rota.",
          categories: {
            messages: "Mensagens",
            tickets: "Tickets",
            contacts: "Contatos",
            companies: "Empresas",
            invoices: "Faturas",
            dashboard: "Dashboard"
          },
          messagesDescription: "Endpoints para envio de mensagens, arquivos e verificação de números no WhatsApp.",
          ticketsDescription: "Endpoints para gerenciamento de tickets (criação, atualização, fechamento e listagem).",
          contactsDescription: "Endpoints para gerenciamento de contatos (criação, atualização, exclusão e listagem).",
          companiesDescription: "Endpoints para gerenciamento de empresas (criação, atualização e bloqueio).",
          invoicesDescription: "Endpoints para consulta de faturas.",
          dashboardDescription: "Endpoints para obtenção de dados estatísticos e métricas do sistema.",
          endpoints: {
            sendMessage: {
              description: "Envia uma mensagem de texto para um número de WhatsApp. Pode incluir arquivos de mídia.",
              params: {
                number: "Número do destinatário (incluindo o código do país e DDD, sem caracteres especiais)",
                body: "Conteúdo da mensagem",
                medias: "Arquivos de mídia para enviar (opcional)",
                queueId: "ID da fila para associar o ticket",
                status: "Status desejado para o ticket após envio (open, pending ou closed)"
              },
              responses: {
                200: "Mensagem enviada com sucesso",
                401: "Não autorizado - Token inválido ou ausente",
                500: "Erro do servidor"
              },
              exampleTitle: "Exemplo de envio de mensagem com arquivo:",
              exampleComment: "Para enviar um arquivo, descomente as linhas abaixo:"
            },
            sendPdfLink: {
              description: "Envia uma mensagem com um link para um arquivo PDF.",
              params: {
                number: "Número do destinatário (incluindo o código do país e DDD, sem caracteres especiais)",
                url: "URL do PDF a ser enviado",
                caption: "Legenda para enviar junto com o link"
              },
              responses: {
                200: "Link para PDF enviado com sucesso",
                401: "Não autorizado - Token inválido ou ausente",
                500: "Erro do servidor"
              },
              exampleTitle: "Exemplo de envio de link para PDF:"
            },
            sendImageLink: {
              description: "Envia uma mensagem com um link para uma imagem.",
              params: {
                number: "Número do destinatário (incluindo o código do país e DDD, sem caracteres especiais)",
                url: "URL da imagem a ser enviada",
                caption: "Legenda para enviar junto com a imagem"
              },
              responses: {
                200: "Link para imagem enviado com sucesso",
                401: "Não autorizado - Token inválido ou ausente",
                500: "Erro do servidor"
              }
            },
            checkNumber: {
              description: "Verifica se um número é válido e está registrado no WhatsApp.",
              params: {
                number: "Número a ser verificado (incluindo o código do país e DDD, sem caracteres especiais)"
              },
              responses: {
                200: "Número verificado com sucesso",
                400: "Número inválido ou não encontrado no WhatsApp",
                401: "Não autorizado - Token inválido ou ausente"
              }
            },
            internalMessage: {
              description: "Cria uma mensagem interna em um ticket existente sem enviar ao WhatsApp.",
              params: {
                ticketId: "ID do ticket onde a mensagem será adicionada",
                body: "Conteúdo da mensagem interna",
                medias: "Arquivos de mídia para anexar (opcional)"
              },
              responses: {
                200: "Mensagem interna criada com sucesso",
                401: "Não autorizado - Token inválido ou ausente",
                500: "Erro do servidor"
              }
            },
            createTicket: {
              description: "Cria um novo ticket associado a um contato.",
              params: {
                contactId: "ID do contato para associar ao ticket",
                status: "Status inicial do ticket (open, pending, closed)",
                userId: "ID do usuário responsável pelo ticket (opcional)",
                queueId: "ID da fila para associar ao ticket (opcional)",
                whatsappId: "ID do WhatsApp a ser usado (opcional)"
              },
              responses: {
                201: "Ticket criado com sucesso",
                401: "Não autorizado - Token inválido ou ausente",
                500: "Erro do servidor"
              }
            },
            closeTicket: {
              description: "Altera o status de um ticket para 'fechado'.",
              params: {
                ticketId: "ID do ticket a ser fechado"
              },
              responses: {
                200: "Ticket fechado com sucesso",
                401: "Não autorizado - Token inválido ou ausente",
                500: "Erro do servidor"
              }
            },
            updateQueueTicket: {
              description: "Atualiza a fila associada a um ticket específico.",
              params: {
                ticketId: "ID do ticket a ser atualizado",
                queueId: "ID da nova fila para o ticket"
              },
              responses: {
                200: "Fila do ticket atualizada com sucesso",
                400: "Fila inválida ou não pertence à empresa",
                401: "Não autorizado - Token inválido ou ausente"
              }
            },
            addTagToTicket: {
              description: "Associa uma tag específica a um ticket.",
              params: {
                ticketId: "ID do ticket a ser atualizado",
                tagId: "ID da TAG a ser adicionada ao ticket"
              },
              responses: {
                200: "TAG adicionada ao ticket com sucesso",
                400: "Tag inválida ou já associada ao ticket",
                401: "Não autorizado - Token inválido ou ausente"
              }
            },
            removeTagFromTicket: {
              description: "Remove a associação entre uma tag e um ticket.",
              params: {
                ticketId: "ID do ticket do qual a tag será removida",
                tagId: "ID da tag a ser removida"
              },
              responses: {
                200: "Tag removida do ticket com sucesso",
                400: "Tag não está associada ao ticket",
                401: "Não autorizado - Token inválido ou ausente"
              }
            },
            listTickets: {
              description: "Retorna a lista de tickets associados à empresa do token.",
              params: {
                companyId: "ID da empresa (opcional, será obtido do token se não informado)"
              },
              responses: {
                200: "Tickets listados com sucesso",
                401: "Não autorizado - Token inválido ou ausente"
              }
            },
            listTicketsByTag: {
              description: "Retorna os tickets que possuem uma determinada tag.",
              params: {
                tagId: "ID da tag para filtrar os tickets"
              },
              responses: {
                200: "Tickets listados com sucesso",
                400: "Tag inválida ou não pertence à empresa",
                401: "Não autorizado - Token inválido ou ausente"
              }
            },
            createPBXTicket: {
              description: "Cria um ticket interno com base em informações de uma chamada telefônica.",
              params: {
                phoneNumber: "Número de telefone do contato",
                contactName: "Nome do contato (usado se o contato não existir)",
                status: "Status inicial do ticket (open, pending, closed)",
                ramal: "Número do ramal que atendeu/originou a chamada",
                idFilaPBX: "ID da fila no sistema PBX",
                message: "Mensagem interna para adicionar ao ticket",
                medias: "Arquivos de mídia para adicionar ao ticket"
              },
              responses: {
                201: "Ticket PBX criado com sucesso",
                400: "Parâmetros inválidos ou faltando",
                401: "Não autorizado - Token inválido ou ausente"
              }
            },
            getTicketHistory: {
              description: "Retorna os tickets com suas mensagens dentro de um intervalo de datas.",
              params: {
                startDate: "Data inicial (YYYY-MM-DD)",
                endDate: "Data final (YYYY-MM-DD)",
                contactNumber: "Número do contato para filtrar (opcional)"
              },
              responses: {
                200: "Histórico de tickets obtido com sucesso",
                400: "Parâmetros inválidos",
                401: "Não autorizado - Token inválido ou ausente"
              }
            },
            listContacts: {
              description: "Retorna a lista de contatos associados à empresa do token.",
              params: {
                companyId: "ID da empresa (opcional, será obtido do token se não informado)"
              },
              responses: {
                200: "Contatos listados com sucesso",
                401: "Não autorizado - Token inválido ou ausente"
              }
            },
            searchContacts: {
              description: "Retorna uma lista paginada de contatos com opção de filtro por termo de pesquisa.",
              params: {
                searchParam: "Termo para pesquisa no nome ou número do contato",
                pageNumber: "Número da página para paginação",
                companyId: "ID da empresa (opcional, será obtido do token se não informado)"
              },
              responses: {
                200: "Contatos listados com sucesso",
                401: "Não autorizado - Token inválido ou ausente",
                500: "Erro do servidor"
              }
            },
            createCompany: {
              description: "Cria uma nova empresa com os dados fornecidos.",
              params: {
                name: "Nome da empresa",
                email: "Email principal da empresa",
                phone: "Telefone de contato da empresa",
                status: "Status ativo/inativo da empresa"
              },
              responses: {
                200: "Empresa criada com sucesso",
                400: "Erro de validação",
                401: "Não autorizado - Token inválido ou ausente"
              }
            },
            updateCompany: {
              description: "Atualiza os dados de uma empresa existente.",
              params: {
                id: "ID da empresa a ser atualizada",
                name: "Nome da empresa",
                email: "Email principal da empresa",
                phone: "Telefone de contato da empresa",
                status: "Status ativo/inativo da empresa"
              },
              responses: {
                200: "Empresa atualizada com sucesso",
                400: "Erro de validação",
                401: "Não autorizado - Token inválido ou ausente",
                404: "Empresa não encontrada"
              }
            },
            blockCompany: {
              description: "Define o status de uma empresa como inativo (bloqueado).",
              params: {
                companyId: "ID da empresa a ser bloqueada"
              },
              responses: {
                200: "Empresa bloqueada com sucesso",
                401: "Não autorizado - Token inválido ou ausente",
                404: "Empresa não encontrada"
              }
            },
            listInvoices: {
              description: "Retorna a lista de faturas associadas à empresa do token.",
              params: {
                companyId: "ID da empresa (opcional, será obtido do token se não informado)"
              },
              responses: {
                200: "Faturas listadas com sucesso",
                401: "Não autorizado - Token inválido ou ausente"
              }
            },
            getInvoice: {
              description: "Retorna os detalhes de uma fatura específica.",
              params: {
                Invoiceid: "ID da fatura a ser exibida"
              },
              responses: {
                200: "Detalhes da fatura obtidos com sucesso",
                401: "Não autorizado - Token inválido ou ausente"
              }
            },
            getDashboardOverview: {
              description: "Retorna métricas e dados estatísticos para o dashboard.",
              params: {
                period: "Período para análise ('day', 'week' ou 'month')",
                date: "Data de referência (YYYY-MM-DD)",
                userId: "ID do usuário para filtrar (opcional)",
                queueId: "ID da fila para filtrar (opcional)"
              },
              responses: {
                200: "Dados do dashboard obtidos com sucesso",
                400: "Erro de validação",
                401: "Não autorizado - Token inválido ou ausente",
                500: "Erro interno do servidor"
              },
              exampleTitle: "Exemplo de obtenção de dados do dashboard:"
            }
          }
        }
      },
      employerModal: {
        title: {
          add: "Adicionar Empresa",
          edit: "Editar Empresa"
        },
        form: {
          name: "Nome da Empresa",
          customFields: "Campos Personalizados",
          customField: {
            name: "Nome do Campo",
            value: "Valor"
          },
          noCustomFields: "Nenhum campo personalizado adicionado"
        },
        buttons: {
          addField: "Adicionar Campo",
          removeField: "Remover Campo"
        },
        success: {
          create: "Empresa criada com sucesso",
          update: "Empresa atualizada com sucesso"
        },
        errors: {
          fetchDetails: "Erro ao carregar detalhes da empresa",
          generic: "Erro ao salvar empresa"
        }
      },
      queueModal: {
        title: {
          add: "Adicionar setor",
          edit: "Editar setor",
          delete: "Deletar setor",
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage:
            "Você tem certeza? Essa ação não pode ser revertida! e será removida dos setores e conexões vinculadas",
        },
        serviceHours: {
          sunday: "domingo",
          monday: "segunda-feira",
          tuesday: "terça-feira",
          wednesday: "quarta-feira",
          thursday: "quinta-feira",
          friday: "sexta-feira",
          saturday: "sábado"
        },
        form: {
          name: "Nome",
          newTicketOnTransfer: "Criar novo ticket ao transferir",
          color: "Cor",
          keywords: "Palavras-chave para transferência",
          greetingMessage: "Mensagem de saudação",
          complationMessage: "Mensagem de conclusão",
          outOfHoursMessage: "Mensagem de fora de expediente",
          ratingMessage: "Mensagem de avaliação",
          token: "Token",
          orderQueue: "Ordem do Setor (Bot)",
          integrationId: "Integração",
          closeTicket: "Fechar ticket",
          tags: "Tags (Kanban)",
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
          attach: "Anexar Arquivo",
        },
        toasts: {
          deleted: "Setor excluido com sucesso.",
          inserted: "Setor criado com sucesso.",
          tagsError: "Erro ao buscar tags",
        },
        tabs: {
          queue: "Setor",
          schedules: "Horários",
        },
      },
      userModal: {
        title: {
          add: "Adicionar Usuário",
          edit: "Editar Usuário"
        },
        tabs: {
          info: "Informações",
          permission: "Permissões",
          notifications: "Notificações"
        },
        form: {
          name: "Nome",
          email: "E-mail",
          password: "Senha",
          profileT: "Perfil",
          profile: {
            admin: "Administrador",
            user: "Usuário",
            superv: "Supervisor"
          },
          profileHelp: "Define o nível de acesso do usuário no sistema",
          ramal: "Ramal",
          startWork: "Início do Expediente",
          endWork: "Fim do Expediente",
          workHoursHelp: "Define o horário de trabalho do usuário",
          super: "Super Usuário",
          superHelp: "Permite acesso total ao sistema",
          allTicket: "Ver Todos os Tickets",
          allTicketHelp: "Permite visualizar todos os tickets, incluindo os sem setor",
          spy: "Espiar Conversas",
          spyHelp: "Permite espiar conversas em andamento",
          isTricked: "Ver Lista de Contatos",
          isTrickedHelp: "Permite visualizar a lista de contatos",
          defaultMenu: "Menu Padrão",
          defaultMenuHelp: "Define o estado inicial do menu lateral",
          defaultMenuOpen: "Aberto",
          defaultMenuClosed: "Fechado",
          color: "Cor do Usuário",
          colorHelp: "Cor de identificação do usuário no sistema",
          whatsapp: "Conexão Padrão",
          whatsappHelp: "Conexão padrão que o usuário atenderá",
          whatsappNone: "Nenhum",
          number: "Número do WhatsApp",
          numberHelp: "Número que receberá as notificações (com DDD)",
          notificationSettings: "Configurações de Notificação via WhatsApp",
          notificationTypes: "Tipos de Notificação",
          notifyNewTicket: "Notificação de Novo Atendimento",
          notifyNewTicketHelp: "Envia notificação no WhatsApp quando houver um novo atendimento nas filas deste usuário",
          notifyTask: "Notificação de Tarefas",
          notifyTaskHelp: "Envia notificação no WhatsApp sobre novas tarefas ou tarefas vencidas atribuídas a este usuário",
          onlyAdminSupervHelp: "Somente administradores e supervisores podem editar as configurações de notificação.",
          profilePicHelp: "Clique na imagem para alterar",
          canRestartConnections: "Reiniciar Conexões",
          canRestartConnectionsHelp: "Permite ao usuário reiniciar conexões WhatsApp"
        },
        buttons: {
          cancel: "Cancelar",
          okAdd: "Adicionar",
          okEdit: "Salvar"
        },
        success: "Usuário salvo com sucesso!",
        errors: {
          load: "Erro ao carregar usuário",
          save: "Erro ao salvar usuário"
        }
      },
      scheduleModal: {
        title: {
          add: "Novo Agendamento",
          edit: "Editar Agendamento",
        },
        form: {
          body: "Mensagem",
          contact: "Contato",
          sendAt: "Data de Agendamento",
          sentAt: "Data de Envio",
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        success: "Agendamento salvo com sucesso.",
      },
      chat: {
        noTicketMessage: "Selecione um ticket para começar a conversar.",
      },
      uploads: {
        titles: {
          titleUploadMsgDragDrop: "ARRASTE E SOLTE ARQUIVOS NO CAMPO ABAIXO",
          titleFileList: "Lista de arquivo(s)",
        },
      },
      ticketsManager: {
        buttons: {
          newTicket: "Novo ticket",
          newGroup: "Novo Grupo",
          closeAll: "Fechar todos"
        },
      },
      ticketsQueueSelect: {
        placeholder: "Setores",
        selectedCount: "{{count}} selecionados",
      },
      tickets: {
        inbox: {
          closeAll: "Fechar todos os tickets",
          confirmCloseTitle: "Fechar tickets",
          confirmCloseConnectionMessage: "Deseja fechar todos os tickets da conexão {{connection}}?",
          confirmCloseAllMessage: "Deseja fechar todos os tickets de todas as conexões?",
          confirm: "Confirmar",
          cancel: "Cancelar",
          yes: "Sim",
          no: "Não",
          close: "Fechar",
          closedAllTickets: "Deseja fechar todos os tickets?",
          newTicket: "Novo Ticket",
          yes: "SIM",
          no: "NÃO",
          open: "Abertos",
          resolverd: "Resolvidos",
          ticketDeleteSuccessfully: "Ticket deletado com sucesso.",
        },
        toasts: {
          deleted: "O atendimento que você estava foi deletado.",
        },
        notification: {
          message: "Mensagem de",
        },
        tabs: {
          open: { title: "Abertas" },
          group: { title: "Grupos" },
          private: { title: "Privados" },
          closed: { title: "Resolvidos" },
          search: { title: "Busca" },
        },
        search: {
          filterConnections: "Conexão",
          ticketsPerPage: "Tickets por página",
          placeholder: "Buscar atendimento e mensagens",
          filterConectionsOptions: {
            open: "Aberto",
            closed: "Fechado",
            pending: "Pendente",
            group: "Grupos",
          },
        },
        connections: {
          allConnections: "Todas as conexões"
        },
        buttons: {
          showAll: "Todos",
          refresh: "Atualizar"
        },
      },
      statistics: {
        title: "Estatísticas",
        startDate: "Data de Início",
        endDate: "Data de Fim",
        stateFilter: "Filtrar por Estado",
        dddFilter: "Filtrar por DDD",
        allStates: "Todos os Estados",
        selectDDDs: "Selecionar DDDs",
        buttons: {
          generate: "Gerar Relatório",
        },
        fetchSuccess: "Estatísticas carregadas com sucesso",
        fetchError: "Erro ao carregar estatísticas",
        cards: {
          totalAttendances: "Total de Atendimentos",
          openTickets: "Tickets Abertos",
          averageResponseTime: "Tempo Médio de Resposta",
          newContacts: "Novos Contatos",
          stateContacts: "Contatos no Estado",
          stateContactsBreakdown:
            "{{dddCount}} de {{stateTotal}} contatos em {{state}}",
        },
        charts: {
          ticketsEvolution: "Evolução de Tickets",
          ticketsChannels: "Canais de Tickets",
          brazilMap: "Mapa de Contatos por Estado",
        },
      },
      transferTicketModal: {
        title: "Transferir Ticket",
        fieldLabel: "Digite para buscar usuários",
        comments: "Comentários",
        fieldQueueLabel: "Transferir para um setor",
        fieldQueuePlaceholder: "Selecione um setor",
        noOptions: "Nenhum usuário encontrado com esse nome",
        fieldConnectionSelect: "Selecione uma conexão",
        buttons: {
          ok: "Transferir",
          cancel: "Cancelar",
        },
      },
      ticketsList: {
        pendingHeader: "Aguardando",
        assignedHeader: "Atendendo",
        noTicketsTitle: "Nada aqui!",
        noTicketsMessage:
          "Nenhum atendimento encontrado com esse status ou termo pesquisado",
        tagModalTitle: "Tags do Ticket",
        noTagsAvailable: "Nenhuma tag disponível",
        buttons: {
          exportAsPdf: "Exportar como PDF",
          accept: "Aceitar",
          closed: "Finalizar",
          reopen: "Reabrir",
          close: "Fechar"
        },
      },
      newTicketModal: {
        statusConnected: "CONECTADO",
        statusDeconnected: "DESCONECTADO",
        connectionDefault: "Padrão",
        title: "Criar Ticket",
        fieldLabel: "Digite para pesquisar o contato",
        add: "Adicionar",
        buttons: {
          ok: "Salvar",
          cancel: "Cancelar",
        },
        queue: "Selecione um setor",
        conn: "Selecione uma conexão",
      },
      ticketdetails: {
        iconspy: "Espiar Conversa",
        iconacept: "Aceitar Conversa",
        iconreturn: "Retornar para setor",
        iconstatus: "SEM SETOR",
      },
      SendContactModal: {
        title: "Enviar contato(s)",
        fieldLabel: "Digite para pesquisar",
        selectedContacts: "Contatos selecionados",
        add: "Criar novo contato",
        buttons: {
          newContact: "Criar novo contato",
          cancel: "cancelar",
          ok: "enviar",
        },
      },
      daysweek: {
        day1: "Segunda-feira",
        day2: "Terça-feira",
        day3: "Quarta-feira",
        day4: "Quinta-feira",
        day5: "Sexta-feira",
        day6: "Sábado",
        day7: "Domingo",
        save: "SALVAR",
      },
      mainDrawer: {
        listTitle: {
          service: "Atendimentos",
          management: "Gerência",
          administration: "Administração",
        },
        listItems: {
          dashboard: "Dashboard",
          statistics: "Estatísticas",
          performance: "Métricas de Performance",
          connections: "Conexões",
          adminDashboard: "Visão Geral",
          flowBuilderStatistics: "Estatísticas de Fluxos",
          landingPages: "Landing Pages",
          zabbix: "Painel Zabbix",
          businessHours: "Horários",
          api: "API",
          agendamento: "Agendamento de Serviços",
          groups: "Grupos",
          flowBuilder: "Fluxos de Conversas",
          messageRules: "Regras ChatBot",
          tickets: "Conversas",
          chatsTempoReal: "Chat Ao Vivo",
          tasks: "Tarefas",
          quickMessages: "Respostas Rápidas",
          asaasServices: "Asaas Serviços",
          contacts: {
            menu: "Contatos",
            list: "Agenda de Contatos",
            employers: "Empresas",
            employerspwd: "Banco de Senhas",
            positions: "Cargos"
          },
          queues: "Setores & Chatbot",
          tags: "Tags",
          kanban: "Kanban",
          email: "E-mail",
          users: "Colaboradores",
          whatsappTemplates: "Whatsapp Templates",
          settings: "Configurações",
          helps: "Ajuda e API",
          messagesAPI: "API",
          internalAPI: "API Interna",
          schedules: "Agendamentos",
          campaigns: "Campanhas",
          annoucements: "Informativos",
          chats: "Chat Interno",
          financeiro: "Financeiro",
          files: "Lista de arquivos",
          reports: "Relatórios",
          integrations: {
            menu: "Automações",
          },
          prompts: "OpenAI Prompts",
          profiles: "Perfis de Acesso",
          permissions: "Permissões",
          assistants: "OpenAI Agentes",
          queueIntegration: "Integrações",
          typebot: "Typebot",
          companies: "Empresas",
          version: "Versão",
          exit: "Sair",
        },
        appBar: {
          notRegister: "Nenhuma conexão ativa.",
          greetings: {
            hello: "Olá, ",
            tasks: "você tem {{count}} tarefas em aberto!",
            one: "Olá ",
            two: "Bem-vindo a ",
            three: "Ativo até",
          },
          menu: "Menu",
          tasks: "Tarefas",
          notifications: "Notificações",
          volume: "Volume",
          refresh: "Atualizar",
          backup: {
            title: "Backup",
            backup: "Fazer backup",
            schedule: "Agendar emails"
          },
          user: {
            profile: "Perfil",
            darkmode: "Modo escuro",
            lightmode: "Modo claro",
            language: "Idioma",
            logout: "Sair",
          },
          i18n: {
            language: "Português",
            language_short: "BR",
          },
        },
      },
      tagsFilter: {
        title: "Filtrar",
        selectAll: "Marcar todos",
        placeholder: "Selecione as tags",
        allSelected: "Todos selecionados",
        selected: "Selecionados"
      },
      usersFilter: {
        title: "Filtrar",
        selectAll: "Marcar todos",  
        placeholder: "Selecione os usuários",
        allSelected: "Todos selecionados",
        selected: "Selecionados"
      },
      email: {
        title: {
          sendEmail: "Enviar E-mail",
          scheduleEmail: "Agendar E-mail",
          emailList: "Lista de E-mails"
        },
        fields: {
          sender: "Destinatário",
          subject: "Assunto",
          message: "Mensagem",
          sendAt: "Data de Envio",
          attachments: "Anexo(s)"
        },
        placeholders: {
          sender: "email@exemplo.com (separar múltiplos emails por vírgula)",
          subject: "Digite o assunto do email",
          message: "Digite sua mensagem aqui..."
        },
        validations: {
          senderRequired: "Destinatário é obrigatório",
          invalidEmails: "Um ou mais emails são inválidos",
          subjectRequired: "Assunto é obrigatório",
          messageRequired: "Mensagem é obrigatória",
          dateInPast: "A data não pode ser no passado"
        },
        buttons: {
          send: "Enviar",
          schedule: "Agendar",
          cancel: "Cancelar",
          close: "Fechar",
          reschedule: "Reagendar",
          attachFile: "Anexar Arquivo",
          showAdvanced: "Opções Avançadas",
          hideAdvanced: "Esconder Opções Avançadas",
          showMore: "Ver Mais",
          showLess: "Ver Menos",
          removeAttachment: "Remover anexo"
        },
        tabs: {
          send: "Enviar",
          schedule: "Agendar",
          list: "Listar",
          sent: "Enviados",
          scheduled: "Agendados"
        },
        status: {
          sent: "Enviado",
          pending: "Pendente",
          error: "Erro",
          unknown: "Desconhecido"
        },
        errors: {
          loadEmails: "Erro ao carregar emails",
          apiError: "Erro na API",
          cancelError: "Erro ao cancelar email",
          rescheduleError: "Erro ao reagendar email",
          exportError: "Erro ao exportar emails"
        },
        helperTexts: {
          recipientCount: "{count} destinatário(s)",
          attachmentCount: "{count} arquivo(s) selecionado(s)",
          sendAt: "Escolha uma data e hora futura para envio"
        },
        tooltips: {
          sender: "Digite um ou mais emails separados por vírgula",
          subject: "Digite um assunto informativo",
          message: "Escreva sua mensagem",
          sendAt: "Escolha quando o email será enviado",
          refresh: "Atualizar",
          export: "Exportar",
          viewEmail: "Visualizar Email",
          moreOptions: "Mais Opções"
        },
        dueDateNotification: {
          title: "Disparos de notificações de fatura",
          error: "Ocorreu um erro ao disparar as notificações",
          close: "Fechar"
        },
        filters: {
          all: "Todos",
          sent: "Enviados",
          pending: "Pendentes",
          error: "Erros"
        },
        search: {
          placeholder: "Buscar emails..."
        },
        noEmails: "Nenhum email encontrado",
        noSubject: "(Sem assunto)",
        sentAt: "Enviado em",
        scheduledFor: "Agendado para",
        days: {
          monday: "Segunda",
          tuesday: "Terça",
          wednesday: "Quarta",
          thursday: "Quinta",
          friday: "Sexta",
          saturday: "Sábado",
          sunday: "Domingo"
        },
        chart: {
          title: "Estatísticas de Envio",
          lineChart: "Gráfico de Linha",
          barChart: "Gráfico de Barras",
          pieChart: "Gráfico de Pizza",
          sentEmails: "Emails Enviados",
          count: "Quantidade",
          emails: "email(s)"
        },
        stats: {
          totalSent: "Total Enviados",
          totalScheduled: "Total Agendados",
          successRate: "Taxa de Sucesso",
          averagePerDay: "Média por Dia",
          delivered: "entregue(s)",
          pending: "pendente(s)",
          failed: "falha(s)",
          last30Days: "últimos 30 dias"
        },
        table: {
          subject: "Assunto",
          recipient: "Destinatário",
          sentAt: "Enviado em",
          scheduledFor: "Agendado para",
          status: "Status",
          actions: "Ações"
        },
        emailDetails: {
          title: "Detalhes do Email",
          overview: "Visão Geral",
          content: "Conteúdo",
          technical: "Técnico",
          subject: "Assunto",
          recipient: "Destinatário",
          sentAt: "Enviado em",
          scheduledFor: "Agendado para",
          createdAt: "Criado em",
          updatedAt: "Atualizado em",
          error: "Erro",
          message: "Mensagem",
          attachments: "Anexos",
          attachmentsPlaceholder: "Prévia de anexos não disponível",
          emailId: "ID do Email",
          companyId: "ID da Empresa",
          messageId: "ID da Mensagem",
          hasAttachments: "Com Anexos",
          scheduled: "Agendado"
        },
        ariaLabels: {
          dashboard: "Painel de Email",
          tabs: "Abas de Email",
          sendTab: "Aba Enviar Email",
          scheduleTab: "Aba Agendar Email",
          listTab: "Aba Listar Emails",
          removeAttachment: "Remover anexo",
          sender: "Campo de Destinatário",
          subject: "Campo de Assunto",
          message: "Campo de Mensagem",
          sendAt: "Campo de Data de Envio",
          viewEmail: "Visualizar Email",
          moreOptions: "Mais Opções",
          emailLists: "Listas de Email",
          closeDetails: "Fechar Detalhes",
          detailTabs: "Abas de Detalhes",
          overviewTab: "Aba de Visão Geral",
          contentTab: "Aba de Conteúdo",
          technicalTab: "Aba Técnica"
        }
      },
      success: {
        emailSent: "Email enviado com sucesso!",
        emailScheduled: "Email agendado com sucesso!",
        emailCancelled: "Agendamento cancelado com sucesso!",
        emailRescheduled: "Email reagendado com sucesso!"
      },
      todoList: {
        title: "Minhas Tarefas",
        tasksCompleted: "{{completed}} de {{total}} tarefas completas",
        searchPlaceholder: "Buscar tarefas...",
        noCategory: "Sem Categoria",
        menu: {
          markAsDone: "Marcar como concluída",
          pin: "Fixar",
          select: "Selecionar",
          taskDetails: "Detalhes da tarefa",
          readAloud: "Ler em voz alta",
          share: "Compartilhar",
          edit: "Editar",
          duplicate: "Duplicar",
          delete: "Excluir",
        },
        success: {
          taskAdded: "Tarefa adicionada com sucesso!",
          taskUpdated: "Tarefa atualizada com sucesso!",
          taskDeleted: "Tarefa excluída com sucesso!",
          taskStatusUpdated: "Status da tarefa atualizado com sucesso!",
          categoryAdded: "Categoria adicionada com sucesso!",
          categoryUpdated: "Categoria atualizada com sucesso!",
          categoryDeleted: "Categoria excluída com sucesso!",
        },
        errors: {
          fetchTasks: "Erro ao buscar tarefas. Por favor, tente novamente.",
          fetchCategories:
            "Erro ao buscar categorias. Por favor, tente novamente.",
          addTask: "Erro ao adicionar tarefa. Por favor, tente novamente.",
          updateTask: "Erro ao atualizar tarefa. Por favor, tente novamente.",
          deleteTask: "Erro ao excluir tarefa. Por favor, tente novamente.",
          updateTaskStatus:
            "Erro ao atualizar status da tarefa. Por favor, tente novamente.",
          addCategory:
            "Erro ao adicionar categoria. Por favor, tente novamente.",
          updateCategory:
            "Erro ao atualizar categoria. Por favor, tente novamente.",
          deleteCategory:
            "Erro ao excluir categoria. Por favor, tente novamente.",
        },
        modal: {
          addTask: "Adicionar Tarefa",
          editTask: "Editar Tarefa",
          addCategory: "Adicionar Categoria",
          editCategory: "Editar Categoria",
          title: "Título",
          description: "Descrição",
          category: "Categoria",
          dueDate: "Data de vencimento",
          save: "Salvar",
          cancel: "Cancelar",
        },
      },
      taskCharges: {
        // ChargesPage.jsx
        chargesManagement: "Gerenciamento de Cobranças",
        pendingCharges: "Cobranças Pendentes",
        paidCharges: "Cobranças Pagas",
        client: "Cliente",
        allClients: "Todos os clientes",
        startDate: "Data inicial",
        endDate: "Data final",
        task: "Tarefa",
        value: "Valor",
        dueDate: "Vencimento",
        employer: "Empresa",
        chargesByEmployer: "Cobranças por Empresas",
        noEmployerWarning: "Essa tarefa não tem empresa atribuida.",
        paymentDate: "Data de pagamento",
        actions: "Ações",
        noPendingCharges: "Não há cobranças pendentes",
        noPaidCharges: "Não há cobranças pagas",
        noClient: "Cliente não informado",
        noDueDate: "Sem data de vencimento",
        generatePDF: "Gerar PDF",
        sendEmail: "Enviar por Email",
        registerPayment: "Registrar Pagamento",
        pdfGenerated: "PDF gerado com sucesso",
        emailSent: "Email enviado com sucesso",
        paymentRegistered: "Pagamento registrado com sucesso",
        errorLoadingCharges: "Erro ao carregar cobranças",
        errorGeneratingPDF: "Erro ao gerar PDF",
        errorSendingEmail: "Erro ao enviar email",
        errorRegisteringPayment: "Erro ao registrar pagamento",
        rowsPerPage: "Itens por página",
        of: "de",
        financialReport: "Relatório Financeiro",
        report: "Relatório",

        // FinancialReportModal.jsx
        totalValue: "Valor Total",
        pendingValue: "Valor Pendente",
        paidValue: "Valor Recebido",
        paidInPeriod: "Recebido no Período",
        charges: "cobranças",
        chargesByClient: "Cobranças por Cliente",
        chargesByMonth: "Cobranças por Mês",
        paymentsVsCharges: "Cobranças vs. Pagamentos",
        payments: "Pagamentos",
        noDataAvailable: "Não há dados disponíveis",
        selectFiltersAndSearch: "Selecione os filtros e clique em buscar",
        errorLoadingReport: "Erro ao carregar relatório",

        // PaymentModal.jsx
        paymentNotes: "Observações de Pagamento",
        paymentNotesPlaceholder: "Informe detalhes adicionais sobre o pagamento (opcional)",
        sendReceipt: "Enviar recibo por email",

        // TaskChargeComponent.jsx
        title: "Informações de Cobrança",
        addChargeDescription: "Adicione uma cobrança para esta tarefa. Uma vez adicionada, você poderá gerar PDFs, enviar por email e registrar pagamentos.",
        addCharge: "Adicionar Cobrança",
        noClientWarning: "Atenção: Esta tarefa não possui um cliente associado. Considere adicionar um cliente para facilitar o gerenciamento da cobrança.",
        status: "Situação",
        paid: "Pago",
        pending: "Pendente",
        notes: "Observações",
        invalidValue: "Valor inválido. Informe um valor maior que zero.",
        chargeAdded: "Cobrança adicionada com sucesso",
        errorAddingCharge: "Erro ao adicionar cobrança",
        noEmailWarning: "Não há email de contato para envio. Adicione um email ao cliente ou solicitante."
      },
      taskSubjects: {
        manageSubjects: "Gerenciar Assuntos",
        subjectName: "Assunto",
        subjectDescription: "Descrição",
        subjectsList: "Assuntos existentes",
        noSubjects: "Nenhum assunto cadastrado",
        errorLoading: "Ocorreu um erro ao carregar os assuntos"
        ,
      },

      tasks: {
        title: "Tarefas",
        search: "Pesquisar",
        from: "De",
        to: "Até",
        startDate: "Data Inicial",
        endDate: "Data Final",
        dueDate: "Data de Vencimento",
        creator: "Criador",
        responsible: "Responsável",
        category: "Categoria",
        subject: "Assunto",
        allUsers: "Todos",
        allCategories: "Todas",
        allStatuses: "Todos",
        allEmployers: "Todas empresas",
        allOptions: "Todas",
        status: {
          title: "Status",
          pending: "Pendente",
          inProgress: "Em Progresso",
          completed: "Concluída",
          overdue: "Atrasada"
        },
        privateTask: "Tarefa privada (somente você pode ver)",
        private: "Privada",
        public: "Pública",
        paid: "Pago",
        pending: "Pendente",
        createdAt: "Criada em",
        lastUpdate: "Última Atualização",
        privacy: "Privacidade",
        charge: "Cobrança",
        recurrence: "Recorrência",
        description: "Descrição",
        today: "Hoje",
        tomorrow: "Amanhã",
        dueToday: "Vence hoje",
        dueTomorrow: "Vence amanhã",
        daysOverdue: "Atrasada em {{days}} dias",
        dueYesterday: "Venceu ontem",
        overdueDays: "Atrasada em {{days}} dias",
        dueInDays: "Vence em {{days}} dias",
        withAttachments: "Com anexos",
        employer: "Empresa",
        employerName: "Nome da Empresa",
        employerEmail: "Email da Empresa",
        employerPhone: "Telefone da Empresa",
        employerDetails: "Detalhes da Empresa",
        requesterName: "Nome do Solicitante",
        requesterEmail: "Email do Solicitante",
        requesterDetails: "Detalhes do Solicitante",
        chargeValue: "Valor da Cobrança",
        chargeStatus: "Status do Pagamento",
        paymentDate: "Data de Pagamento",
        paymentNotes: "Observações de Pagamento",
        paidBy: "Registrado por",
        viewInvoice: "Visualizar Fatura",
        additionalInfo: "Informações Adicionais",
        recurrenceType: "Tipo de Recorrência",
        recurrenceDetails: "Detalhes de Recorrência",
        recurrenceEndDate: "Data de Término",
        recurrenceCount: "Quantidade de Ocorrências",
        nextOccurrence: "Próxima Ocorrência",
        hasNotes: "{{count}} notas",
        hasAttachments: "{{count}} anexos",

        buttons: {
          add: "Adicionar Tarefa",
          edit: "Editar",
          delete: "Excluir",
          save: "Salvar",
          saving: "Salvando...",
          cancel: "Cancelar",
          close: "Fechar",
          refresh: "Atualizar",
          clearFilters: "Limpar filtros",
          filter: "Filtrar",
          clear: "Limpar filtros",
          markDone: "Marcar como Concluída",
          markInProgress: "Marcar como em progresso",
          showDeleted: "Exibir excluidas",
          markPending: "Marcar como Pendente",
          toggleFilters: "Mostrar/Ocultar Filtros",
          kanbanView: "Visualização Kanban",
          listView: "Visualização em Lista",
          reports: "Relatórios",
          finances: "Finanças",
          sort: "Ordenar",
          moreActions: "Mais Ações",
          options: "Opções",
          print: "Imprimir",
          export: "Exportar"
        },

        tabs: {
          all: "Todas",
          pending: "Pendentes",
          inProgress: "Em Progresso",
          completed: "Concluídas",
          paid: "Cobradas",
          unpaid: "Em Cobrança",
          recurrent: "Recorrentes",
          notes: "Notas",
          attachments: "Anexos",
          timeline: "Linha do Tempo",
          charges: "Cobranças",
          details: "Detalhes",
          deleted: "Excluídas"
        },

        columns: {
          title: "Título",
          status: "Status",
          dueDate: "Vencimento",
          responsible: "Responsável",
          category: "Categoria",
          actions: "Ações"
        },

        empty: {
          title: "Nenhuma tarefa encontrada",
          description: "Clique no botão abaixo para adicionar uma nova tarefa",
          noTasks: "Nenhuma tarefa encontrada"
        },

        form: {
          title: "Título",
          description: "Descrição",
          dueDate: "Data de Vencimento",
          category: "Categoria",
          assignmentType: "Tipo de Atribuição",
          responsible: "Responsável",
          individual: "Individual",
          group: "Grupo",
          groupUsers: "Usuários do Grupo",
          selectCategory: "Selecione uma categoria",
          selectResponsible: "Selecione um responsável",
          selectField: "Selecione um campo",
          completed: "Concluída",
          titleRequired: "Título é obrigatório",
          categoryRequired: "Categoria é obrigatória",
          userRequired: "Responsável é obrigatório",
          usersRequired: "Selecione pelo menos um usuário",
          private: "Privada",
          privateInfo: "Somente você poderá ver esta tarefa",
          employer: "Empresa",
          subject: "Assunto",
          selectSubject: "Selecione um assunto",
          requesterName: "Nome do Solicitante",
          requesterEmail: "Email do Solicitante",
          chargeInfo: "Informações de Cobrança",
          hasCharge: "Esta tarefa possui cobrança",
          chargeValue: "Valor",
          chargeValueRequired: "Valor da cobrança é obrigatório",
          isPaid: "Cobrança realizada",
          paymentDate: "Data de Pagamento",
          paymentNotes: "Observações de Pagamento",
          recurrenceTitle: "Recorrência",
          recurrenceInfo: "Você pode definir um término por data ou quantidade de ocorrências. Se ambos forem preenchidos, o que ocorrer primeiro será considerado.",
          isRecurrent: "Esta tarefa é recorrente",
          recurrenceType: "Periodicidade",
          recurrenceTypeRequired: "Tipo de recorrência é obrigatório",
          recurrenceEndDate: "Data de Término",
          recurrenceCount: "Quantidade de Ocorrências"
        },

        modal: {
          add: "Adicionar Tarefa",
          edit: "Editar Tarefa",
          loadError: "Erro ao carregar dados"
        },

        notifications: {
          created: "Tarefa criada com sucesso",
          updated: "Tarefa atualizada com sucesso",
          deleted: "Tarefa excluída com sucesso",
          statusUpdated: "Status atualizado com sucesso",
          titleRequired: "Título é obrigatório",
          categoryRequired: "Categoria é obrigatória",
          userRequired: "Responsável é obrigatório",
          usersRequired: "Selecione pelo menos um usuário",
          chargeValueRequired: "Valor da cobrança é obrigatório",
          recurrenceTypeRequired: "Tipo de recorrência é obrigatório",
          submitError: "Erro ao salvar tarefa",
          updateError: "Erro ao atualizar tarefa",
          deleteError: "Erro ao excluir tarefa"
        },

        confirmations: {
          delete: {
            title: "Confirmar exclusão",
            message: "Tem certeza que deseja excluir esta tarefa?"
          }
        },

        sort: {
          dueDate: "Data de Vencimento",
          title: "Título",
          category: "Categoria"
        },

        errors: {
          loadFailed: "Erro ao carregar tarefas"
        },

        recurrence: {
          title: "Recorrência",
          daily: "Diária",
          weekly: "Semanal",
          biweekly: "Quinzenal",
          monthly: "Mensal",
          quarterly: "Trimestral",
          semiannual: "Semestral",
          annual: "Anual"
        },

        indicators: {
          notes: "{{count}} notas",
          attachments: "{{count}} anexos",
          paid: "Pago: R$ {{value}}",
          pendingPayment: "Pendente: R$ {{value}}",
          recurrent: "Tarefa recorrente"
        },

        kanban: {
          statusMode: "Por Status",
          categoryMode: "Por Categoria",
          todo: "A Fazer",
          inProgress: "Em Andamento",
          done: "Concluídas",
          emptyColumn: "Nenhuma tarefa nesta coluna",
          emptyCategoryColumn: "Nenhuma tarefa nesta categoria",
          filters: "Filtros",
          clearFilters: "Limpar Filtros",
          loadError: "Erro ao carregar dados do Kanban",
          noCategories: "Nenhuma categoria encontrada"
        },

        timeline: {
          system: "Sistema",
          fetchError: "Erro ao carregar histórico da tarefa",
          noEvents: "Nenhum evento registrado para esta tarefa",
          taskCreated: "{{name}} criou a tarefa '{{title}}'",
          taskUpdated: "{{name}} atualizou a tarefa",
          taskDeleted: "{{name}} excluiu a tarefa",
          noteAdded: "{{name}} adicionou uma nota",
          noteUpdated: "{{name}} atualizou uma nota",
          noteDeleted: "{{name}} removeu uma nota",
          attachmentAdded: "{{name}} anexou o arquivo '{{filename}}'",
          attachmentDeleted: "{{name}} removeu o anexo '{{filename}}'",
          statusCompletedBy: "{{name}} marcou a tarefa como concluída",
          statusPendingBy: "{{name}} marcou a tarefa como pendente",
          responsibleChanged: "{{name}} alterou o responsável de {{oldResponsible}} para {{newResponsible}}",
          usersAdded: "{{name}} adicionou {{count}} usuários à tarefa",
          userRemoved: "{{name}} removeu {{removed}} da tarefa",
          categoryChanged: "{{name}} alterou a categoria para '{{category}}'",
          dueDateChanged: "{{name}} alterou a data de vencimento para {{date}}",
          noDate: "sem data",
          titleChanged: "{{name}} alterou o título para '{{title}}'",
          descriptionChanged: "{{name}} atualizou a descrição da tarefa",
          employerAssociated: "{{name}} associou a empresa '{{employer}}' à tarefa",
          employerChanged: "{{name}} alterou a empresa associada à tarefa",
          subjectAssociated: "{{name}} associou o assunto '{{subject}}' à tarefa",
          subjectChanged: "{{name}} alterou o assunto da tarefa",
          chargeAdded: "{{name}} adicionou uma cobrança de {{value}}",
          paymentRegistered: "{{name}} registrou pagamento de {{value}} em {{date}}",
          chargeEmailSent: "{{name}} enviou email de cobrança para {{email}}",
          receiptEmailSent: "{{name}} enviou recibo por email para {{email}}",
          chargePdfGenerated: "{{name}} gerou PDF da cobrança",
          notificationSent: "{{name}} enviou notificação via {{type}}",
          notificationFailed: "{{name}} - falha ao enviar notificação: {{reason}}",
          overdueNotificationSent: "{{name}} recebeu notificação de atraso ({{minutes}} min)",
          recurrenceConfigured: "{{name}} configurou recorrência do tipo {{type}}",
          recurrenceCreated: "{{name}} criou nova instância recorrente (#{{childId}})",
          recurrenceChildCreated: "{{name}} criou tarefa baseada no padrão #{{parentId}}",
          recurrenceLimitReached: "{{name}} - limite de recorrências atingido ({{count}})",
          recurrenceEndDateReached: "{{name}} - data final de recorrência atingida ({{date}})",
          recurrenceSeriesUpdated: "{{name}} atualizou série de tarefas recorrentes ({{fields}})",
          recurrenceSeriesDeleted: "{{name}} excluiu {{count}} tarefas da série recorrente",
          reportGenerated: "{{name}} gerou relatório do tipo {{type}}",
          financialReportGenerated: "{{name}} gerou relatório financeiro"
        },

        notes: {
          placeholder: "Adicione uma nota...",
          empty: "Nenhuma nota encontrada",
          deleted: "Nota excluída com sucesso",
          deleteError: "Erro ao excluir nota"
        },

        attachments: {
          title: "Anexos",
          dropFiles: "Arraste arquivos aqui ou clique para fazer upload",
          clickToUpload: "Formatos: PDF, JPEG, PNG, DOC, XLS",
          allowedTypes: "Tamanho máximo: 10MB",
          uploading: "Enviando arquivo...",
          uploaded: "Arquivo enviado com sucesso",
          deleted: "Arquivo excluído com sucesso",
          empty: "Nenhum anexo encontrado",
          fileTooLarge: "O arquivo excede o tamanho máximo permitido ({{size}})",
          fileTypeNotAllowed: "Tipo de arquivo não permitido",
          errorLoadingFiles: "Erro ao carregar arquivos",
          preview: "Pré-visualização",
          clickToPreview: "Clique para visualizar",
          uploadedBy: "Enviado por",
          sort: {
            newest: "Mais recentes",
            oldest: "Mais antigos",
            nameAsc: "Nome (A-Z)",
            nameDesc: "Nome (Z-A)",
            sizeAsc: "Tamanho (menor primeiro)",
            sizeDesc: "Tamanho (maior primeiro)"
          }
        },

        reports: {
          title: "Relatórios de Tarefas",
          filters: "Filtros",
          totalTasks: "Total de Tarefas",
          completed: "Concluídas",
          pending: "Pendentes",
          overdue: "Atrasadas",
          weeklyProgress: "Progresso Semanal",
          statusDistribution: "Distribuição de Status",
          userPerformance: "Desempenho por Usuário",
          attachmentStats: "Estatísticas de Anexos",
          noDataAvailable: "Nenhum dado disponível"
        },

        export: {
          success: "Exportação concluída com sucesso",
          error: "Erro ao exportar dados",
          downloadTemplate: "Baixar modelo",
          noData: "Nenhuma tarefa para exportar"
        },

        import: {
          title: "Importar Tarefas",
          steps: {
            selectFile: "Selecionar Arquivo",
            mapFields: "Mapear Campos",
            review: "Revisar",
            result: "Resultado"
          },
          selectFilePrompt: "Selecione um arquivo CSV ou Excel com as tarefas para importar",
          dragAndDrop: "Arraste e solte o arquivo aqui",
          or: "ou",
          browse: "Procurar arquivo",
          supportedFormats: "Formatos suportados: CSV, XLSX, XLS",
          needTemplate: "Precisa de um modelo para começar?",
          downloadTemplate: "Baixar modelo de importação",
          processingFile: "Processando arquivo...",
          mapFields: "Mapeie os campos do seu arquivo para os campos do sistema",
          mapFieldsInfo: "Selecione quais colunas do seu arquivo correspondem a cada campo no sistema. Apenas o campo 'Título' é obrigatório.",
          selectField: "Selecione um campo",
          validation: {
            titleRequired: "O campo 'Título' é obrigatório para importação",
            emptyTitle: "Título vazio",
            invalidDate: "Data inválida: {{value}}",
            invalidCategory: "Categoria '{{category}}' não encontrada",
            invalidUser: "Usuário '{{user}}' não encontrado",
            dataErrors: "{{count}} registros com problemas",
          },
          validationErrors: "{{count}} problemas encontrados nos dados",
          errorDetails: "Detalhes dos erros ({{count}})",
          rowError: "Linha {{row}}: {{error}}",
          moreErrors: "...e mais {{count}} erros",
          reviewAndImport: "Revise os dados e inicie a importação",
          reviewInfo: "Verifique os dados abaixo antes de importar. Você poderá ver um resumo e uma amostra dos dados que serão importados.",
          summary: "Resumo",
          totalRecords: "Total de registros",
          validRecords: "Registros válidos",
          invalidRecords: "Registros inválidos",
          mappedFields: "Campos mapeados",
          notMapped: "Não mapeado",
          previewData: "Pré-visualização",
          showingFirst: "Mostrando os primeiros {{count}} de {{total}} registros",
          import: "Importar",
          importingTasks: "Importando tarefas...",
          pleaseWait: "Por favor, aguarde enquanto as tarefas são importadas",
          importComplete: "Importação concluída",
          importFailed: "Falha na importação",
          totalProcessed: "Total processado",
          successful: "Sucesso",
          failed: "Falha",
          errors: "Erros",
          successMessage: "{{count}} tarefas foram importadas com sucesso",
          failureMessage: "A importação falhou. Verifique os erros e tente novamente.",
          importAnother: "Importar outro arquivo",
          errors: {
            invalidFileType: "Tipo de arquivo inválido. Use CSV ou Excel.",
            emptyFile: "Arquivo vazio ou sem dados",
            parsingFailed: "Erro ao processar o arquivo",
            readFailed: "Erro ao ler o arquivo",
            processingFailed: "Erro ao processar dados",
            validationFailed: "Existem erros na validação dos dados",
            importFailed: "Falha ao importar dados",
            generalError: "Erro desconhecido",
            fetchCategoriesFailed: "Erro ao carregar categorias",
            fetchUsersFailed: "Erro ao carregar usuários",
            templateGenerationFailed: "Erro ao gerar modelo"
          }
        },

        charges: {
          title: "Gerenciar Cobranças",
          pendingCharges: "Cobranças Pendentes",
          paidCharges: "Cobranças Pagas",
          employer: "Empresa",
          allEmployers: "Todas as empresas",
          value: "Valor",
          dueDate: "Data de Vencimento",
          paymentDate: "Data de Pagamento",
          actions: "Ações",
          task: "Tarefa",
          status: "Status",
          generatePDF: "Gerar PDF",
          sendEmail: "Enviar Email",
          registerPayment: "Registrar Pagamento",
          addCharge: "Adicionar Cobrança",
          addChargeDescription: "Adicione uma cobrança a esta tarefa preenchendo o valor abaixo.",
          noEmployerWarning: "Atenção: Nenhuma empresa definida para esta tarefa. Cobranças sem empresa podem dificultar o rastreamento.",
          noEmailWarning: "Não há email de contato para envio da cobrança.",
          pdfGenerated: "PDF gerado com sucesso",
          emailSent: "Email enviado com sucesso",
          paymentRegistered: "Pagamento registrado com sucesso",
          value: "Valor",
          notes: "Observações",
          paid: "Pago",
          pending: "Pendente",
          invalidValue: "Valor inválido",
          paymentNotesPlaceholder: "Informações adicionais sobre o pagamento...",
          sendReceipt: "Enviar recibo ao cliente",
          noPendingCharges: "Nenhuma cobrança pendente encontrada",
          noPaidCharges: "Nenhuma cobrança paga encontrada",
          noEmployer: "Sem empresa",
          noDueDate: "Sem data de vencimento",
          rowsPerPage: "Linhas por página",
          of: "de",
          financialReport: "Relatório Financeiro",
          report: "Relatório",
          paidInPeriod: "Pago no período",
          totalValue: "Valor Total",
          pendingValue: "Valor Pendente",
          paidValue: "Valor Pago",
          charges: "cobranças",
          selectFiltersAndSearch: "Selecione os filtros e clique em Pesquisar",
          noDataAvailable: "Sem dados disponíveis",
          chargesByEmployer: "Cobranças por Empresa",
          chargesByMonth: "Cobranças por Mês",
          paymentsVsCharges: "Cobranças vs. Pagamentos",
          payments: "Pagamentos"
        },

        financialReports: {
          title: "Relatórios Financeiros"
        },

        filters: {
          title: "Filtros",
          charges: "Cobranças",
          withCharges: "Com Cobranças",
          paid: "Pagas",
          pending: "Pendentes",
          hasAttachments: "Apenas com anexos",
          recurrent: "Somente tarefas recorrentes",
          loadError: "Erro ao carregar dados de filtro"
        },

        taskCategories: {
          manageCategories: "Gerenciar Categorias",
          categoryName: "Nome da Categoria",
          nameRequired: "Nome da categoria é obrigatório",
          categoryCreated: "Categoria criada com sucesso",
          categoryUpdated: "Categoria atualizada com sucesso",
          categoryDeleted: "Categoria excluída com sucesso",
          confirmDelete: "Tem certeza que deseja excluir esta categoria?",
          noCategories: "Nenhuma categoria encontrada",
          errorLoading: "Erro ao carregar categorias",
          errorSaving: "Erro ao salvar categoria",
          errorDeleting: "Erro ao excluir categoria",
          cannotDeleteUsed: "Não é possível excluir esta categoria pois está sendo usada em tarefas",
          tasks: "tarefas"
        },

        taskSubjects: {
          manageSubjects: "Gerenciar Assuntos",
          subjectName: "Nome do Assunto",
          subjectDescription: "Descrição (opcional)",
          nameRequired: "Nome do assunto é obrigatório",
          subjectCreated: "Assunto criado com sucesso",
          subjectUpdated: "Assunto atualizado com sucesso",
          subjectDeleted: "Assunto excluído com sucesso",
          confirmDelete: "Tem certeza que deseja excluir este assunto?",
          noSubjects: "Nenhum assunto cadastrado",
          subjectsList: "Lista de Assuntos",
          noDescription: "Sem descrição",
          errorLoading: "Erro ao carregar assuntos",
          errorSaving: "Erro ao salvar assunto",
          errorDeleting: "Erro ao excluir assunto",
          cannotDeleteUsed: "Não é possível excluir este assunto pois está sendo usado em tarefas"
        },

        toggleView: "Alternar visualização",
        toggleFilters: "Mostrar/Ocultar Filtros",

        help: {
          tooltip: "Ajuda sobre a Gestão de Tarefas",
          title: "Ajuda - Gestão de Tarefas",
          tabs: {
            overview: "Visão Geral",
            interface: "Interface",
            features: "Funcionalidades",
            kanban: "Kanban",
            financial: "Financeiro",
            tips: "Dicas"
          },
          overview: {
            title: "Visão Geral do Módulo de Tarefas",
            introduction: "O módulo de Tarefas permite gerenciar todas as atividades da sua equipe de forma organizada e eficiente. Aqui você pode criar, atribuir, acompanhar e concluir tarefas, além de gerar relatórios e cobranças.",
            mainFeatures: "Principais Funcionalidades:",
            listView: "Visualização em Lista",
            listViewDesc: "Visualize suas tarefas em uma lista detalhada com filtros e ordenação.",
            kanbanView: "Visualização Kanban",
            kanbanViewDesc: "Gerencie tarefas em um quadro de status ou por categorias.",
            financial: "Gestão Financeira",
            financialDesc: "Crie cobranças associadas às tarefas e acompanhe pagamentos.",
            reports: "Relatórios e Estatísticas",
            reportsDesc: "Acompanhe o desempenho com relatórios detalhados e gráficos.",
            benefits: "Benefícios:",
            benefitsText: "Com o gerenciamento de tarefas, sua equipe conseguirá trabalhar de forma mais organizada, acompanhar prazos, evitar esquecimentos, manter o histórico de atividades e facilitar a prestação de contas para seus clientes. As cobranças automáticas permitem otimizar o processo financeiro, enquanto os relatórios fornecem insights valiosos para a gestão."
          },
          interface: {
            title: "Interface e Navegação",
            headerSection: "Cabeçalho e Barra de Ferramentas",
            headerDesc: "Na parte superior da página, você encontrará:",
            searchField: "Campo de Pesquisa",
            searchFieldDesc: "Busque tarefas por título ou informações relacionadas",
            filterButton: "Botão de Filtros",
            filterButtonDesc: "Mostra/oculta o painel de filtros avançados",
            reportButton: "Botão de Relatórios",
            reportButtonDesc: "Acessa a seção de relatórios e estatísticas",
            financialButton: "Botão Financeiro",
            financialButtonDesc: "Menu com opções para gerenciar cobranças",
            viewToggle: "Alternador de Visualização",
            viewToggleDesc: "Alterna entre visualização de lista e kanban",
            addButton: "Botão Adicionar",
            addButtonDesc: "Cria uma nova tarefa",
            tabsSection: "Abas de Status",
            tabsDesc: "As abas permitem filtrar rapidamente as tarefas por status:",
            allTab: "Todas",
            allTabDesc: "Exibe todas as tarefas",
            pendingTab: "Pendentes",
            pendingTabDesc: "Tarefas que ainda não foram concluídas",
            inProgressTab: "Em Progresso",
            inProgressTabDesc: "Tarefas que estão sendo trabalhadas",
            completedTab: "Concluídas",
            completedTabDesc: "Tarefas finalizadas",
            paidTab: "Pagas",
            paidTabDesc: "Tarefas com cobrança paga",
            unpaidTab: "Não Pagas",
            unpaidTabDesc: "Tarefas com cobrança pendente de pagamento",
            recurrentTab: "Recorrentes",
            recurrentTabDesc: "Tarefas que se repetem automaticamente",
            tableSection: "Tabela de Tarefas",
            tableDesc: "A tabela exibe suas tarefas com as seguintes colunas:",
            titleColumn: "Título",
            titleColumnDesc: "Nome da tarefa com indicadores de anexos e notas",
            statusColumn: "Status",
            statusColumnDesc: "Situação atual da tarefa (Pendente, Em Progresso, Concluída, Atrasada)",
            dueDateColumn: "Data de Vencimento",
            dueDateColumnDesc: "Prazo para conclusão da tarefa",
            responsibleColumn: "Responsável",
            responsibleColumnDesc: "Usuário designado para executar a tarefa",
            categoryColumn: "Categoria",
            categoryColumnDesc: "Classificação da tarefa",
            actionsColumn: "Ações",
            actionsColumnDesc: "Botões para marcar como concluída, editar e excluir"
          },
          features: {
            title: "Funcionalidades Detalhadas",
            taskCreation: "Criação e Edição de Tarefas",
            taskCreationDesc: "Para criar uma nova tarefa, clique no botão 'Adicionar' no canto superior direito. O formulário permite configurar:",
            basicInfo: "Informações Básicas",
            basicInfoDesc: "Título, descrição, data de vencimento, categoria e assunto",
            responsibility: "Responsabilidade",
            responsibilityDesc: "Atribuição individual ou em grupo para múltiplos usuários",
            clientInfo: "Informações do Cliente",
            clientInfoDesc: "Vinculação a uma empresa e dados do solicitante",
            charging: "Configuração de Cobrança",
            chargingDesc: "Defina valor e status de pagamento",
            recurrence: "Configuração de Recorrência",
            recurrenceDesc: "Defina periodicidade, data de término ou número de ocorrências",
            taskEditingNote: "A edição de tarefas utiliza o mesmo formulário, permitindo alterar qualquer parâmetro a qualquer momento.",
            filtering: "Filtros Avançados",
            filteringDesc: "O painel de filtros permite refinar sua visualização com base em diversos critérios:",
            dateFilter: "Filtros de Data",
            dateFilterDesc: "Período específico com data inicial e final",
            userFilter: "Filtro por Usuário",
            userFilterDesc: "Tarefas atribuídas a um responsável específico",
            categoryFilter: "Filtro por Categoria",
            categoryFilterDesc: "Tarefas de uma categoria específica",
            employerFilter: "Filtro por Empresa",
            employerFilterDesc: "Tarefas associadas a uma empresa específica",
            statusFilter: "Filtro por Status",
            statusFilterDesc: "Pendentes, concluídas, em progresso ou atrasadas",
            chargeFilter: "Filtro por Cobrança",
            chargeFilterDesc: "Tarefas com cobrança, pagas ou pendentes",
            attachmentFilter: "Filtro por Anexos",
            attachmentFilterDesc: "Tarefas que possuem anexos",
            recurrenceFilter: "Filtro por Recorrência",
            recurrenceFilterDesc: "Apenas tarefas recorrentes",
            sorting: "Ordenação e Organização",
            sortingDesc: "Além dos filtros, é possível ordenar as tarefas por diversos critérios:",
            dueDateSort: "Data de Vencimento",
            dueDateSortDesc: "Prioriza tarefas pelo prazo",
            titleSort: "Título",
            titleSortDesc: "Ordena alfabeticamente pelo título",
            categorySort: "Categoria",
            categorySortDesc: "Agrupa tarefas por categoria",
            importExport: "Importação e Exportação",
            importDesc: "A funcionalidade de importação permite carregar múltiplas tarefas de uma vez através de arquivos CSV ou Excel:",
            importSteps: "Etapas da Importação",
            importStepsDesc: "Upload do arquivo, mapeamento de campos, revisão e confirmação",
            exportFormats: "Formatos de Exportação",
            exportFormatsDesc: "Exporte suas tarefas em PDF, Excel ou imprima diretamente",
            categories: "Categorias e Assuntos",
            categoriesDesc: "O sistema permite gerenciar categorias e assuntos para melhor organização:",
            categoryManagement: "Gerenciamento de Categorias",
            categoryManagementDesc: "Crie, edite e exclua categorias para classificar suas tarefas",
            subjectManagement: "Gerenciamento de Assuntos",
            subjectManagementDesc: "Configure assuntos para adicionar uma segunda dimensão de classificação",
            details: "Detalhes da Tarefa",
            detailsDesc: "Ao clicar em uma tarefa, você acessa o modal de detalhes com diversas abas:",
            notesTab: "Notas",
            notesTabDesc: "Adicione anotações para documentar o progresso",
            attachmentsTab: "Anexos",
            attachmentsTabDesc: "Faça upload de arquivos relacionados à tarefa",
            timelineTab: "Linha do Tempo",
            timelineTabDesc: "Visualize todo o histórico de ações da tarefa",
            chargesTab: "Cobranças",
            chargesTabDesc: "Gerencie valores e pagamentos associados à tarefa",
            detailsTab: "Detalhes",
            detailsTabDesc: "Informações completas sobre empresa, solicitante e configurações"
          },
          kanban: {
            title: "Visualização Kanban",
            introduction: "A visualização Kanban oferece uma perspectiva visual do fluxo de trabalho, permitindo gerenciar tarefas através de colunas que representam diferentes estados ou categorias.",
            modes: "Modos de Visualização",
            modesDesc: "O Kanban oferece dois modos principais de visualização:",
            statusMode: "Por Status",
            statusModeDesc: "Organiza as tarefas em colunas de Pendente, Em Progresso e Concluído",
            categoryMode: "Por Categoria",
            categoryModeDesc: "Agrupa tarefas por categoria, permitindo visualizar a distribuição do trabalho",
            dragDrop: "Arrastar e Soltar",
            dragDropDesc: "A principal vantagem do Kanban é a funcionalidade de arrastar e soltar:",
            statusChange: "Mudança de Status",
            statusChangeDesc: "No modo Status, arraste tarefas entre colunas para alterar seu status",
            categoryChange: "Mudança de Categoria",
            categoryChangeDesc: "No modo Categoria, arraste para reclassificar a tarefa",
            dragDropTip: "Dica: Para alterar várias tarefas rapidamente, utilize a visualização Kanban em vez de abrir e editar cada tarefa individualmente.",
            filtering: "Filtragem no Kanban",
            filteringDesc: "Mesmo na visualização Kanban, você pode utilizar os filtros avançados:",
            filterAccess: "Acesso aos Filtros",
            filterAccessDesc: "Clique no ícone de filtro para mostrar/ocultar o painel de filtros",
            filterEffect: "Efeito dos Filtros",
            filterEffectDesc: "Os filtros afetam todas as colunas simultaneamente, mostrando apenas as tarefas que correspondem aos critérios",
            cards: "Cartões de Tarefas",
            cardsDesc: "Os cartões no Kanban mostram informações importantes de forma compacta:",
            cardInfo: "Informações Visíveis",
            cardInfoDesc: "Título, responsável, data de vencimento, categoria e indicadores de anexos/notas",
            cardActions: "Ações Rápidas",
            cardActionsDesc: "Botões para marcar como concluída, editar e excluir diretamente no cartão",
            cardClick: "Clique no Cartão",
            cardClickDesc: "Clique em qualquer cartão para abrir os detalhes completos da tarefa"
          },
          financial: {
            title: "Gestão Financeira",
            introduction: "O módulo de tarefas oferece funcionalidades financeiras integradas, permitindo criar cobranças associadas a tarefas, gerenciar pagamentos e gerar relatórios financeiros.",
            taskCharges: "Cobranças em Tarefas",
            taskChargesDesc: "Como adicionar cobranças a uma tarefa:",
            createCharge: "Criação de Cobrança",
            createChargeDesc: "Ao criar ou editar uma tarefa, ative a opção 'Esta tarefa possui cobrança' na seção de Informações de Cobrança",
            chargeSettings: "Configurações de Cobrança",
            chargeSettingsDesc: "Defina o valor a ser cobrado e indique se já foi pago",
            existingCharge: "Tarefas com Cobrança",
            existingChargeDesc: "Tarefas com cobrança exibem um ícone de cifrão. Verde para pagas, vermelho para pendentes",
            chargeManagement: "Gerenciamento de Cobranças",
            chargeManagementDesc: "Para gerenciar todas as cobranças em um só lugar:",
            chargesPage: "Página de Cobranças",
            chargesPageDesc: "Acesse através do botão Financeiro > Gerenciar Cobranças",
            chargeTabs: "Abas de Cobrança",
            chargeTabsDesc: "Alterne entre cobranças pendentes e pagas",
            chargeActions: "Ações de Cobrança",
            chargeActionsDesc: "Gerar PDF, enviar por e-mail e registrar pagamento",
            chargeFilters: "Filtros de Cobrança",
            chargeFiltersDesc: "Filtre por empresa, data de vencimento e outros critérios",
            reports: "Relatórios Financeiros",
            reportsDesc: "Acompanhe o desempenho financeiro através de relatórios:",
            reportAccess: "Acesso aos Relatórios",
            reportAccessDesc: "Botão Financeiro > Relatórios Financeiros",
            reportSummary: "Resumo Financeiro",
            reportSummaryDesc: "Visualize totais de cobranças, valores pendentes e recebidos",
            reportCharts: "Gráficos Financeiros",
            reportChartsDesc: "Analise dados por empresa, por mês e compare cobranças com pagamentos",
            reportFilters: "Personalização de Relatórios",
            reportFiltersDesc: "Filtre por empresa, período e outros critérios para análises específicas",
            invoicing: "Faturamento e Comunicação",
            invoicingDesc: "Comunique-se com clientes sobre cobranças:",
            pdfGeneration: "Geração de PDF",
            pdfGenerationDesc: "Crie documentos de cobrança profissionais para envio aos clientes",
            emailSending: "Envio por E-mail",
            emailSendingDesc: "Envie cobranças diretamente para os clientes através do sistema",
            receiptSending: "Envio de Recibos",
            receiptSendingDesc: "Após registrar pagamentos, envie recibos automáticos"
          },
          tips: {
            title: "Dicas e Boas Práticas",
            organization: "Organização Eficiente",
            useCategories: "Use Categorias Consistentes",
            useCategoriesDesc: "Defina um conjunto padrão de categorias para facilitar a organização e os relatórios",
            namingConvention: "Padronize Títulos",
            namingConventionDesc: "Adote uma convenção de nomenclatura para tarefas para facilitar a busca (ex: [Cliente] - Ação Principal)",
            useDescription: "Descrições Detalhadas",
            useDescriptionDesc: "Inclua informações completas na descrição para que qualquer pessoa entenda o que precisa ser feito",
            teamWork: "Trabalho em Equipe",
            useNotes: "Use Notas para Comunicação",
            useNotesDesc: "Documente avanços e desafios nas notas para manter a equipe informada",
            groupAssignment: "Atribuição em Grupo",
            groupAssignmentDesc: "Para tarefas complexas, atribua a múltiplos usuários para colaboração",
            attachRelevantFiles: "Anexe Arquivos Relevantes",
            attachRelevantFilesDesc: "Mantenha todos os arquivos necessários anexados à tarefa para fácil acesso",
            timeManagement: "Gestão de Tempo",
            setRealisticDates: "Estabeleça Prazos Realistas",
            setRealisticDatesDesc: "Evite prazos impossíveis de cumprir para manter a equipe motivada",
            useInProgress: "Use o Status 'Em Progresso'",
            useInProgressDesc: "Quando começar a trabalhar em uma tarefa, mova-a para 'Em Progresso' para melhor visualização",
            reviewDailyTasks: "Revise Tarefas Diariamente",
            reviewDailyTasksDesc: "Comece o dia verificando as tarefas pendentes e organize a visualização Kanban",
            financialBestPractices: "Boas Práticas Financeiras",
            linkToEmployer: "Vincule a Empresas",
            linkToEmployerDesc: "Sempre associe tarefas com cobranças a empresas para facilitar a faturação",
            regularReports: "Relatórios Regulares",
            regularReportsDesc: "Gere relatórios financeiros semanais ou mensais para acompanhar recebimentos",
            documentPayments: "Documente Pagamentos",
            documentPaymentsDesc: "Ao registrar pagamentos, adicione informações detalhadas nas observações",
            kanbanUsage: "Uso Eficiente do Kanban",
            statusModeForWorkflow: "Modo Status para Fluxo de Trabalho",
            statusModeForWorkflowDesc: "Use o modo status para gerenciar tarefas em andamento no dia a dia",
            categoryModeForPlanning: "Modo Categoria para Planejamento",
            categoryModeForPlanningDesc: "Use o modo categoria para avaliar a distribuição de trabalho e fazer planejamento",
            limitWIP: "Limite Trabalho em Andamento",
            limitWIPDesc: "Evite ter muitas tarefas em progresso simultaneamente para melhorar a produtividade"
          }
        }
      },
      taskCategories: {
        manageCategories: "Gerenciar Categorias",
        categoryName: "Categoria",
        nameRequired: "Nome da categoria é obrigatório",
        noCategories: "Sem categorias",
        tasks: "Tarefas",
      },
      agendamentoDetails: {
        title: "Detalhes do Agendamento",
        appointmentData: "Dados do Agendamento",
        serviceAndProfessional: "Serviço e Profissional",
        date: "Data",
        time: "Horário",
        duration: "Duração",
        minutes: "minutos",
        service: "Serviço",
        professional: "Profissional",
        price: "Valor",
        notes: "Observações",
        staffNotes: "Observações do atendente",
        customerNotes: "Observações do cliente",
        cancellationReason: "Motivo do cancelamento",
        linkedTicket: "Ticket Vinculado",
        ticketId: "ID do Ticket",
        notSpecified: "Não especificado"
      },
      contactAppointments: {
        title: "Agendamentos",
        noAppointments: "Nenhum agendamento encontrado para este contato",
        detailsTitle: "Detalhes do Agendamento",
        close: "Fechar",
        errors: {
          load: "Erro ao carregar agendamentos"
        }
      },

      kanban: {
        title: "Quadro Kanban",
        openTickets: "Em Aberto",
        queue: {
          title: "Quadro por Setor",
          selectQueue: "Selecione um setor",
          selectQueuePrompt: "Selecione um setor para visualizar o quadro kanban",
          newLane: {
            title: "Nova Coluna",
            name: "Nome da coluna",
            color: "Cor da coluna",
            create: "Criar Coluna",
            success: "Coluna criada com sucesso",
            error: "Erro ao criar coluna"
          },
          errors: {
            loadQueues: "Erro ao carregar setores",
            loadLanes: "Erro ao carregar colunas",
            loadTickets: "Erro ao carregar tickets",
            moveCard: "Erro ao mover ticket",
            deleteTag: "Erro ao excluir coluna",
            updateTag: "Erro ao atualizar coluna"
          },
          success: {
            cardMoved: "Ticket movido com sucesso",
            tagDeleted: "Coluna removida com sucesso",
            tagUpdated: "Coluna atualizada com sucesso"
          }
        },
        filters: {
          searchPlaceholder: "Buscar tickets...",
          dateFrom: "Data inicial",
          dateTo: "Data final",
          users: "Filtrar por atendente",
          status: "Status do ticket",
          queues: "Setores",
          noResults: "Nenhum resultado encontrado"
        },
        card: {
          ticketNumber: "Ticket #",
          customer: "Cliente",
          lastMessage: "Última mensagem",
          assignedTo: "Atribuído para",
          status: "Status",
          queue: "Setor",
          createdAt: "Criado em",
          updatedAt: "Atualizado em",
          noMessage: "Sem mensagens"
        },
        lane: {
          actions: {
            edit: "Editar coluna",
            delete: "Excluir coluna",
            confirm: "Confirmar",
            cancel: "Cancelar"
          },
          edit: {
            title: "Editar Coluna",
            name: "Nome",
            color: "Cor",
            save: "Salvar alterações"
          },
          delete: {
            title: "Excluir Coluna",
            message: "Tem certeza que deseja excluir esta coluna?",
            warning: "Todos os tickets serão movidos para a coluna padrão"
          },
          tickets: "tickets"
        },
        actions: {
          settings: "Configurações do quadro",
          newLane: "Nova coluna",
          refresh: "Atualizar quadro",
          expand: "Expandir",
          collapse: "Recolher"
        },
        settings: {
          title: "Configurações do Quadro",
          general: {
            title: "Configurações Gerais",
            autoRefresh: "Atualização automática",
            refreshInterval: "Intervalo de atualização",
            cardSize: "Tamanho dos cards",
            compactView: "Visualização compacta"
          },
          display: {
            title: "Exibição",
            showAvatars: "Mostrar avatares",
            showTags: "Mostrar etiquetas",
            showPriority: "Mostrar prioridade",
            showDueDate: "Mostrar prazo"
          }
        },
        tooltips: {
          addLane: "Adicionar nova coluna",
          editLane: "Editar coluna",
          deleteLane: "Excluir coluna",
          moveTicket: "Mover ticket",
          openTicket: "Abrir ticket"
        },
        emptyState: {
          title: "Selecione um setor para visualizar o Kanban",
          message: "Para visualizar os tickets no quadro Kanban, primeiro selecione um setor no menu acima.",
          buttonText: "Selecionar Setor"
        },
        confirmations: {
          deleteLane: {
            title: "Excluir Coluna",
            message: "Tem certeza que deseja excluir esta coluna? Esta ação não pode ser desfeita."
          }
        },
        notifications: {
          ticketMoved: "Ticket movido para {lane}",
          laneCreated: "Coluna criada com sucesso",
          laneUpdated: "Coluna atualizada com sucesso",
          laneDeleted: "Coluna excluída com sucesso"
        },
        infoModal: {
          title: "Informações do Quadro Kanban",
          tooltipInfo: "Informações sobre o Kanban",
          closeButton: "Fechar",

          scheduleTimeTitle: "Horário de Agendamento:",
          scheduleTimeDescription: "Todos os agendamentos serão enviados entre as 18:00 e 18:30.",

          recurringScheduleTitle: "Agendamento Recorrente:",
          recurringStep1: "Vá para a aba de \"Tags de Campanha\".",
          recurringStep2: "Crie novas tags, se necessário.",
          recurringStep3: "Siga estes passos:",
          subStep1: "Vá na engrenagem de configurações.",
          subStep2: "Selecione um dos quadros disponíveis.",
          subStep3: "Altere a mensagem que será enviada.",
          subStep4: "Se necessário, escolha um arquivo a ser enviado.",
          subStep5: "Escolha a frequência do agendamento (a cada quantos dias).",
          subStep6: "Clique em \"Salvar\".",

          noActiveCampaignsTitle: "Tickets Sem Campanhas Ativas:",
          noActiveCampaignsDescription: "Todos os tickets sem campanhas ativas entrarão no quadro \"Em Aberto\".",

          createCampaignTitle: "Criar uma Campanha:",
          createCampaignDescription: "Para criar uma campanha, arraste o ticket para o quadro de campanha de sua escolha.",

          moveTicketsTitle: "Mover Tickets entre Quadros:",
          moveTicketsStep1: "Ao mover um ticket para um quadro, os agendamentos serão feitos com base nas configurações do quadro.",
          moveTicketsStep2: "Ao mover um ticket para outro quadro, os agendamentos existentes serão excluídos e um novo agendamento será criado de acordo com o quadro escolhido.",
          moveTicketsStep3: "Ao mover um ticket de volta para o quadro \"Em Aberto\", os agendamentos existentes do ticket serão excluídos."
        }
      },
      transferTicketsModal: {
        title: "Transferir Tickets",
        warning: "Atenção! Esta ação não pode ser desfeita",
        description: "Selecione uma conexão para transferir os tickets antes de excluir esta conexão. Todos os tickets em aberto serão movidos para a conexão selecionada.",
        selectLabel: "Selecione a conexão de destino",
        sourceConnection: {
          label: "Conexão de origem",
          status: {
            active: "Ativa",
            inactive: "Inativa"
          }
        },
        buttons: {
          cancel: "Cancelar",
          confirm: "Transferir e Excluir"
        },
        success: "Tickets transferidos com sucesso!",
        error: "Erro ao transferir os tickets. Tente novamente."
      },
      queueIntegration: {
        title: "Integrações",
        noIntegrationsFound: "Nenhuma integração configurada",
        addYourFirstIntegration: "Comece configurando sua primeira integração para otimizar o atendimento.",
        table: {
          id: "ID",
          type: "Tipo",
          name: "Nome",
          projectName: "Nome do Projeto",
          language: "Linguagem",
          lastUpdate: "Ultima atualização",
          actions: "Ações",
        },
        buttons: {
          add: "Adicionar Projeto",
          edit: "Editar",
          delete: "Excluir"
        },
        toasts: {
          deleted: "Integração excluída com sucesso.",
        },
        searchPlaceholder: "Pesquisar...",
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage:
            "Você tem certeza? Essa ação não pode ser revertida! e será removido dos setores e conexões vinculadas",
        },
        form: {
          n8nApiKey: "Chave API do n8n",
        },
      },
      files: {
        title: "Lista de Arquivos",
        empty: {
          title: "Nenhuma arquivo encontrado",
          message: "Comece enviando seu primeiro arquivo que poderá ser anexado em uma mensagem de campanha.",
        },
        searchPlaceholder: "Buscar por nome do arquivo...",
        buttons: {
          add: "Adicionar Arquivo",
          upload: "Adicionar Arquivo",
          edit: "Editar",
          delete: "Excluir",
        },
        table: {
          name: "Nome",
          actions: "Ações",
          noFiles: "Nenhum arquivo encontrado",
        },
        toasts: {
          deleted: "Arquivo excluído com sucesso",
          error: "Erro ao executar operação",
        },
        tooltips: {
          searchFiles: "Buscar arquivos",
          addNew: "Adicionar novo arquivo",
          editFile: "Editar arquivo",
          deleteFile: "Excluir arquivo",
        },
        deleteDialog: {
          title: "Excluir Arquivo",
          message: "Tem certeza que deseja excluir este arquivo?",
          confirmButton: "Sim, excluir",
          cancelButton: "Cancelar",
        },
      },
      messagesAPI: {
        title: "API",
        contactNumber: "Nº do contato",
        contactName: "Nome do contato",
        contactEmail: "E-mail do contato",
        statusCompany: "Status da empresa",
        searchParam: "Nome ou número do contato",
        pageNumber: "Nº da página para realizar a paginação",
        doc: "Documentação para envio de mensagens:",
        formMethod: "Método de envio:",
        token: "Token cadastrado",
        apiToken: "Token Cadastrado",
        ticketId: "ID do Ticket",
        queueId: "ID do Setor",
        status: "Status do ticket",
        id: "ID da Fatura",
        updateFields: "Dados a serem atualizados",
        updateData: "Dados a serem atualizados",
        queue: "Setor",
        tags: "Tags",
        tagId: "ID da Tag",
        invoiceId: "ID da Fatura",
        companyId: "ID da Empresa",
        body: "Mensagem",
        contactData: "Dados do contato",
        contactId: "ID do Contato",
        file: "Arquivo",
        number: "Número",
        pdfLink: "Link do PDF",
        medias: "Mídias",
        imageLink: "Link de imagem",
        audioLink: "Link de audio",
        textMessage: {
          number: "Número",
          body: "Mensagem",
          token: "Token cadastrado",
        },
        mediaMessage: {
          number: "Número",
          body: "Nome do arquivo",
          media: "Arquivo",
          token: "Token cadastrado",
        },
        buttons: {
          submit: "Enviar",
        },
        helpTexts: {
          textMsg: {
            title: "Mensagem de Texto",
            info: "Seguem abaixo a lista de informações necessárias para ",
            endpoint: "Endpoint: ",
            method: "Método: ",
            headers: "Headers: ",
            body: "Body: ",
          },
          test: "Teste de envio: ",
          mediaMsg: {
            title: "Mensagem de Média",
            info: "Seguem abaixo a lista de informações necessárias para ",
            endpoint: "Endpoint: ",
            method: "Método: ",
            headers: "Headers: ",
            body: "Body: ",
            formData: "FormData: ",
          },
          instructions: "Instruções",
          notes: {
            title: "Observações importantes",
            textA:
              "Antes de enviar mensagens, é necessário o cadastro do token vinculado à conexão que enviará as mensagens. <br/>Para realizar o cadastro acesse o menu 'Conexões', clique no botão editar da conexão e insira o token no devido campo.",
            textB: {
              title:
                "O número para envio não deve ter mascara ou caracteres especiais e deve ser composto por:",
              partA: "Código do País",
              partB: "DDD",
              partC: "Número",
            },
          },
          info: "Seguem abaixo a lista de informações necessárias para ",
          endpoint: "Endpoint: ",
          method: "Método: ",
          headers: "Headers: ",
          body: "Body: ",
        },
        apiRoutes: {
          token: "Token para validacao da conexao",
        },
      },
      notifications: {
        title: "Mensagens",
        message: "mensagem",
        messages: "mensagens",
        noTickets: "Nenhuma mensagem não lida.",
        clearAll: "Limpar todas",
        cleared: "Notificações limpas com sucesso!",
        clearError: "Erro ao limpar notificações!",
        newMessage: "Nova mensagem",
        permissionGranted: "Permissão para notificações concedida!",
        permissionDenied: "Permissão para notificações negada. Ative nas configurações do navegador.",
        permissionError: "Erro ao solicitar permissão para notificações.",
        enableNotifications: "Ativar notificações"
      },
      quickMessages: {
        title: "Respostas Rápidas",
        searchPlaceholder: "Pesquisar...",
        noAttachment: "Sem anexo",
        permission: "Apenas administradores e supervisores podem editar",
        confirmationModal: {
          deleteTitle: "Excluir resposta rápida",
          deleteMessage: "Esta ação é irreversível! Deseja prosseguir?",
        },
        buttons: {
          add: "Adicionar Resposta Rápida",
          attach: "Anexar Arquivo",
          cancel: "Cancelar",
          edit: "Editar",
          delete: "Excluir",
          startRecording: "Iniciar Gravação",
          stopRecording: "Parar Gravação",
          playAudio: "Reproduzir Áudio",
          save: "Salvar",
        },
        toasts: {
          success: "Resposta rápida adicionada com sucesso!",
          deleted: "Resposta rápida removida com sucesso!",
          error: "Erro ao processar resposta rápida",
        },
        dialog: {
          title: "Resposta Rápida",
          shortcode: "Atalho",
          message: "Resposta",
          save: "Salvar",
          cancel: "Cancelar",
          geral: "Permitir edição",
          add: "Adicionar",
          edit: "Editar",
          visao: "Permitir visualização",
          no: "Não",
          yes: "Sim",
          geralHelper:
            "Permitir que todos os usuários editem essa resposta rápida",
          recordedAudio: "Áudio gravado",
          validation: {
            required: "Este campo é obrigatório",
            minLength: "Mínimo de 3 caracteres",
            maxLength: "Máximo de 255 caracteres",
          },
        },
        table: {
          shortcode: "Atalho",
          message: "Mensagem",
          actions: "Ações",
          mediaName: "Nome do Arquivo",
          status: "Status",
          media: "Mídia",
          permissions: "Permissões",
          createdAt: "Criado em",
          updatedAt: "Atualizado em",
        },
      },
      mediaInput: {
        previewTitle: "Preview de Mídia",
        caption: "Adicione uma legenda...",
        captions: "Legendas",
        addTag: "Adicionar tag (hashtag)",
        duplicate: "Duplicar",
        attach: "Anexar arquivo(s)",
        contact: "Contatos",
        metadata: {
          title: "Título",
          name: "Nome",
          type: "Tipo",
          size: "Tamanho",
          modified: "Modificado em:",
        },
        buttons: {
          crop: "Recortar imagem",
          draw: "Desenhar na imagem",
          zoomIn: "Aumentar zoom",
          showMetadata: "Exibir metadados do arquivo",
          zoomOut: "Diminuir zoom",
          addTag: "Adicionar hastag",
          duplicate: "Duplicar",
          delete: "Excluir",
          cancel: "Cancelar",
          send: "Enviar",
          fullscreen: "Entrar em tela cheia",
          download: "Fazer download",
          copy: "Copiar"
        }
      },
      messageVariablesPicker: {
        label: "Variavéis disponíveis",
        vars: {
          contactFirstName: "Primeiro Nome",
          contactName: "Nome",
          ticketId: "ID do Ticket",
          user: "Usuário",
          greeting: "Saudação",
          ms: "Milissegundos",
          hour: "Hora",
          date: "Data",
          queue: "Setor",
          connection: "Conexão",
          dataHora: "Data e Hora",
          protocolNumber: "N. Protocolo",
          nameCompany: "Nome da Empresa",
        },
      },
      contactLists: {
        title: "Listas de Contatos",
        table: {
          name: "Nome",
          contacts: "Contatos",
          actions: "Ações",
        },
        buttons: {
          add: "Nova Lista",
        },
        dialog: {
          name: "Nome",
          company: "Empresa",
          okEdit: "Editar",
          okAdd: "Adicionar",
          add: "Adicionar",
          edit: "Editar",
          cancel: "Cancelar",
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage: "Esta ação não pode ser revertida.",
        },
        toasts: {
          deleted: "Registro excluído",
        },
      },
      announcements: {
        active: "Ativo",
        inactive: "Inativo",
        title: "Informativos",

        searchPlaceholder: "Pesquisa",
        buttons: {
          add: "Novo Informativo",
          contactLists: "Listas de Informativos",
        },
        emptyState: {
          title: "Nenhum informativo disponível",
          message: "Nenhum comunicado encontrado. Clique em 'Novo Informativo' para criar o primeiro!",
          button: "Novo Informativo"
        },
        form: {
          title: "Título do Informativo",
          uploadMedia: "Anexar arquivo(s)",
          priority: "Prioridade do Informativo",
        },
        table: {
          priority: "Prioridade",
          title: "Título",
          text: "Texto",
          mediaName: "Arquivo",
          status: "Status",
          actions: "Ações",
          createdAt: "Data de Criação",
        },
        modal: {
          addTitle: "Criando novo informativo",
          editTitle: "Editando informativo"
        },
        priority: {
          low: "Baixa",
          medium: "Media",
          high: "Alta"
        },
        dialog: {
          edit: "Edição de Informativo",
          add: "Novo Informativo",
          update: "Editar Informativo",
          readonly: "Apenas Visualização",
          form: {
            priority: "Prioridade",
            title: "Título",
            text: "Texto",
            mediaPath: "Arquivo",
            status: "Status",
          },
          buttons: {
            add: "Adicionar",
            edit: "Atualizar",
            okadd: "Ok",
            cancel: "Cancelar",
            close: "Fechar",
            attach: "Anexar Arquivo",
          },
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage: "Esta ação não pode ser revertida.",
        },
        toasts: {
          success: "Operação realizada com sucesso",
          deleted: "Registro excluído",
        },
        tooltips: {
          addNew: "Adiciona um novo informativo",
          listView: "Alterna para o modo de exibição em lista",
          cardView: "Alterna para o modo de exibição em cartão",
        },
      },
      queues: {
        title: "Setores & Chatbot",
        noDataFound: "Nenhum setor encontrado.",
        noDataFoundMessage: "Parece que ainda não há setores cadastrados. Adicione um novo e otimize sua comunicação!",
        table: {
          id: "ID",
          name: "Nome",
          color: "Cor",
          greeting: "Mensagem de saudação",
          actions: "Ações",
          orderQueue: "Ordenação do Setor (bot)",
        },
        buttons: {
          add: "Adicionar setor",
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage:
            "Você tem certeza? Essa ação não pode ser revertida! Os atendimentos desse setor continuarão existindo, mas não terão mais nenhum setor atribuído.",
        },
        toasts: {
          success: "Operação realizada com sucesso",
          deleted: "Setor excluído com sucesso",
        },
      },
      queueSelect: {
        inputLabel: "Setores",
      },
      users: {
        title: "Usuários",
        userUser: "Tornar SuperAdmin",
        table: {
          name: "Nome",
          email: "Email",
          profile: "Perfil",
          status: "Status",
          actions: "Ações",
        },
        buttons: {
          add: "Adicionar Usuário",
          edit: "Editar Usuário",
          delete: "Excluir Usuário",
          duplicate: "Duplicar Usuário",
          listView: "Visualização em Lista",
          cardView: "Visualização em Cards",
        },
        labels: {
          selectCompany: "Selecionar Empresa",
          allCompanies: "Todas as Empresas",
        },
        roles: {
          admin: "Administrador",
          user: "Usuário",
          superv: "Supervisor",
        },
        profile: {
          admin: "Administrador",
          user: "Usuário",
          superv: "Supervisor",
        },
        confirmationModal: {
          deleteTitle: "Confirmar exclusão",
          deleteMessage: "Tem certeza que deseja excluir este usuário?",
        },
        toasts: {
          deleted: "Usuário excluído com sucesso",
          deleteError: "Erro ao excluir usuário",
          duplicated: "Usuário duplicado com sucesso",
          duplicateError: "Erro ao duplicar usuário",
          loadUsersError: "Erro ao carregar usuários",
          loadCompaniesError: "Erro ao carregar empresas",
        },
        status: {
          online: "Online:",
          offline: "Offline:",
        },
        superUserIndicator: "Usuário Super Admin",
      },
      stripe: {
        title: "Configurações do Stripe",
        publicKey: "Chave Pública",
        secretKey: "Chave Secreta",
        webhookSecret: "Chave do Webhook",
        webhookUrl: "URL do Webhook",
        publicKeyTooltip: "Chave pública do Stripe (pk_...)",
        secretKeyTooltip: "Chave secreta do Stripe (sk_...)",
        webhookSecretTooltip: "Chave secreta do webhook (whsec_...)",
        webhookUrlTooltip: "Use esta URL ao configurar o webhook no painel do Stripe"
      },
      compaies: {
        title: {
          main: "Empresas",
          add: "Cadastrar empresa",
          edit: "Editar empresa",
        },
        table: {
          id: "ID",
          status: "Ativo",
          name: "Nome",
          email: "Email",
          passwordDefault: "Senha",
          numberAttendants: "Atendentes",
          numberConections: "Conexões",
          value: "Valor",
          namePlan: "Nome Plano",
          numberQueues: "Setores",
          useCampaigns: "Campanhas",
          useExternalApi: "Rest API",
          useFacebook: "Facebook",
          useInstagram: "Instagram",
          useWhatsapp: "Whatsapp",
          useInternalChat: "Chat Interno",
          useSchedules: "Agendamento",
          createdAt: "Criada Em",
          dueDate: "Vencimento",
          lastLogin: "Ult. Login",
          folderSize: "Tamanho da Pasta",
          numberOfFiles: "Número de Arquivos",
          lastUpdate: "Última Atualização",
          actions: "Ações",
        },
        buttons: {
          add: "Adicionar empresa",
          cancel: "Cancelar alterações",
          okAdd: "Salvar",
          okEdit: "Alterar",
        },
        toasts: {
          deleted: "Empresa excluído com sucesso.",
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage:
            "Todos os dados da empresa serão perdidos. Os tickets abertos deste usuário serão movidos para o setor.",
        },
      },
      helps: {
        title: "Ajuda e API",
        videoTab: "Vídeos de Ajuda",
        apiTab: "Documentação API",
        empty: {
          title: "Nenhum video disponivel",
          message: "No momento nao ha videos de ajuda cadastrados no sistema."
        },
        buttons: {
          add: "Adicionar video"
        }
      },
      schedules: {
        // Página principal
        title: "Agendamentos",
        searchPlaceholder: "Buscar agendamentos...",
        loading: "Carregando agendamentos...",
        emptyState: {
          title: "Nenhum agendamento encontrado",
          description: "Crie um novo agendamento ou ajuste os filtros de busca"
        },
        buttons: {
          add: "Novo Agendamento",
          addShort: "Novo",
          edit: "Editar",
          delete: "Excluir",
          save: "Salvar",
          create: "Criar",
          cancel: "Cancelar",
          close: "Fechar",
          filter: "Filtrar",
          calendarView: "Visualização de Calendário",
          listView: "Visualização em Lista",
          refresh: "Atualizar",
          view: "Ver detalhes",
          download: "Baixar anexo"
        },

        // Filtros e tabs
        filters: {
          all: "Todos os agendamentos",
          pending: "Pendentes",
          sent: "Enviados",
          error: "Com erro",
          allConnections: "Todas as conexões",
          whatsappConnection: "Filtrar por conexão"
        },
        tabs: {
          today: "Hoje",
          pending: "Pendentes",
          sent: "Enviados"
        },

        // Estatísticas
        stats: {
          total: "Total de agendamentos",
          pending: "Pendentes",
          sent: "Enviados",
          error: "Com erro"
        },

        // Status dos agendamentos
        status: {
          sent: "Enviado",
          pending: "Pendente",
          error: "Erro",
          processing: "Processando",
          cancelled: "Cancelado",
          unknown: "Desconhecido"
        },

        // Formulário de criação/edição
        form: {
          titleAdd: "Novo Agendamento",
          titleEdit: "Editar Agendamento",
          contactSection: "Contato",
          messageSection: "Mensagem",
          messagePlaceholder: "Digite a mensagem a ser enviada...",
          scheduleSection: "Agendamento",
          recurrenceSection: "Recorrência",
          whatsappSection: "Conexão que será utilizada",
          selectWhatsapp: "Selecione a conexão",
          sendAt: "Data e hora de envio",
          sendAtHelp: "A mensagem será enviada automaticamente nesta data e hora",
          enableRecurrence: "Habilitar recorrência",
          recurrencePattern: "Padrão de recorrência",
          recurrenceEndDate: "Data de término da recorrência",
          recurrenceHelp: "As mensagens serão enviadas repetidamente até a data de término",
          attachment: "Anexo",
          attachmentHelp: "Tamanho máximo: 5MB",
          insertEmoji: "Inserir emoji",
          uploadImage: "Enviar imagem",
          noActiveWhatsapp: "Nenhuma conexão ativa"
        },

        // Recorrência
        recurrence: {
          none: "Sem recorrência",
          daily: "Diariamente",
          weekly: "Semanalmente",
          biweekly: "A cada duas semanas",
          monthly: "Mensalmente",
          quarterly: "Trimestralmente",
          semiannually: "Semestralmente",
          yearly: "Anualmente"
        },

        // Modal de detalhes
        scheduleDetails: {
          title: "Detalhes do Agendamento",
          contactInfo: "Informações do Contato",
          details: "Detalhes",
          message: "Mensagem",
          attachment: "Anexo",
          createdAt: "Criado em",
          sendAt: "Agendado para",
          sentAt: "Enviado em",
          recurrence: "Recorrência",
          recurrenceEnd: "Término da recorrência",
          createdBy: "Criado por",
          errorTitle: "Erro no envio",
          whatsappConnection: "Conexão que será utilizada",
          errorMessage: "Ocorreu um erro ao tentar enviar esta mensagem",
          downloadError: "Erro ao baixar anexo",
          buttons: {
            close: "Fechar",
            edit: "Editar",
            delete: "Excluir",
            download: "Baixar"
          },
          contact: "Contato",
          status: {
            sent: "Enviado",
            pending: "Pendente",
            error: "Erro",
            processing: "Processando",
            cancelled: "Cancelado",
            unknown: "Desconhecido"
          },
          recurrence: {
            title: "Recorrência",
            none: "Sem recorrência",
            daily: "Diariamente",
            weekly: "Semanalmente",
            biweekly: "A cada duas semanas",
            monthly: "Mensalmente",
            quarterly: "Trimestralmente",
            semiannually: "Semestralmente",
            yearly: "Anualmente"
          }
        },

        // Componente de seleção de contato
        selectContact: "Selecione um contato",
        loadingContacts: "Carregando contatos...",
        noContactsFound: "Nenhum contato encontrado",
        contactSelectError: "Erro ao carregar contatos",

        // Mensagens de validação
        validation: {
          bodyRequired: "Mensagem é obrigatória",
          bodyMinLength: "Mensagem deve ter pelo menos 5 caracteres",
          contactRequired: "É necessário selecionar um contato",
          sendAtRequired: "Data de envio é obrigatória",
          futureDateRequired: "A data de envio deve ser futura",
          patternRequired: "Padrão de recorrência é obrigatório",
          endDateRequired: "Data final da recorrência é obrigatória",
          endDateAfterSendAt: "Data final deve ser posterior à data de envio"
        },

        // Mensagens de toast (notificações)
        toasts: {
          created: "Agendamento criado com sucesso",
          updated: "Agendamento atualizado com sucesso",
          deleted: "Agendamento excluído com sucesso",
          attachmentDeleted: "Anexo removido com sucesso",
          loadError: "Erro ao carregar agendamentos",
          saveError: "Erro ao salvar agendamento",
          deleteError: "Erro ao excluir agendamento",
          attachmentError: "Erro ao enviar anexo",
          attachmentDeleteError: "Erro ao excluir anexo",
          contactLoadError: "Erro ao carregar contatos",
          fileSizeError: "O arquivo deve ter no máximo 5MB"
        },

        // Configurações do calendário
        calendar: {
          date: "Data",
          time: "Hora",
          event: "Evento",
          allDay: "Dia inteiro",
          week: "Semana",
          work_week: "Semana de trabalho",
          day: "Dia",
          month: "Mês",
          previous: "Anterior",
          next: "Próximo",
          yesterday: "Ontem",
          tomorrow: "Amanhã",
          today: "Hoje",
          agenda: "Agenda",
          noEventsInRange: "Não há agendamentos neste período"
        },

        // Confirmação de exclusão 
        confirmationModal: {
          deleteTitle: "Excluir Agendamento",
          deleteMessage: "Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita."
        },

        // Componentes específicos
        attachment: "Anexo",
        unknownContact: "Contato desconhecido"
      },
      validation: {
        required: "Este campo é obrigatório",
        invalidTime: "Formato de hora inválido",
        endBeforeStart: "A hora final não pode ser anterior à hora inicial",
        lunchOutsideWork: "O horário de almoço deve estar dentro do horário de trabalho",
        lunchEndBeforeStart: "O fim do almoço não pode ser anterior ao início do almoço",
        completeLunchTime: "Preencha ambos os horários de almoço ou deixe ambos em branco"
      },
      contactPicker: {
        label: "Selecionar Contato",
        typeMore: "Digite pelo menos 2 caracteres para buscar",
        noOptions: "Nenhum contato encontrado",
        loading: "Carregando...",
        noResultsFound: "Nenhum resultado encontrado para esta busca",
        errorFetching: "Erro ao buscar contatos",
        errorFetchingInitial: "Erro ao carregar contato inicial"
      },
      subscriptionBanner: {
        message:
          "Seu período de teste termina em {{days}} dias e {{hours}} horas. Assine agora para evitar interrupções no serviço!",
        subscribe: "Assinar Agora",
      },
      common: {
        create: "Salvar",
        close: "Fechar",
        edit: "Editar",
        save: "Salvar",
        delete: "Excluir",
        cancel: "Cancelar",
        apply: "Filtrar",
        clear: "Limpar",
        rowsPerPage: "Resultados por página(s):",
        displayedRows: "Página(s):",
      },
      serviceHours: {
        collapse: "Recolher",
        expand: "Expandir",
        workingHours: "Horário de Funcionamento",
        workTime: "Horário de Trabalho",
        startTime: "Horário de Início",
        endTime: "Horário de Término",
        lunchTime: "Horário de Almoço",
        startLunchTime: "Início do Almoço",
        endLunchTime: "Término do Almoço",
        formAriaLabel: "Formulário de Horários Comerciais",
        successMessage: "Horários atualizados com sucesso!",
        defaultError: "Erro ao salvar horários. Verifique os dados informados.",
        optional: "Opcional",
        optionalField: "Campo opcional",
        validation: {
          required: "Campo obrigatório",
          invalidTime: "Formato de hora inválido (use HH:MM)",
          endBeforeStart: "Horário final não pode ser anterior ao inicial",
          lunchOutsideWork: "Horário de almoço deve estar dentro do expediente",
          lunchEndBeforeStart: "Término do almoço não pode ser anterior ao início",
          completeLunchTime: "Preencha ambos os horários de almoço ou deixe em branco"
        },
        daysweek: {
          day1: "Segunda-feira",
          day2: "Terça-feira",
          day3: "Quarta-feira",
          day4: "Quinta-feira",
          day5: "Sexta-feira",
          day6: "Sábado",
          day7: "Domingo"
        },
      },
      tags: {
        title: "Gerenciamento de Tags",
        searchPlaceholder: "Buscar tags...",
        emptyState: {
          title: "Nenhuma tag encontrada",
          message: "Crie tags para organizar seus tickets e contatos. As tags podem ser usadas em filtros, relatórios e no quadro Kanban."
        },
        filters: {
          allTags: "Todas as tags",
          onlyKanban: "Apenas kanban",
          onlyNonKanban: "Sem kanban"
        },
        buttons: {
          add: "Nova tag",
          export: "Exportar",
          bulkActions: "Ações em massa"
        },
        table: {
          id: "ID",
          name: "Nome",
          tickets: "Tickets",
          kanban: "Kanban",
          actions: "Ações"
        },
        form: {
          title: {
            new: "Nova Tag",
            edit: "Editar Tag"
          },
          fields: {
            name: "Nome",
            color: "Cor"
          },
          colorHelp: "Clique para escolher a cor da tag",
          validation: {
            nameRequired: "O nome é obrigatório",
            nameMin: "O nome deve ter no mínimo 2 caracteres",
            nameMax: "O nome deve ter no máximo 50 caracteres",
            colorRequired: "A cor é obrigatória"
          },
          buttons: {
            cancel: "Cancelar",
            create: "Criar",
            update: "Atualizar"
          },
          success: {
            create: "Tag criada com sucesso!",
            update: "Tag atualizada com sucesso!"
          },
          error: "Erro ao salvar a tag"
        },
        bulk: {
          title: "Criar Tags em Massa",
          help: "Crie múltiplas tags com um padrão de nomenclatura",
          form: {
            quantity: "Quantidade",
            pattern: "Padrão de nome",
            kanban: "Incluir no Kanban"
          },
          patterns: {
            tag: "tag_{n}",
            ticket: "ticket_{n}",
            priority: "prioridade_{n}",
            status: "status_{n}",
            department: "depto_{n}",
            day: "dia_{n}"
          },
          validation: {
            quantity: {
              required: "A quantidade é obrigatória",
              min: "A quantidade mínima é 1",
              max: "A quantidade máxima é 100"
            },
            pattern: {
              required: "O padrão de nome é obrigatório"
            }
          },
          buttons: {
            cancel: "Cancelar",
            create: "Criar Tags"
          }
        },
        confirmationModal: {
          deleteTitle: "Excluir Tag",
          deleteMessage: "Esta ação não pode ser desfeita. Deseja continuar?",
          deleteSelectedTitle: "Excluir Tags Selecionadas",
          deleteSelectedMessage: "Você está prestes a excluir as tags selecionadas. Esta ação não pode ser desfeita. Deseja continuar?"
        },
        toasts: {
          deleted: "Tag(s) excluída(s) com sucesso!",
          deleteError: "Erro ao excluir tag(s)",
          updated: "Tag(s) atualizada(s) com sucesso!",
          updateError: "Erro ao atualizar tag(s)",
          loadError: "Erro ao carregar tags"
        },
        notifications: {
          bulkCreated: "Tags criadas com sucesso!",
          bulkError: "Erro ao criar tags em massa"
        }
      },
      settings: {
        loading: "Carregando configurações...",
        loadError: "Erro ao carregar configurações",
        title: "Configurações",
        tabs: {
          general: "Geral",
          messaging: "Mensagens",
          notifications: "Notificações",
          security: "Segurança",
          chatbot: "Chatbot",
          integrations: "Integrações",
          company: "Empresa",
          admin: "Admin",
          companies: "Empresas",
          plans: "Planos",
          helps: "Ajuda",
          params: "Parâmetros",
          schedules: "Horários",
        },
        general: {
          title: "Configurações Gerais",
          subtitle: "Gerencie as configurações básicas do sistema",
          tickets: {
            title: "Tickets",
            oneTicketPerConnection: "Um ticket por conexão",
            oneTicketPerConnectionHelper:
              "Limita a criação de tickets a um por conexão",
            showValueAndSku: "Exibir valor e SKU",
            showValueAndSkuHelper:
              "Mostra informações de valor e SKU nos tickets",
          },

          schedule: {
            title: "Agendamento",
            disabled: "Desativado",
            company: "Por empresa",
            queue: "Por setor",
            helper: "Define como o agendamento de mensagens funcionará",
          },

          rating: {
            title: "Avaliação",
            enable: "Habilitar avaliação",
            helper: "Permite que os usuários avaliem o atendimento",
          },

          contact: {
            title: "Contato",
            showNumber: "Exibir número de contato",
            showNumberHelper:
              "Mostra o número de contato nas informações do ticket",
          },
        },

        messaging: {
          title: "Configurações de Mensagens",
          subtitle: "Gerencie como as mensagens são tratadas no sistema",

          quickResponses: {
            title: "Respostas Rápidas",
            byCompany: "Por empresa",
            byUser: "Por usuário",
            helper: "Define como as respostas rápidas são organizadas",
          },

          greetings: {
            title: "Saudações",
            sendOnAccept: "Enviar ao aceitar ticket",
            sendOnAcceptHelper:
              "Envia mensagem automática quando um ticket é aceito",
            sendOnSingleQueue: "Enviar em setor único",
            sendOnSingleQueueHelper:
              "Envia mensagem automática quando há apenas um setor",
          },

          groups: {
            title: "Grupos",
            ignoreGroups: "Ignorar mensagens de grupos",
            ignoreGroupsHelper: "Não cria tickets para mensagens de grupos",
          },

          transfer: {
            title: "Transferência",
            notifyOnTransfer: "Notificar transferência",
            notifyOnTransferHelper:
              "Notifica usuários quando um ticket é transferido",
          },

          ai: {
            title: "Inteligência Artificial",
            alert: "Recursos de IA podem estar sujeitos a cobranças adicionais",
            summarize: "Resumir conversas",
            summarizeHelper: "Gera resumos automáticos das conversas usando IA",
          },
        },

        notifications: {
          title: "Configurações de Notificações",
          subtitle: "Gerencie como as notificações são enviadas",

          register: {
            title: "Registro",
            sendEmail: "Enviar email no registro",
            sendEmailHelper: "Envia email de boas-vindas para novos usuários",
            sendMessage: "Enviar mensagem no registro",
            sendMessageHelper:
              "Envia mensagem de boas-vindas para novos usuários",
          },

          email: {
            title: "Email",
            smtpServer: "Servidor SMTP",
            smtpServerHelper: "Endereço do servidor SMTP",
            smtpPort: "Porta SMTP",
            smtpPortHelper: "Porta do servidor SMTP",
            smtpUser: "Usuário SMTP",
            smtpUserHelper: "Usuário para autenticação SMTP",
            smtpPassword: "Senha SMTP",
            smtpPasswordHelper: "Senha para autenticação SMTP",
            testSuccess: "Teste de SMTP realizado com sucesso",
            testTooltip: "Testar configurações de SMTP",
            smtpRequired:
              "Configurações SMTP são necessárias para envio de emails",
            smtpInfo: "Saiba mais sobre configurações SMTP",
          },

          ticket: {
            title: "Tickets",
            notifyTransfer: "Notificar transferência",
            notifyTransferHelper: "Notifica quando um ticket é transferido",
            requireReason: "Exigir motivo ao fechar",
            requireReasonHelper: "Solicita motivo quando um ticket é fechado",
          },
        },

        security: {
          title: "Configurações de Segurança",
          subtitle: "Gerencie as configurações de segurança do sistema",

          access: {
            title: "Acesso",
            allowSignup: "Permitir cadastro",
            allowSignupHelper: "Permite que novos usuários se cadastrem",
          },

          apiToken: {
            title: "Token API",
            label: "Token de acesso à API",
            warning: "Mantenha este token em segurança",
            helper: "Token para integração com a API",
            generated: "Novo token gerado com sucesso",
            deleted: "Token removido com sucesso",
            copied: "Token copiado para área de transferência",
            error: "Erro ao gerenciar token",
            info: "Use este token para autenticar requisições à API",
          },

          limits: {
            title: "Limites",
            downloadLimit: "Limite de download",
            downloadLimitHelper: "Tamanho máximo para download de arquivos",
          },
        },

        chatbot: {
          title: "Configurações do Chatbot",
          subtitle: "Gerencie as configurações do chatbot",

          general: {
            title: "Geral",
            show: "Mostrar chatbot no menu",
            showHelper: "Exibe o chatbot no menu principal",
          },

          types: {
            text: "Texto",
            button: "Botão",
            list: "Lista",
            helper: "Define o tipo de interface do chatbot",
          },

          ai: {
            title: "Inteligência Artificial",
            info: "Configure os recursos de IA do chatbot",
            modelHelper: "Escolha o modelo de IA a ser usado",
            summarize: "Resumir conversas",
            summarizeHelper: "Gera resumos das conversas automaticamente",
          },

          webhook: {
            title: "Webhook",
            url: "URL do Webhook",
            urlHelper: "Endereço para envio de eventos",
            test: "Testar Webhook",
            testSuccess: "Teste realizado com sucesso",
            testError: "Erro ao testar webhook",
            required: "URL do webhook é obrigatória",
            invalid: "URL inválida",
            enableN8N: "Habilitar N8N",
            enableN8NHelper: "Integra com a plataforma N8N",
          },
        },

        integrations: {
          title: "Integrações",
          subtitle: "Gerencie as integrações do sistema",
          warning: "Configure as integrações com cuidado",
          enable: "Habilitar",
          save: "Salvar",


        },

        company: {
          title: "Configurações da Empresa",
          subtitle: "Gerencie as configurações da sua empresa",

          branding: {
            title: "Identidade Visual",
            logo: "Logo",
            background: "Plano de Fundo",
            upload: "Enviar arquivo",
            logoHelper: "Logo da empresa (máx. 1MB)",
            backgroundHelper: "Imagem de fundo (máx. 2MB)",
          },

          omie: {
            title: "Omie",
            enable: "Habilitar Omie",
            enableHelper: "Integra com a plataforma Omie",
            appKey: "Chave da Aplicação",
            appSecret: "Chave Secreta",
            info: "Configure a integração com o Omie",
            sync: "Sincronizar",
            syncSuccess: "Sincronização realizada com sucesso",
            syncError: "Erro na sincronização",
          },
        },

        admin: {
          title: "Configurações de Administrador",
          subtitle: "Gerencie as configurações administrativas",
          warning: "Estas configurações afetam todo o sistema",
          unauthorized: {
            title: "Acesso Não Autorizado",
            message: "Você não tem permissão para acessar estas configurações",
          },

          trial: {
            title: "Período de Teste",
            days: "dias",
            helper: "Define a duração do período de teste",
            warning: "Alterar este valor afeta novos registros",
          },

          connections: {
            title: "Conexões",
            enableAll: "Habilitar todas as conexões",
            enableAllHelper: "Permite todas as conexões no sistema",
          },

          support: {
            title: "Suporte",
            enable: "Habilitar suporte",
            enableHelper: "Ativa o sistema de suporte",
            phone: "Telefone de suporte",
            message: "Mensagem de suporte",
            test: "Testar suporte",
            testSuccess: "Teste realizado com sucesso",
            testError: "Erro ao testar suporte",
          },

          advanced: {
            title: "Avançado",
            warning: "Altere estas configurações com cautela",
            allowSignup: "Permitir cadastros",
            allowSignupHelper: "Permite novos cadastros no sistema",
          },
        },

        validation: {
          error: "Erro de validação",
        },

        updateSuccess: "Configuração atualizada com sucesso",
        updateError: "Erro ao atualizar configuração",
        genericError: "Ocorreu um erro ao processar a solicitação",
      },
      messagesList: {
        header: {
          assignedTo: "Atribuído à:",
          dialogRatingTitle:
            "Deseja deixar uma avaliação de atendimento para o cliente?",
          dialogClosingTitle: "Encerrando o atendimento!",
          dialogRatingCancel: "Resolver com Mensagem de Encerramento",
          dialogRatingSuccess: "Resolver e Enviar Avaliação",
          dialogRatingWithoutFarewellMsg:
            "Resolver sem Mensagem de Encerramento",
          ratingTitle: "Escolha um menu de avaliação",
          buttons: {
            return: "Retornar",
            resolve: "Resolver",
            reopen: "Reabrir",
            accept: "Aceitar",
            rating: "Enviar Avaliação",
          },
        },
        confirm: {
          resolveWithMessage: "Enviar mensagem de conclusão?",
          yes: "Sim",
          no: "Não",
        },
      },
      messagesInput: {
        recording: {
          tooltip: "Gravar áudio",
        },
        attach: "Anexar arquivo(s)",
        placeholderOpen: "Digite uma mensagem",
        placeholderClosed:
          "Reabra ou aceite esse ticket para enviar uma mensagem.",
        signMessage: "Assinar",
        invalidFileType: "Tipo de arquivo inválido."
      },
      message: {
        forwarded: "Mensagem encaminhada",
        edited: "Mensagem editada",
        deleted: "Mensagem apagada pelo Contato",
      },
      contactDrawer: {
        header: "Dados do contato",
        buttons: {
          edit: "Editar contato",
        },
        extraInfo: "Outras informações",
        employerInfo: "Informações da Empresa",
        loadingEmployerInfo: "Carregando informações da empresa...",
        noEmployerCustomFields: "Nenhum campo personalizado adicionado",
        tabs: {
          notes: "Anotações",
          appointments: "Agendamentos",
          info: "Informações",
          settings: "Configurações",
           participants: "Participantes"
        },
        settings: "Configurações",
        noExtraInfo: "Nenhuma informação adicional cadastrada",
        groupType: "Grupo",
        groupParticipants: "Participantes do Grupo",
        loadingParticipants: "Carregando participantes...",
        searchParticipants: "Buscar participantes",
        noParticipantsFound: "Nenhum participante encontrado",
        tryAnotherSearch: "Tente uma nova busca com outros termos",
        noParticipantsInGroup: "Este grupo não possui participantes",
        admin: "Admin",
        errors: {
          parsingParticipantsFailed: "Erro ao processar dados dos participantes",
          loadingParticipantsFailed: "Erro ao carregar participantes do grupo"
        }
      },
      fileModal: {
        title: {
          add: "Adicionar lista de arquivos",
          edit: "Editar lista de arquivos",
        },
        buttons: {
          okAdd: "Salvar",
          okEdit: "Editar",
          cancel: "Cancelar",
          fileOptions: "Adicionar arquivo",
        },
        form: {
          name: "Nome da lista de arquivos",
          message: "Detalhes da lista",
          fileOptions: "Lista de arquivos",
          extraName: "Mensagem para enviar com arquivo",
          extraValue: "Valor da opção",
        },
        success: "Lista de arquivos salva com sucesso!",
      },
      ticketOptionsMenu: {
        schedule: "Agendamento",
        delete: "Deletar",
        transfer: "Transferir",
        registerAppointment: "Observações do Contato",
        resolveWithNoFarewell: "Finalizar Sem Mensagem de Encerramento",
        acceptAudioMessage: "Permitir Áudio?",
        appointmentsModal: {
          title: "Observações do Contato",
          textarea: "Observação",
          placeholder: "Insira aqui a informação que deseja registrar",
        },
        confirmationModal: {
          title: "Deletar o ticket do contato",
          titleFrom: "Deseja realmente deletar o ticket do contato",
          message:
            "Atenção! Todas as mensagens relacionadas ao ticket serão perdidas.",
        },
        buttons: {
          delete: "Excluir",
          cancel: "Cancelar",
        },
      },
      confirmationModal: {
        buttons: {
          confirm: "Ok",
          cancel: "Cancelar",
        },
      },
      messageOptionsMenu: {
        delete: "Deletar",
        reply: "Responder",
        history: "Histórico",
        edit: "Editar",
        react: "Reagir",
        confirmationModal: {
          title: "Apagar mensagem?",
          message: "Esta ação não pode ser revertida.",
        },
        forward: "Selecione para encaminhar",
        forwardbutton: "ENCAMINHAR",
        forwardmsg1: "Encaminhar mensagem",
        reactions: {
          like: "Like",
          love: "Love",
          haha: "Haha",
        },
        reactionSuccess: "Reação adicionada com sucesso!",
      },
      forwardModal: {
        title: "Encaminhar mensagem",
        fieldLabel: "Selecione ou digite um contato",
        buttons: {
          cancel: "Cancelar",
          forward: "Encaminhar",
        },
      },
      inputErrors: {
        tooShort: "Muito curto",
        tooLong: "Muito longo",
        required: "Obrigatório",
        email: "Endereço de e-mail inválido",
      },
      presence: {
        unavailable: "Indisponível",
        available: "Disponível",
        composing: "Digitando...",
        recording: "Gravando...",
        paused: "Pausado",
      },
      efi: {
        efiSettings: "Configurações EFI",
        certificate: "Certificado",
        clientId: "ID do Cliente",
        clientSecret: "Segredo do Cliente",
        pixKey: "Chave PIX",
        efiApiConfigInstructions: "Instruções para configurar a API EFI",
        fileUploadSuccess: "Arquivo enviado com sucesso",
        fileUploadError: "Erro ao enviar o arquivo",
        settingUpdateSuccess: "Configuração atualizada com sucesso",
        efiInstructions: [
          "Acessar a conta EFI",
          "Criar uma chave PIX Aleatória, que será informada nas configuracoes de pagamento do sistema",
          'No menu esquerdo, clicar em "API" e clicar em "Criar Aplicação"',
          "Dar um nome para a aplicação (pode ser qualquer nome, é somente para identificar a integração) e clicar em continuar",
          'Na tela para selecionar escopos, clique em API Pix para expandir, selecione "Enviar PIX" e selecione todos os itens, tanto Produção quanto Homologação',
          "Em seguida, será gerado o Chave Client ID e Chave Secret que devem ser informados nas configuracoes, em pagamentos do seu sistema. ",
          'Ainda na tela da API, selecionar "Meus Certificados" no menu esquerdo e clicar em "Criar novo certificado"',
          'Informar um nome para identificar o certificado e clicar em "Criar Certificado"',
          "Clique em baixar certificado, este certificado também será utilizado na configuração do seu sistema.",
        ],
      },
      assistants: {
        title: "Agentes de IA",
        searchPlaceholder: "Buscar agentes...",
        emptyState: {
          title: "Nenhum agente encontrado",
          description: "Crie seu primeiro agente para começar a utilizar a IA em seu atendimento."
        },
        status: {
          active: "Ativo",
          inactive: "Inativo"
        },
        labels: {
          model: "Modelo",
          tools: "Ferramentas",
          noTools: "Nenhuma ferramenta configurada",
          none: "Nenhuma"
        },
        tools: {
          availableTools: "Ferramentas Disponíveis",
          fileSearch: "Arquivos",
          codeInterpreter: "Código",
          function: "Funções",
          fileSearchFull: "Pesquisa de Arquivos",
          codeInterpreterFull: "Interpretador de Código",
          functionFull: "Funções Personalizadas",
          fileSearchDescription: "Permite que o assistente pesquise e utilize informações contidas em arquivos.",
          codeInterpreterDescription: "Permite que o assistente execute código Python para análise de dados e geração de gráficos.",
          functionDescription: "Permite que o assistente chame funções personalizadas para integração com sistemas externos.",
          fileSearchConfig: "Configure os arquivos na aba \"Arquivos\".",
          codeInterpreterConfig: "Configure os arquivos na aba \"Arquivos\".",
          functionConfig: "Configure as funções na aba \"Funções\"."
        },
        functions: {
          enableFirst: "Ative a ferramenta \"Funções Personalizadas\" na aba \"Ferramentas\" para configurar funções."
        },
        tabs: {
          basicSettings: "Configurações Básicas",
          tools: "Ferramentas",
          files: "Arquivos",
          functions: "Funções"
        },
        table: {
          name: "Nome",
          model: "Modelo",
          tools: "Ferramentas",
          status: "Status",
          actions: "Ações"
        },
        form: {
          openaiApiKey: "Chave da API OpenAI",
          name: "Nome do Agente",
          instructions: "Instruções",
          model: "Modelo",
          active: "Ativo",
          activeHelp: "Quando inativo, o agente não responderá automaticamente",
          toolType: "Tipo de Ferramenta",
          toolTypeHelp: "Selecione para qual ferramenta os arquivos serão enviados",
          addFiles: "Adicionar Arquivos",
          newFiles: "Arquivos Novos",
          existingFiles: "Arquivos Existentes",
          noFiles: "Nenhum arquivo encontrado",
          voiceSettings: "Configurações de Voz",
          enableVoiceResponses: "Habilitar respostas em áudio",
          voiceResponsesHelp: "O assistente poderá responder com áudio quando o contato enviar mensagens de voz",
          voiceId: "Voz do Assistente",
          voiceSpeed: "Velocidade da fala"
    
        },
        filters: {
          allTools: "Todas",
          allModels: "Todos",
          modelLabel: "Modelo",
          toolLabel: "Ferramenta"
        },
        buttons: {
          add: "Adicionar",
          addEmpty: "ADICIONAR AGENTE",
          import: "Importar",
          help: "Ajuda",
          edit: "Editar",
          delete: "Excluir",
          search: "Buscar",
          cancelSelection: "Cancelar seleção",
          deleteSelected: "Excluir selecionados",
          cancel: "Cancelar",
          okEdit: "Salvar Alterações",
          okAdd: "Adicionar Agente"
        },
        modal: {
          title: {
            add: "Adicionar Agente",
            edit: "Editar Agente"
          }
        },
        confirmationModal: {
          deleteTitle: "Excluir agente",
          deleteMessage: "Esta ação não pode ser desfeita. Todos os dados associados a este agente serão removidos permanentemente."
        },
        pagination: {
          showing: "Exibindo {visible} de {total} agentes",
          previous: "Anterior",
          next: "Próximo"
        },
        validation: {
          required: "Obrigatório",
          tooShort: "Muito curto!",
          tooLong: "Muito longo!"
        },
        toasts: {
          success: "Agente salvo com sucesso",
          deleted: "Agente excluído com sucesso",
          deleteError: "Erro ao excluir agente",
          loadError: "Erro ao carregar agentes",
          loadAssistantError: "Erro ao carregar dados do agente",
          loadFilesError: "Erro ao carregar arquivos do agente",
          saveError: "Erro ao salvar agente",
          fileRemoved: "Arquivo removido com sucesso",
          fileRemoveError: "Erro ao remover arquivo",
          fileSizeExceeded: "Tamanho total dos arquivos excede o limite de 2048KB"
        },
        help: {
          title: "Ajuda sobre Agentes de IA",
          common: {
            capabilities: "Capacidades",
            supportedFormats: "Formatos suportados",
            field: "Campo",
            description: "Descrição"
          },
          tabs: {
            introduction: "Introdução",
            creation: "Criação",
            tools: "Ferramentas",
            import: "Importação",
            messageTypes: "Tipos de Mensagens"
          },
          introduction: {
            description: "Os Agentes de IA são assistentes virtuais baseados em Inteligência Artificial que podem atender automaticamente seus clientes.",
            whatAre: {
              title: "O que são Agentes de IA?",
              description: "Os Agentes de IA usam modelos avançados de linguagem para oferecer atendimento automatizado, mas com respostas naturais e personalizadas para seus clientes.",
              benefits: {
                personalization: "Personalização completa das respostas e comportamento",
                contextMemory: "Memória de contexto para manter conversas coerentes",
                tools: "Utilização de ferramentas avançadas como busca em arquivos e análise de dados",
                integration: "Integração perfeita com o fluxo de atendimento existente"
              }
            },
            page: {
              title: "A página de Agentes",
              description: "Esta página permite gerenciar todos os seus Agentes de IA, desde a criação até o monitoramento e edição.",
              sections: {
                creation: "Criação de Agentes",
                creationDesc: "Crie novos assistentes personalizados para necessidades específicas do seu negócio.",
                import: "Importação",
                importDesc: "Importe agentes já configurados na sua conta da OpenAI para usar aqui.",
                search: "Busca e Filtros",
                searchDesc: "Encontre rapidamente os agentes com filtros por modelo e ferramentas.",
                management: "Gerenciamento",
                managementDesc: "Edite, exclua ou desative agentes conforme necessário."
              }
            },
            models: {
              title: "Modelos Disponíveis",
              description: "Escolha entre diferentes modelos de IA, cada um com características específicas de desempenho, qualidade e custo:",
              gpt4: "O modelo mais avançado, com maior capacidade de compreensão e raciocínio complexo.",
              gpt4turbo: "Versão otimizada do GPT-4, oferecendo bom equilíbrio entre qualidade e velocidade.",
              gpt35: "Modelo rápido e econômico, ideal para tarefas simples e de alto volume.",
              capabilities: {
                contextual: "Compreensão de contexto avançada",
                reasoning: "Raciocínio complexo",
                code: "Geração de código de alta qualidade",
                analysis: "Análise de dados sofisticada",
                speed: "Velocidade otimizada",
                knowledge: "Conhecimento mais recente",
                costBenefit: "Boa relação custo-benefício",
                versatile: "Ideal para a maioria dos casos de uso",
                maxSpeed: "Velocidade máxima",
                lowCost: "Custo reduzido",
                simpleTasks: "Ideal para tarefas simples",
                highScale: "Perfeito para alta escala"
              },
              tip: {
                title: "Dica para escolha do modelo",
                description: "Para a maioria dos casos, o GPT-4 Turbo oferece o melhor equilíbrio entre qualidade e custo. Use o GPT-4 para casos que exigem raciocínio mais sofisticado e o GPT-3.5 para tarefas simples em grande volume."
              }
            }
          },
          creation: {
            title: "Criando um Agente",
            description: "O processo de criação de um agente envolve algumas etapas simples, mas importantes para o bom funcionamento do assistente.",
            stepsTitle: "Passos para criação",
            steps: {
              one: {
                title: "Iniciar o processo",
                description: "Clique no botão 'Adicionar' no topo da página de Agentes para abrir o formulário de criação."
              },
              two: {
                title: "Configurações básicas",
                description: "Preencha as informações essenciais para o funcionamento do agente:",
                fields: {
                  apiKey: "Chave da API OpenAI",
                  apiKeyDesc: "Sua chave pessoal da API da OpenAI para autenticação dos serviços.",
                  name: "Nome",
                  nameDesc: "Um nome identificador para o agente, visível apenas para você.",
                  instructions: "Instruções",
                  instructionsDesc: "Diretrizes detalhadas que definem o comportamento, tom e conhecimentos do agente.",
                  model: "Modelo",
                  modelDesc: "O modelo de IA a ser usado, que define capacidades e custos do agente."
                }
              },
              three: {
                title: "Ativar ferramentas",
                description: "Escolha as ferramentas que deseja disponibilizar para o seu agente:",
                tools: {
                  fileSearch: "Pesquisa de Arquivos",
                  codeInterpreter: "Interpretador de Código",
                  functions: "Funções Personalizadas"
                },
                note: "Cada ferramenta adiciona capacidades específicas e pode exigir configurações adicionais."
              },
              four: {
                title: "Salvar o agente",
                description: "Clique em 'Adicionar Agente' para finalizar a criação. O agente estará disponível imediatamente para uso."
              }
            },
            tips: {
              title: "Dicas para criar agentes eficazes",
              instructionsQuality: "Forneça instruções detalhadas e claras para obter respostas mais precisas e no tom desejado.",
              specificPurpose: "Crie agentes com propósitos específicos em vez de um único agente genérico para todas as tarefas.",
              testIteratively: "Teste o comportamento do agente regularmente e ajuste as instruções conforme necessário."
            }
          },
          tools: {
            title: "Ferramentas Disponíveis",
            description: "Os agentes podem usar ferramentas especiais que ampliam suas capacidades para além da simples conversa por texto.",
            fileSearch: {
              title: "Pesquisa de Arquivos",
              description: "Permite que o agente busque informações em documentos carregados para responder perguntas com base em seu conteúdo.",
              capabilities: {
                retrieveInfo: "Recupera informações específicas de documentos",
                answerQuestions: "Responde perguntas baseadas no conteúdo dos arquivos",
                summarize: "Cria resumos e sínteses de documentos extensos"
              }
            },
            codeInterpreter: {
              title: "Interpretador de Código",
              description: "Permite que o agente execute código Python para análise de dados, cálculos e geração de visualizações.",
              capabilities: {
                executeCode: "Executa código Python para análise de dados",
                dataAnalysis: "Realiza análises estatísticas e matemáticas",
                visualizations: "Gera gráficos e visualizações de dados"
              }
            },
            functions: {
              title: "Funções Personalizadas",
              description: "Permite que o agente execute ações específicas através de funções definidas, como integração com sistemas externos.",
              capabilities: {
                integration: "Integração com sistemas e APIs externos",
                realTime: "Acesso a dados em tempo real",
                actions: "Execução de ações específicas de negócio"
              }
            },
            configuration: {
              title: "Configuração das Ferramentas",
              description: "Cada ferramenta requer configurações específicas para seu funcionamento adequado:",
              fileSearch: {
                title: "Configurando a Pesquisa de Arquivos",
                step1: "Ative a ferramenta 'Pesquisa de Arquivos' na aba Ferramentas.",
                step2: "Vá para a aba 'Arquivos' e selecione 'Pesquisa de Arquivos' no tipo de ferramenta.",
                step3: "Adicione os arquivos que deseja disponibilizar para consulta pelo agente."
              },
              codeInterpreter: {
                title: "Configurando o Interpretador de Código",
                step1: "Ative a ferramenta 'Interpretador de Código' na aba Ferramentas.",
                step2: "Vá para a aba 'Arquivos' e selecione 'Interpretador de Código' no tipo de ferramenta.",
                libraries: "O ambiente Python inclui bibliotecas populares como pandas, numpy, matplotlib e scikit-learn por padrão."
              },
              functions: {
                title: "Configurando Funções Personalizadas",
                step1: "Ative a ferramenta 'Funções Personalizadas' na aba Ferramentas.",
                step2: "Vá para a aba 'Funções' e adicione as funções que deseja disponibilizar para o agente.",
                parameters: {
                  title: "Configuração de Parâmetros",
                  name: "Nome",
                  nameDesc: "Nome da função que o agente vai chamar",
                  description: "Descrição",
                  descriptionDesc: "Explicação do que a função faz e quando deve ser usada",
                  type: "Tipo",
                  typeDesc: "Tipo de dado do parâmetro (string, número, boolean, etc)",
                  required: "Obrigatório",
                  requiredDesc: "Indica se o parâmetro é obrigatório ou opcional"
                }
              }
            },
            limitations: {
              title: "Limitações",
              description: "As ferramentas têm algumas limitações importantes a considerar: o Interpretador de Código opera em um ambiente isolado sem acesso à internet, a Pesquisa de Arquivos suporta um número limitado de formatos, e as Funções Personalizadas requerem configuração adicional para implementação efetiva."
            }
          },
          import: {
            title: "Importando Agentes",
            description: "Você pode importar agentes existentes da sua conta OpenAI para usar no sistema.",
            processTitle: "Processo de Importação",
            steps: {
              one: {
                title: "Iniciar importação",
                description: "Clique no botão 'Importar' no topo da página de Agentes para abrir o assistente de importação.",
                note: "Você precisará da sua chave de API da OpenAI para concluir este processo."
              },
              two: {
                title: "Selecionar agentes",
                description: "O sistema mostrará todos os agentes disponíveis na sua conta OpenAI. Selecione os que deseja importar."
              },
              three: {
                title: "Concluir importação",
                description: "Clique em 'Importar Selecionados' para finalizar o processo. Os agentes importados aparecerão na sua lista.",
                note: "Alguns elementos como arquivos e funções específicas podem precisar ser reconfigurados após a importação."
              }
            },
            advantages: {
              title: "Vantagens da Importação",
              time: "Economiza tempo ao reutilizar agentes já configurados na OpenAI",
              consistency: "Mantém a consistência entre os agentes usados na plataforma OpenAI e no sistema",
              migration: "Facilita a migração gradual para o nosso sistema integrado"
            },
            limitations: {
              title: "Limitações da Importação",
              description: "Existem algumas limitações importantes a considerar no processo de importação:",
              files: {
                title: "Arquivos",
                description: "Os arquivos associados aos agentes na OpenAI não são importados automaticamente e precisam ser adicionados novamente."
              },
              keys: {
                title: "Chaves API",
                description: "Você precisará fornecer sua chave API novamente para cada agente, mesmo que todos usem a mesma chave."
              },
              functions: {
                title: "Funções",
                description: "As funções personalizadas precisarão ser reconfiguradas manualmente após a importação."
              }
            },
            security: {
              title: "Segurança",
              description: "Sua chave API da OpenAI é usada apenas para o processo de importação e interação com os agentes. Ela é armazenada de forma segura e criptografada em nosso sistema."
            }
          },
          messageTypes: {
            title: "Tipos de Mensagens Suportadas",
            description: "O agente pode enviar vários tipos de mensagens além de texto simples. Veja abaixo os formatos suportados e como usá-los.",
            text: {
              title: "Mensagem de Texto",
              description: "Mensagens de texto simples são enviadas automaticamente. O agente pode responder com parágrafos, listas e formatação básica.",
              example: "Exemplo:",
              exampleText: "Olá! Como posso ajudar você hoje?"
            },
            location: {
              title: "Localização (Mapa)",
              description: "Envie coordenadas geográficas para mostrar uma localização no mapa.",
              example: "Formato:"
            },
            document: {
              title: "Documentos",
              description: "Envie documentos como PDF, DOC, XLS e outros formatos de arquivo.",
              example: "Formato:"
            },
            video: {
              title: "Vídeos",
              description: "Compartilhe vídeos a partir de URLs externas.",
              example: "Formato:"
            },
            contact: {
              title: "Contatos",
              description: "Compartilhe informações de contato que podem ser salvas na agenda do usuário.",
              example: "Formato:"
            },
            audio: {
              title: "Áudios",
              description: "Envie mensagens de voz ou áudio a partir de URLs externas.",
              example: "Formato:"
            },
            image: {
              title: "Imagens",
              description: "Compartilhe imagens a partir de URLs externas ou geradas pelo agente.",
              example: "Formato:"
            },
            tips: {
              title: "Dicas para o uso de mensagens",
              description: "Para usar estes recursos, inclua comandos especiais nas instruções do seu agente. Os comandos devem ser formatados exatamente como mostrado nos exemplos acima. Múltiplos comandos podem ser combinados em uma única resposta."
            }
          }
        }
      },
      pagination: {
        itemsPerPage: "{{count}} por página",
        itemsPerPageTooltip:
          "Selecione o número de itens a serem exibidos por página. Isso ajuda a controlar a quantidade de informações mostradas de uma vez.",
      },
      invoices: {
        title: "Faturas",
        search: "Buscar faturas...",
        toggleView: "Alternar visualização",
        id: "ID",
        details: "Detalhes",
        value: "Valor",
        dueDate: "Data Vencimento",
        status: "Status",
        actions: "Ações",
        pay: "Pagar",
        paid: "Pago",
        pending: "Em Aberto",
        overdue: "Vencido",
        editDueDate: "Editar Data de Vencimento",
        newDueDate: "Nova Data de Vencimento",
        updating: "Atualizando...",
        confirm: "Confirmar",
        cancel: "Cancelar",
        sendWhatsapp: "Enviar por WhatsApp",
        sendEmail: "Enviar por Email",
        dueDateUpdated: "Data de vencimento atualizada com sucesso",
        errorUpdatingDueDate: "Erro ao atualizar data de vencimento",
        messageSent: "Mensagem enviada com sucesso",
        messageError: "Erro ao enviar mensagem",
        emailSent: "Email enviado com sucesso",
        emailError: "Erro ao enviar email",
        loadError: "Erro ao carregar faturas",
        emailSubject: "Fatura #${id}",
        superUserOnly: "Apenas usuários super podem realizar esta ação",
        whatsappMessage: {
          header: "Detalhes da Fatura",
          id: "Número da Fatura",
          dueDate: "Data de Vencimento",
          value: "Valor",
          paymentInfo: "Informações de Pagamento",
          footer: "Em caso de dúvidas, entre em contato conosco",
        },
        emailBody: {
          header: "Detalhes da sua Fatura",
          id: "Número da Fatura",
          dueDate: "Data de Vencimento",
          value: "Valor",
          paymentInstructions: "Instruções de Pagamento",
          footer: "Agradecemos sua preferência",
        },
        cardView: {
          dueIn: "Vence em",
          overdueDays: "Vencida há",
          days: "dias",
        },
      },
      financial: {
        title: "Financeiro",
        id: "ID",
        company: "Empresa",
        tableInvoice: "Fatura",
        value: "Valor",
        dueDate: "Data de Vencimento",
        noDate: "Data não informada",
        pay: "Pagar",
        actions: "Ações",
        filter: "Filtrar",
        filterTitle: "Filtrar Faturas",
        filterAllStatus: "Todas as situações",
        apply: "Aplicar",
        cancel: "Cancelar",
        searchPlaceholder: "Buscar por ID, detalhes ou empresa...",
        deleteSelected: "Excluir Selecionados",
        noInvoices: "Nenhuma fatura encontrada",
        noInvoicesTitle: "Nenhuma fatura disponível",
        noInvoicesMessage: "Não há faturas registradas no sistema ou com os filtros aplicados.",
        invoice: "Fatura",
        selectedInvoices: "Faturas selecionadas",
        viewInvoice: "Visualizar fatura",
        sendEmail: "Enviar por E-mail",
        sendWhatsapp: "Enviar por WhatsApp",
        deleteInvoice: "Excluir fatura",
        confirmDelete: "Confirmar exclusão",
        confirmBulkDelete: "Confirmar exclusão em massa",
        deleteWarning: "Esta ação não pode ser desfeita. A fatura será permanentemente removida do sistema.",
        bulkDeleteWarning: "Esta ação não pode ser desfeita. As faturas selecionadas serão permanentemente removidas do sistema.",
        deleteConfirmation: "Tem certeza que deseja excluir esta fatura?",
        bulkDeleteConfirmation: "Tem certeza que deseja excluir as faturas selecionadas?",
        invoiceDeleted: "Fatura excluída com sucesso",
        invoicesDeleted: "{{count}} faturas excluídas com sucesso",
        errorDeletingInvoice: "Erro ao excluir fatura",
        errorDeletingInvoices: "Erro ao excluir faturas",
        errorLoadingInvoices: "Erro ao carregar faturas",
        errorLoadingCompanies: "Erro ao carregar empresas",
        emailSent: "E-mail enviado com sucesso",
        whatsappSent: "Mensagem enviada com sucesso",
        errorSendingEmail: "Erro ao enviar e-mail",
        errorSendingWhatsapp: "Erro ao enviar mensagem",
        accessDenied: "Acesso negado. Você não tem permissão para esta operação.",
        selected: "selecionadas",
        status: {
          tableHeader: "Situação",
          paid: "Pago",
          pending: "Pendente",
          overdue: "Vencido"
        }
      },
      deleteConfirmationDialog: {
        cancelButton: "Cancelar",
        confirmButton: "Confirmar Exclusão",
        defaultTitle: "Confirmar Exclusão",
        defaultWarning: "Esta ação não pode ser desfeita!",
        defaultConfirmation: "Tem certeza que deseja excluir este item?",
      },
      errors: {
        required: "Este campo é obrigatório",
        invalid: "Valor inválido",
        invalidEmail: "Email inválido",
        invalidPhone: "Telefone inválido",
        invalidCep: "CEP inválido",
        invalidCpf: "CPF inválido",
        invalidCnpj: "CNPJ inválido",
        minLength: "Mínimo de {min} caracteres",
        maxLength: "Máximo de {max} caracteres",
      },
      chat: {
        // Títulos e cabeçalhos
        title: "Chat Interno",
        conversations: "Conversas",
        chatList: "Lista de Conversas",
        messages: "Mensagens",
        recentMessages: "Mensagens Recentes",
        selectChat: "Selecione uma conversa",
        selectChatMessage: "Escolha uma conversa para começar a interagir",

        // Ações principais
        newChat: "Nova Conversa",
        editChat: "Editar Conversa",
        deleteChat: "Excluir Conversa",
        delete: "Excluir Conversa",
        createGroup: "Criar Grupo",
        leaveGroup: "Sair do Grupo",

        // Modal de chat
        chatTitle: "Título da Conversa",
        selectUsers: "Selecionar Participantes",
        searchUsers: "Buscar usuários...",
        selectedUsers: "Participantes Selecionados",
        create: "Criar",
        saveChanges: "Salvar Alterações",
        cancel: "Cancelar",

        // Validações do modal
        titleRequired: "O título é obrigatório",
        titleMinLength: "O título deve ter no mínimo 3 caracteres",
        titleMaxLength: "O título deve ter no máximo 50 caracteres",
        usersRequired: "Selecione pelo menos um participante",

        // Mensagens
        sendMessage: "Enviar mensagem",
        typeMessage: "Digite sua mensagem...",
        messagePlaceholder: "Escreva uma mensagem",
        noMessages: "Nenhuma mensagem ainda",
        loadingMessages: "Carregando mensagens...",
        loadMore: "Carregar mais",
        messageDeleted: "Mensagem apagada",

        // Mídia
        attachFile: "Anexar arquivo",
        uploadImage: "Enviar imagem",
        uploadVideo: "Enviar vídeo",
        recordAudio: "Gravar áudio",
        stopRecording: "Parar gravação",
        preview: "Pré-visualização",
        send: "Enviar",
        downloading: "Baixando...",
        uploading: "Enviando...",

        // Ações de mensagem
        copyMessage: "Copiar mensagem",
        deleteMessage: "Apagar mensagem",
        editMessage: "Editar mensagem",
        quoteMessage: "Responder",

        // Status e indicadores
        typing: "digitando...",
        online: "Online",
        offline: "Offline",
        lastSeen: "Visto por último",
        recording: "Gravando...",

        // Confirmações
        deleteConfirmTitle: "Excluir Conversa",
        deleteConfirmMessage:
          "Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.",
        leaveConfirmTitle: "Sair do Grupo",
        leaveConfirmMessage: "Tem certeza que deseja sair deste grupo?",

        // Moderação
        blockUser: "Bloquear usuário",
        unblockUser: "Desbloquear usuário",
        reportUser: "Denunciar usuário",
        blockUserConfirm: "Confirmar bloqueio",
        blockUserMessage: "Tem certeza que deseja bloquear este usuário?",
        reportUserTitle: "Denunciar Usuário",
        reportPlaceholder: "Descreva o motivo da denúncia",
        userBlocked: "Usuário bloqueado",
        userUnblocked: "Usuário desbloqueado",
        reportSent: "Denúncia enviada",

        // Exportação
        exportChat: "Exportar conversa",
        exportPdf: "Exportar como PDF",
        exportSuccess: "Conversa exportada com sucesso",

        // Visualizações
        viewMode: "Modo de visualização",
        listView: "Visualização em lista",
        gridView: "Visualização em grade",

        // Tooltips
        tooltips: {
          sendButton: "Enviar mensagem",
          attachButton: "Anexar arquivo",
          recordButton: "Gravar áudio",
          emojiButton: "Inserir emoji",
          blockButton: "Bloquear usuário",
          reportButton: "Denunciar usuário",
          exportButton: "Exportar conversa",
          editButton: "Editar conversa",
          deleteButton: "Excluir conversa",
          searchButton: "Buscar nas mensagens",
          viewModeButton: "Alternar modo de visualização",
        },

        // Mensagens de erro
        errors: {
          loadError: "Erro ao carregar conversas",
          loadMessagesError: "Erro ao carregar mensagens",
          sendError: "Erro ao enviar mensagem",
          uploadError: "Erro ao enviar arquivo",
          recordingError: "Erro ao gravar áudio",
          deleteError: "Erro ao excluir conversa",
          createError: "Erro ao criar conversa",
          editError: "Erro ao editar conversa",
          blockError: "Erro ao bloquear usuário",
          reportError: "Erro ao enviar denúncia",
          exportError: "Erro ao exportar conversa",
          loadUsersError: "Erro ao carregar usuários",
          searchError: "Erro na busca de usuários",
          saveError: "Erro ao salvar conversa",
        },

        // Mensagens de sucesso
        success: {
          messageSent: "Mensagem enviada",
          conversationCreated: "Conversa criada com sucesso",
          conversationUpdated: "Conversa atualizada com sucesso",
          conversationDeleted: "Conversa excluída com sucesso",
          userBlocked: "Usuário bloqueado com sucesso",
          userUnblocked: "Usuário desbloqueado com sucesso",
          reportSent: "Denúncia enviada com sucesso",
          chatExported: "Conversa exportada com sucesso",
          createSuccess: "Conversa criada com sucesso",
          editSuccess: "Conversa atualizada com sucesso",
        },

        // Estados vazios
        empty: {
          noChats: "Nenhuma conversa encontrada",
          noMessages: "Nenhuma mensagem encontrada",
          noResults: "Nenhum resultado encontrado",
          startConversation: "Comece uma nova conversa!",
          noConversations: "Você ainda não tem conversas",
        },

        // Filtros e busca
        search: {
          searchChats: "Buscar conversas",
          searchMessages: "Buscar mensagens",
          searchUsers: "Buscar usuários",
          noResults: "Nenhum resultado encontrado",
          searching: "Buscando...",
        },
      },
      modal: {
        scheduling: {
          title: "Horário de Agendamento",
          description:
            "Todos os agendamentos serão enviados entre as 18:00 e 18:30.",
        },
        recurring: {
          title: "Agendamento Recorrente",
          steps: {
            intro: "Siga estes passos:",
            step1: "Vá para a aba de Tags de Campanha",
            step2: "Crie novas tags, se necessário",
            substeps: {
              title: "Configure sua campanha:",
              settings: "Vá na engrenagem de configurações",
              board: "Selecione um dos quadros disponíveis",
              message: "Altere a mensagem que será enviada",
              file: "Se necessário, escolha um arquivo a ser enviado",
              frequency:
                "Escolha a frequência do agendamento (a cada quantos dias)",
              save: "Clique em Salvar",
            },
          },
        },
        openTickets: {
          title: "Tickets Sem Campanhas Ativas",
          description:
            'Todos os tickets sem campanhas ativas entrarão no quadro "EM Aberto"',
        },
        campaign: {
          title: "Criar uma Campanha",
          description:
            "Para criar uma campanha, arraste o ticket para o quadro de campanha de sua escolha",
        },
        moving: {
          title: "Mover Tickets entre Quadros",
          rules: {
            rule1:
              "Ao mover um ticket para um quadro, os agendamentos serão feitos com base nas configurações do quadro",
            rule2:
              "Ao mover um ticket para outro quadro, os agendamentos existentes serão excluídos e um novo agendamento será criado de acordo com o quadro escolhido",
            rule3:
              'Ao mover um ticket de volta para o quadro "Em Aberto", os agendamentos existentes do ticket serão excluídos',
          },
        },
        close: "Fechar modal",
      },
      files: {
        title: "Arquivos",
        empty: {
          title: "Nenhuma lista de arquivos encontrada",
          message: "Comece criando sua primeira lista de arquivos para usar em suas campanhas."
        },
        buttons: {
          addList: "Adicionar Lista",
          uploadFile: "Enviar Arquivo",
          upload: "Enviar",
          download: "Download",
          close: "Fechar",
          delete: "Excluir",
          selectFile: "Selecionar Arquivo",
          openPdf: "Abrir PDF"
        },
        searchPlaceholder: "Buscar listas de arquivos...",
        searchFilePlaceholder: "Buscar arquivo...",
        noResults: "Nenhum resultado encontrado para sua busca",
        emptyFileList: "Nenhum arquivo nesta lista",
        noSearchResults: "Nenhum arquivo encontrado para esta busca",
        noFilesInList: "Esta lista não possui arquivos",
        table: {
          name: "Nome",
          filename: "Nome do arquivo",
          type: "Tipo",
          size: "Tamanho",
          actions: "Ações",
          unknownType: "Desconhecido",
          of: "de"
        },
        fileTypes: {
          unknown: "Desconhecido",
          image: "Imagem",
          pdf: "PDF",
          document: "Documento",
          spreadsheet: "Planilha",
          text: "Texto",
          audio: "Áudio",
          video: "Vídeo",
          file: "Arquivo"
        },
        modal: {
          addTitle: "Nova Lista de Arquivos",
          editTitle: "Editar Lista de Arquivos",
          name: "Nome da lista",
          description: "Descrição",
          cancel: "Cancelar",
          add: "Adicionar",
          saveChanges: "Salvar Alterações",
          preview: "Visualização",
          noPreview: "Sem visualização disponível"
        },
        tooltips: {
          edit: "Editar",
          delete: "Excluir",
          view: "Visualizar",
          download: "Download",
          addFile: "Adicionar Arquivo"
        },
        deleteDialog: {
          title: "Excluir Lista de Arquivos",
          message: "Tem certeza que deseja excluir esta lista de arquivos? Esta ação não pode ser desfeita."
        },
        deleteFileDialog: {
          title: "Excluir Arquivo",
          message: "Tem certeza que deseja excluir este arquivo? Esta ação não pode ser desfeita."
        },
        preview: {
          title: "Visualização do Arquivo",
          description: "Descrição",
          details: "Detalhes do arquivo",
          noPreview: "Visualização não disponível para este tipo de arquivo",
          pdfMessage: "Clique no botão abaixo para abrir o PDF",
          notSupported: "Visualização não disponível para este tipo de arquivo"
        },
        validation: {
          nameRequired: "O nome da lista é obrigatório",
          nameMin: "O nome deve ter pelo menos 2 caracteres",
          nameMax: "O nome deve ter no máximo 100 caracteres",
          descriptionMax: "A descrição deve ter no máximo 500 caracteres"
        },
        toasts: {
          added: "Lista de arquivos criada com sucesso",
          updated: "Lista de arquivos atualizada com sucesso",
          deleted: "Lista de arquivos excluída com sucesso",
          fileDeleted: "Arquivo excluído com sucesso",
          fileAddedToList: "Arquivo adicionado à lista com sucesso",
          uploaded: "Arquivo enviado com sucesso",
          fetchError: "Erro ao carregar listas de arquivos",
          deleteError: "Erro ao excluir lista de arquivos",
          deleteFileError: "Erro ao excluir arquivo",
          uploadError: "Erro ao enviar arquivo",
          error: "Ocorreu um erro, tente novamente",
          mediaDeleted: "Arquivo excluído com sucesso",
          mediaError: "Erro ao fazer upload do arquivo"
        },
        errors: {
          invalidFile: "Arquivo inválido",
          fileUploadError: "Erro ao fazer upload do arquivo",
          invalidFileType: "Tipo de arquivo não suportado",
          fileTooLarge: "Arquivo muito grande (máximo 10MB)"
        }
      },
      splash: {
        title: 'AutoAtende',
        subtitle: 'Atendimento Inteligente',
        loading: 'Carregando...',
        initializing: 'Iniciando...',
        loadingResources: 'Carregando recursos...',
        preparingInterface: 'Preparando interface...',
        configuringEnvironment: 'Configurando ambiente...',
        finishingUp: 'Finalizando...'
      },
      home: {
        nav: {
          features: 'Funcionalidades',
          pricing: 'Preços',
          about: 'Sobre',
          login: "Entrar",
          getStarted: "Começar Agora"
        },
        hero: {
          title: 'Transforme seu Atendimento com IA',
          subtitle: 'Automatize, otimize e escale seu atendimento ao cliente com soluções inteligentes baseadas em inteligência artificial.',
          cta: {
            primary: 'Teste Grátis',
            secondary: 'Saiba Mais'
          }
        },
        stats: {
          clients: 'Clientes Ativos',
          uptime: 'Disponibilidade',
          support: 'Suporte ao Cliente'
        },
        features: {
          title: 'Funcionalidades Poderosas',
          subtitle: 'Tudo que você precisa para oferecer um atendimento excepcional',
          chatbot: {
            title: 'Chatbot com IA',
            description: 'Respostas automatizadas inteligentes com processamento avançado de linguagem natural.'
          },
          messaging: {
            title: 'Mensagens Unificadas',
            description: 'Gerencie todas as conversas com seus clientes em uma única plataforma centralizada.'
          },
          ai: {
            title: 'Análise com IA',
            description: 'Obtenha insights profundos sobre as interações com clientes e desempenho do serviço.'
          },
          automation: {
            title: 'Automação Inteligente',
            description: 'Automatize tarefas rotineiras e foque no que realmente importa.'
          },
          security: {
            title: 'Segurança Empresarial',
            description: 'Segurança e proteção de dados de nível bancário para sua tranquilidade.'
          },
          api: {
            title: 'API para Desenvolvedores',
            description: 'Integre facilmente com seus sistemas e fluxos de trabalho existentes.'
          }
        },
        pricing: {
          title: 'Preços Simples e Transparentes',
          subtitle: 'Escolha o plano que melhor atende às suas necessidades',
          popularLabel: 'Mais Popular',
          ctaButton: 'Começar Agora',
          basic: {
            title: 'Básico',
            feature1: '1 Operador',
            feature2: '1 Canal WhatsApp',
            feature3: 'Dashboard Básico',
            feature4: 'Suporte por Email'
          },
          pro: {
            title: 'Profissional',
            feature1: '5 Operadores',
            feature2: '3 Canais WhatsApp',
            feature3: 'Análises Avançadas',
            feature4: 'Suporte Prioritário'
          },
          enterprise: {
            title: 'Empresarial',
            feature1: 'Operadores Ilimitados',
            feature2: 'Canais Ilimitados',
            feature3: 'Integração Personalizada',
            feature4: 'Suporte 24/7'
          }
        },
        footer: {
          description: 'O AutoAtende ajuda empresas a oferecerem um atendimento excepcional através da automação com inteligência artificial.',
          product: {
            title: 'Produto',
            features: 'Funcionalidades',
            pricing: 'Preços',
            api: 'API'
          },
          company: {
            title: 'Empresa',
            about: 'Sobre Nós',
            contact: 'Contato',
            careers: 'Carreiras'
          },
          legal: {
            title: 'Legal',
            privacy: 'Política de Privacidade',
            terms: 'Termos de Serviço',
            cookies: 'Política de Cookies'
          },
          rights: 'Todos os direitos reservados.'
        }
      },

      connections: {
        title: "Conexões",
        noConnections: "Nenhuma conexão encontrada",
        buttons: {
          add: "Adicionar conexão",
          restartAll: "Reiniciar todas",
          qrCode: "Ver QR Code",
          tryAgain: "Tentar novamente",
          disconnect: "Desconectar",
          newQr: "Novo QR Code",
          connecting: "Conectando...",
          refreshQrCode: "Atualizar QR Code",
          generatingQrCode: "Gerando QR Code...",
          generateQrCode: "Gerar QR Code",
          showQrCode: "Mostrar QR Code"
        },
        status: {
          disconnected: "Desconectada"
        },
        menu: {
          duplicate: "Duplicar conexão",
          transferTickets: "Transferir tickets e excluir",
          delete: "Excluir conexão",
          forceDelete: "Forçar exclusão",
          importMessages: "Importar Mensagens"
        },
        confirmationModal: {
          deleteTitle: "Excluir conexão",
          deleteMessage: "Você tem certeza que deseja excluir esta conexão? Todos os atendimentos relacionados serão perdidos.",
          disconnectTitle: "Desconectar sessão",
          disconnectMessage: "Você tem certeza que deseja desconectar esta sessão?",
          forceDeleteTitle: "Forçar exclusão",
          forceDeleteMessage: "ATENÇÃO: Esta ação excluirá a conexão mesmo que existam tickets abertos. Você tem certeza?",
          transferTitle: "Transferir Tickets",
          transferMessage: "Selecione a conexão de destino para os tickets:"
        },
        toasts: {
          deleted: "Conexão excluída com sucesso.",
          deleteError: "Erro ao excluir a conexão.",
          disconnected: "Conexão desconectada com sucesso.",
          disconnectError: "Erro ao desconectar conexão.",
          qrCodeGenerated: "QR Code gerado com sucesso.",
          qrCodeError: "Erro ao gerar QR Code.",
          reconnectRequested: "Reconexão solicitada com sucesso.",
          reconnectError: "Erro ao solicitar reconexão.",
          connectionStarted: "Iniciando sessão...",
          startError: "Erro ao iniciar sessão.",
          fetchError: "Erro ao buscar conexões.",
          restartSuccess: "Todas as conexões estão sendo reiniciadas.",
          duplicated: "Conexão duplicada com sucesso.",
          duplicateError: "Erro ao duplicar conexão.",
          transferSuccess: "Tickets transferidos e conexão excluída com sucesso.",
          transferError: "Erro ao transferir tickets."
        },
        table: {
          name: "Nome",
          number: "Número",
          status: "Status",
          default: "Padrão",
          lastUpdate: "Última atualização",
          session: "Sessão",
          actions: "Ações"
        },
        import: {
          title: "Importação de Mensagens",
          preparingImport: "Preparando importação...",
          pleaseWait: "Por favor, aguarde enquanto preparamos os dados para importação.",
          importingMessages: "Importando mensagens",
          progress: "Progresso",
          doNotClose: "Não feche esta janela enquanto a importação estiver em andamento.",
          importComplete: "Importação concluída",
          messagesImported: "{count} mensagens foram importadas com sucesso.",
          closeTicketsTitle: "Fechar tickets importados",
          closeTicketsDescription: "Você pode fechar automaticamente todos os tickets criados durante a importação para manter seu workspace organizado.",
          closeTicketsButton: "Fechar tickets importados",
          importError: "Erro na importação",
          genericError: "Ocorreu um erro durante o processo de importação.",
          refresh: "Atualizar página"
        },

      },
      qrCode: {
        title: "QR Code",
        instructions: "Escaneie o QR Code com seu telefone para conectar",
        timeRemaining: "Tempo restante",
        noQrFound: "Nenhum QR Code encontrado",
        expired: "QR Code expirado. Clique para gerar um novo",
        connected: "Conectado com sucesso!"
      },

      fileImport: {
        title: 'Importação de Arquivos',
        startButton: 'Iniciar Importação',
        companyRequired: 'Empresa é obrigatória',
        processedFiles: '{{processed}} de {{total}} arquivos processados',
        errors: '{{count}} erros encontrados',
        successMessage: 'Importação concluída com sucesso! {{total}} arquivos processados.',
        errorMessage: 'Erro durante a importação. Por favor, tente novamente.',
        startError: 'Erro ao iniciar importação',
        complete: 'Importação concluída com sucesso!',
        error: 'Erro durante a importação'
      },
      oldsettings: {
        // Abas principais
        tabs: {
          ai: "Inteligência Artificial",
          generalParams: "Parâmetros Gerais",
          advanced: "Configurações Avançadas"
        },

        // Configurações OpenAI
        openai: {
          label: "Modelo OpenAI",
          helper: "Escolha o modelo de inteligência artificial OpenAI para utilizar nas respostas automáticas. Fundamental para garantir a qualidade e precisão das respostas automáticas, melhorando a eficiência do atendimento.",
          models: {
            gpt4o: "GPT-4o - Modelo principal para tarefas complexas",
            gpt4oMini: "GPT-4o Mini - Modelo leve e rápido",
            gpt4Turbo: "GPT-4 Turbo - Última versão com capacidades de visão",
            o1Preview: "O1 Preview - Modelo focado em raciocínio",
            o1Mini: "O1 Mini - Modelo rápido para código e matemática"
          }
        },

        // Configurações gerais
        downloadLimit: {
          label: "Limite de Download (MB)",
          helper: "Define o limite máximo para o download de arquivos em megabytes"
        },

        oneTicket: {
          label: "Ativar uso de um ticket por conexão",
          helper: "Ao ativar esta função, cada conexão diferente do cliente gerará um ticket distinto"
        },

        signup: {
          label: "Habilitar registro no signup",
          helper: "Permite que novos usuários se cadastrem na plataforma"
        },

        emailRegister: {
          label: "Enviar email no registro",
          helper: "Envia email de confirmação usando a empresa principal"
        },

        messageRegister: {
          label: "Enviar mensagem no registro",
          helper: "Envia mensagem de boas-vindas ao cadastrar"
        },

        closeTicketReason: {
          label: "Exibir motivo ao fechar ticket",
          helper: "Solicita motivo do encerramento ao finalizar atendimento"
        },

        showSku: {
          label: "Exibir valor do ticket e SKU",
          helper: "Mostra informações de valor e SKU durante atendimento"
        },

        quickMessages: {
          label: "Mensagens Rápidas",
          company: "Por Empresa",
          individual: "Por Usuário",
          helper: "Define como as mensagens rápidas serão organizadas"
        },

        greetingMessage: {
          label: "Enviar saudação ao aceitar ticket",
          helper: "Envia mensagem automática ao aceitar atendimento"
        },

        userRating: {
          label: "Avaliação do usuário",
          helper: "Permite que clientes avaliem o atendimento"
        },

        schedule: {
          label: "Gerenciamento de Expediente",
          disabled: "Desativado",
          company: "Por Empresa",
          queue: "Por Setor",
          helper: "Define como o horário de atendimento será controlado"
        },

        ignoreGroup: {
          label: "Ignorar mensagens de grupo",
          helper: "Não processa mensagens vindas de grupos"
        },

        acceptCalls: {
          label: "Aceitar chamadas",
          helper: "Permite receber chamadas de voz e vídeo"
        },

        chatbot: {
          label: "Tipo de Chatbot",
          text: "Texto",
          helper: "Define o formato de interação do chatbot"
        },

        transferMessage: {
          label: "Mensagem de transferência",
          helper: "Envia mensagem ao transferir atendimento"
        },

        queueGreeting: {
          label: "Saudação em setor único",
          helper: "Envia saudação quando há apenas um setor"
        },
        smtp: {
          title: "SMTP",
          server: "Servidor SMTP",
          username: "Usuário SMTP",
          password: "Senha SMTP",
          port: "Porta SMTP"
        },

        support: {
          title: "Suporte",
          whatsapp: "WhatsApp do Suporte",
          message: "Mensagem padrão"
        },

        apiToken: {
          label: "Token da API",
          copied: "Token copiado para área de transferência",
          generate: "Gerar novo token",
          delete: "Excluir token"
        },

        // Mensagens gerais
        success: "Operação realizada com sucesso",
        loading: "Atualizando...",
        error: "Ocorreu um erro na operação",
        save: "Salvar",
        cancel: "Cancelar"
      },

      satisfactionSurvey: {
        tooltip: "Você tem {{count}} pesquisa(s) de satisfação pendente(s)",
        reminderTitle: "Sua opinião é importante!",
        reminderMessage: "Você tem {{count}} pesquisa(s) de satisfação aguardando resposta.",
        reminderSubtext: "Sua avaliação nos ajuda a melhorar continuamente o AutoAtende.",
        remindLater: "Lembrar mais tarde",
        openNow: "Responder agora"
      },

      flowBuilder: {
        // Lista de fluxos
        list: {
          title: "Construtor de Fluxos",
          searchPlaceholder: "Buscar por nome",
          viewStats: "Ver Estatísticas",
          newFlow: "Novo Fluxo",
          name: "Nome",
          whatsapp: "WhatsApp",
          status: "Status",
          createdAt: "Criado em",
          actions: "Ações",
          active: "Ativo",
          inactive: "Inativo",
          edit: "Editar",
          test: "Testar",
          delete: "Excluir",
          duplicate: 'Duplicar',
          duplicateSuccess: 'Fluxo duplicado com sucesso',
          duplicateError: 'Erro ao duplicar fluxo',
          importFlow: 'Importar Fluxo',
          createFirst: "Crie agora mesmo o primeiro fluxo",
          createSuccess: "Fluxo criado com sucesso",
          confirmDelete: "Confirmar exclusão",
          confirmDeleteMessage: "Tem certeza que deseja excluir o fluxo {{name}}?",
          noFlows: "Nenhum fluxo encontrado",
          noSearchResults: "Nenhum fluxo encontrado com os critérios de busca",
          fetchError: "Erro ao buscar fluxos",
          deleteError: "Erro ao excluir fluxo",
          deleteSuccess: "Fluxo excluído com sucesso",
          testError: "Erro ao testar fluxo",
          testSuccess: "Teste de fluxo iniciado com sucesso",
          toggleError: "Erro ao alterar status do fluxo",
          noDescription: "Nenhuma descrição disponível"
        },

        import: {
          title: 'Importar Fluxo',
          instruction: 'Selecione ou arraste um arquivo JSON de fluxo exportado previamente.',
          dropFile: 'Clique ou arraste um arquivo aqui',
          fileFormat: 'Apenas arquivos JSON são aceitos',
          noFileSelected: 'Por favor, selecione um arquivo para importar',
          success: 'Fluxo importado com sucesso',
          error: 'Erro ao importar o fluxo',
          action: 'Importar'
        },

        // Editor principal
        create: "Criar",
        editing: "Editando fluxo",
        createNew: "Criar novo fluxo",
        save: "Salvar",
        test: "Testar",
        validate: "Validar",
        preview: "Prévia",
        saveFlow: "Salvar fluxo",
        close: "Fechar",
        export: "Exportar fluxo",
        validationErrorOutput: "Saída para erro",
        success: {
          saved: "Fluxo salvo com sucesso",
          testStarted: "Teste iniciado com sucesso",
          exported: 'Fluxo exportado com sucesso'
        },

        validation: {
          noStartNode: "O fluxo deve conter um nó de início",
          noEndOrSwitchNode: "O fluxo deve conter pelo menos um nó de fim ou um nó de troca de fluxo",
          success: "Fluxo validado com sucesso!",
          nameRequired: "O nome é obrigatório",
          apiKeyRequired: "A chave API é obrigatória",
          promptRequired: "O prompt é obrigatório",
          urlRequired: "A URL é obrigatória",
          invalidUrl: "URL inválida",
          typebotIdRequired: "O ID do Typebot é obrigatório",
          fixErrors: "Por favor, corrija os erros antes de salvar"
        },
        preview: {
          title: "Prévia",
          simulation: "Simulação do fluxo",
          welcome: "Iniciando simulação do fluxo...",
          startNode: "Fluxo iniciado",
          endNode: "Fluxo finalizado",
          terminalNode: "Fluxo finalizado",
          checkingCondition: "Verificando condição",
          switchFlow: "Troca de fluxo para",
          attendantNode: "Transferindo para atendente humano...",
          apiCall: "Chamada API para",
          apiSuccess: "Chamada concluída com sucesso!",
          evaluating: "Avaliando variável:",
          conditionMatch: "Condição correspondente",
          noConditionMatched: "Nenhuma condição correspondente",
          defaultPath: "Seguindo caminho padrão",
          typeMessage: "Digite uma mensagem...",
          disabled: "Simulação em progresso...",
          restart: "Reiniciar simulação",
          transferVariables: "Transferindo as variáveis para o próximo fluxo",
          simulatedContinuation: "Continuando o fluxo...",
          pauseAuto: "Pausar reprodução automática",
          playAuto: "Iniciar reprodução automática",
          next: "Próximo passo",
          completed: "Simulação concluída",
          waitingInput: "Aguardando entrada do usuário",
          inProgress: "Em progresso",
          openaiCall: "Iniciando integração com OpenAI: {{name}}",
          openaiResponse: "Resposta do OpenAI gerada com sucesso!",
          tagOperation: "Executando node de TAG",
          queueTransfer: "Executando node de transferência de Fila",
          withVoice: "Resposta convertida em áudio",
          typebotStart: "Iniciando fluxo do Typebot: {{name}}",
          typebotComplete: "Fluxo do Typebot: {{name}} concluído com sucesso",
          menuTitle: 'Menu apresentado ao usuário',
          menuOption: 'Opção de menu selecionada',
          inputRequired: "Por favor, forneça uma resposta do tipo: {{type}}",
          validationRequired: "A resposta será validada como: {{type}}",
          validationFailed: "A resposta não passou na validação. Simulando fluxo de erro."
        },

        errors: {
          loadFailed: "Falha ao carregar fluxo",
          saveFailed: "Falha ao salvar fluxo",
          testFailed: "Falha ao iniciar teste",
          exportFailed: 'Falha ao exportar o fluxo'
        },
        validation: {
          nameRequired: "O nome do fluxo é obrigatório",
          whatsappRequired: "É necessário selecionar um WhatsApp",
          nameRequired: "O nome é obrigatório",
          apiKeyRequired: "A chave de API é obrigatória",
          promptRequired: "O prompt é obrigatório",
          urlRequired: "A URL é obrigatória",
          invalidUrl: "URL inválida",
          typebotIdRequired: "O ID do Typebot é obrigatório",
          fixErrors: "Por favor, corrija os erros antes de salvar"
        },

        // Formulário de fluxo
        form: {
          name: "Nome do fluxo",
          description: "Descrição",
          whatsapp: "WhatsApp",
          selectWhatsapp: "Selecione um WhatsApp"
        },

        // Sidebar
        sidebar: {
          nodes: "Nós disponíveis",
          dragHelp: "Arraste os nós para o fluxo",
          connectHelp: "Conecte os nós para criar seu fluxo",
          help: "Ajuda",
          messageNodes: "MENSAGENS",
          flowNodes: "FLUXO",
          integrationNodes: "INTEGRAÇÕES",
          helpTooltip: "Documentação dos nós",
          tagDescription: "Adiciona ou remove tags dos contatos",
        },

        help: {
          title: "Documentação dos Nós",
          introduction: "Os nós são os elementos básicos para a construção de fluxos. Cada tipo de nó possui funcionalidades específicas e pode ser configurado para diferentes comportamentos. Esta documentação fornece informações detalhadas sobre cada tipo de nó disponível no sistema.",
          propertiesSection: "Propriedades",
          connectionsSection: "Conexões",
          usageSection: "Como Usar",
          exampleSection: "Exemplo:",
          propertyName: "Propriedade",
          propertyDescription: "Descrição",
          connectionType: "Tipo",
          connectionDescription: "Descrição",

          menuNode: {
            title: 'Menu',
            description: 'Este nó cria um menu interativo com opções para o usuário escolher.',
            properties: {
              label: 'Rótulo identificador do nó (opcional)',
              menuTitle: 'Título que será exibido no menu',
              menuOptions: 'Lista de opções do menu que o usuário pode selecionar',
              useEmoji: 'Opção para utilizar emojis nas opções do menu'
            },
            connections: {
              defaultOutput: 'Saída padrão usada quando nenhuma opção for selecionada',
              optionOutputs: 'Uma saída para cada opção do menu, permitindo diferentes fluxos baseados na escolha do usuário'
            },
            usage: 'Use este nó para apresentar um conjunto de opções para o usuário escolher, criando interações direcionadas e ramificações no fluxo.',
            example: 'Um menu para o usuário escolher qual tipo de atendimento deseja: "Suporte Técnico", "Vendas", "Reclamações".'
          },

          properties: {
            label: "Rótulo",
            messageType: "Tipo de Mensagem",
            message: "Mensagem",
            mediaUrl: "URL de Mídia",
            caption: "Legenda",
            question: "Pergunta",
            variableName: "Nome da Variável",
            inputType: "Tipo de Entrada",
            options: "Opções",
            variable: "Variável",
            conditions: "Condições",
            targetFlow: "Fluxo Destino",
            transferVariables: "Transferir Variáveis",
            assignmentType: "Tipo de Atribuição",
            assignedUser: "Atendente Atribuído",
            timeout: "Timeout",
            endFlow: "Encerrar Fluxo",
            method: "Método HTTP",
            url: "URL",
            headers: "Headers",
            secretKey: "Chave Secreta",
            contentType: "Content-Type",
            body: "Corpo (Body)",
            queryParams: "Parâmetros de Query",
            responseVariable: "Variável de Resposta",
            responseFilter: "Filtro de Resposta",
            authentication: "Autenticação",
            validationType: "Tipo de validação",
            useValidationErrorOutput: "Usar saída para erro"
          },

          connections: {
            input: "Entrada",
            output: "Saída",
            singleInput: "Uma entrada no topo do nó",
            singleOutput: "Uma saída na parte inferior do nó"
          },

          messageNode: {
            title: "Nó de Mensagem",
            description: "O nó de mensagem permite enviar uma mensagem de texto simples para o contato. É o tipo de nó mais básico e mais utilizado.",
            properties: {
              label: "Nome de identificação do nó no fluxo",
              messageType: "Tipo da mensagem (texto, imagem, áudio, vídeo, arquivo)",
              message: "Conteúdo da mensagem a ser enviada",
              mediaUrl: "URL da mídia a ser enviada (para tipos não-texto)"
            },
            usage: "Use este nó para enviar informações, instruções ou conteúdo multimídia para o contato. É ideal para fornecer informações ou instruções antes de fazer perguntas.",
            example: "Enviar uma mensagem de boas-vindas, explicar como um serviço funciona, ou enviar uma imagem promocional."
          },

          imageNode: {
            title: "Nó de Imagem",
            description: "O nó de imagem permite enviar uma imagem para o contato, com a opção de incluir uma legenda explicativa.",
            properties: {
              label: "Nome de identificação do nó no fluxo",
              mediaUrl: "A imagem a ser enviada (upload ou URL)",
              caption: "Texto opcional que acompanha a imagem"
            },
            usage: "Utilize este nó quando precisar enviar imagens como fotos de produtos, instruções visuais, infográficos ou qualquer conteúdo visual.",
            example: "Enviar um catálogo de produtos, um mapa de localização, ou um banner promocional."
          },

          queueNode: {
            title: "Setor",
            description: "Este nó transfere o atendimento para um setor específico e encerra o fluxo.",
            properties: {
              label: "Rótulo identificador do nó (opcional)",
              queue: "Setor para a qual o atendimento será transferido"
            },
            connections: {
              output: "Nenhuma saída - encerra o fluxo e transfere para o setor"
            },
            usage: "Utilize este nó quando precisar transferir o atendimento para um setor específico e encerrar o fluxo atual. O ticket ficará pendente no setor selecionada.",
            example: "Um cliente solicita atendimento especializado, e você transfere o ticket para o setor de \"Suporte Técnico\", encerrando o fluxo de bot."
          },

          openaiNode: {
            title: "Nó OpenAI",
            description: "O nó OpenAI permite integrar inteligência artificial ao seu fluxo, gerando respostas baseadas em modelos de linguagem avançados.",
            properties: {
              label: "Rótulo para identificação do nó no fluxo",
              name: "Nome da integração para referência",
              apiKey: "Chave API para autenticação no serviço OpenAI",
              prompt: "Instruções detalhadas para direcionar o comportamento do modelo",
              voice: "Opção para converter texto em fala com vozes disponíveis",
              temperature: "Controla a aleatoriedade das respostas (0-2)",
              maxTokens: "Limita o tamanho da resposta gerada",
              maxMessages: "Define o número máximo de interações para contexto"
            },
            usage: "Use para criar assistentes virtuais, responder perguntas com IA ou gerar conteúdo dinâmico baseado nas entradas do usuário.",
            example: "Um assistente virtual que responde perguntas sobre produtos da empresa, usando um prompt personalizado para garantir respostas precisas e alinhadas com a marca."
          },

          typebotNode: {
            title: "Nó Typebot",
            description: "O nó Typebot permite integrar fluxos externos criados na plataforma Typebot, possibilitando experiências conversacionais complexas e personalizadas.",
            properties: {
              label: "Rótulo para identificação do nó no fluxo",
              name: "Nome da integração para referência",
              typebotUrl: "URL base do Typebot onde o fluxo está hospedado",
              typebotId: "Identificador único do fluxo Typebot a ser integrado",
              typebotToken: "Token de autenticação para acessar fluxos protegidos",
              saveResponse: "Opção para armazenar as respostas do usuário no fluxo Typebot"
            },
            usage: "Use para integrar fluxos complexos pré-construídos, questionários, formulários ou processos de coleta de dados estruturados.",
            example: "Um processo de qualificação de leads que usa um Typebot para coletar informações específicas do cliente antes de encaminhar para um atendente humano."
          },

          questionNode: {
            title: "Nó de Pergunta",
            description: "O nó de pergunta permite fazer uma pergunta ao contato e capturar sua resposta, podendo oferecer opções pré-definidas ou aceitar respostas livres.",
            properties: {
              label: "Nome de identificação do nó no fluxo",
              question: "A pergunta a ser enviada ao contato",
              variableName: "Nome da variável onde a resposta será armazenada",
              inputType: "Tipo de resposta esperada (opções, texto, número, email, telefone)",
              options: "Lista de opções para o contato escolher (quando o tipo é \"opções\")",
              validationType: "Define o tipo de validação a ser aplicada na resposta",
              useValidationErrorOutput: "Cria uma saída adicional para lidar com erros de validação"
            },
            connections: {
              defaultOutput: "Saída padrão para tipo de texto livre ou quando nenhuma opção corresponde",
              optionOutputs: "Uma saída para cada opção definida (quando o tipo é \"opções\")",
              validationErrorOutput: "Saída usada quando a resposta falha na validação"
            },
            usage: "Use este nó para interagir com o contato, coletar informações ou direcionar o fluxo com base em suas escolhas.",
            example: "Perguntar qual departamento o contato deseja falar, solicitar um e-mail para cadastro, ou pedir uma avaliação numérica de 1 a 5."
          },

          conditionalNode: {
            title: "Nó de Condição",
            description: "O nó de condição permite ramificar o fluxo com base no valor de uma variável, criando caminhos diferentes dependendo da condição atendida.",
            properties: {
              label: "Nome de identificação do nó no fluxo",
              variable: "Nome da variável a ser avaliada nas condições",
              conditions: "Lista de condições com valores esperados e destinos correspondentes"
            },
            connections: {
              defaultOutput: "Saída padrão quando nenhuma condição é atendida",
              conditionOutputs: "Uma saída para cada condição definida"
            },
            usage: "Utilize este nó para criar ramificações no fluxo com base em informações previamente coletadas ou variáveis do sistema.",
            example: "Verificar se o cliente já está cadastrado, direcionar para departamentos diferentes conforme a escolha anterior, ou personalizar o fluxo com base em dados do cliente."
          },

          endNode: {
            title: "Nó de Fim",
            description: "O nó de fim marca o término de um caminho no fluxo. Quando o fluxo atinge este nó, a execução é encerrada para o contato.",
            properties: {
              label: "Nome de identificação do nó no fluxo"
            },
            connections: {
              output: "Não possui saídas"
            },
            usage: "Use este nó para marcar o término de um caminho no fluxo, encerrando a interação automatizada.",
            example: "Finalizar o atendimento após fornecer a informação solicitada, encerrar o fluxo após coleta de dados, ou terminar um branch específico do fluxo."
          },

          switchFlowNode: {
            title: "Nó de Troca de Fluxo",
            description: "O nó de troca de fluxo permite transferir a execução para outro fluxo, possibilitando a modularização dos fluxos em partes menores e reutilizáveis.",
            properties: {
              label: "Nome de identificação do nó no fluxo",
              targetFlow: "Fluxo para o qual a execução será transferida",
              transferVariables: "Opção para transferir as variáveis do fluxo atual para o novo fluxo"
            },
            connections: {
              output: "Não possui saídas no fluxo atual, já que a execução é transferida para outro fluxo"
            },
            usage: "Utilize este nó para criar fluxos modulares que podem ser reutilizados em diferentes contextos ou para organizar fluxos complexos em partes menores.",
            example: "Transferir para um fluxo de cadastro, iniciar um fluxo de pagamento, ou direcionar para um submenu específico."
          },

          attendantNode: {
            title: "Nó de Atendente",
            description: "O nó de atendente transfere a conversa para um atendente humano, permitindo a continuação do atendimento por um operador real.",
            properties: {
              label: "Nome de identificação do nó no fluxo",
              assignmentType: "Determina se a atribuição será manual (para um atendente específico) ou automática (baseada em setor)",
              assignedUser: "Atendente específico para o qual o atendimento será direcionado (quando o tipo é \"manual\")",
              timeout: "Tempo máximo de espera para atribuição do atendimento",
              endFlow: "Determina se o fluxo será encerrado após a transferência para o atendente"
            },
            connections: {
              output: "Uma saída que será seguida se o atendimento não for atribuído dentro do timeout"
            },
            usage: "Use este nó quando o contato precisar falar com um atendente humano, seja para resolver problemas complexos ou fornecer atendimento personalizado.",
            example: "Transferir para um atendente após tentativas malsucedidas de resolução automatizada, direcionar para um especialista em um assunto específico, ou oferecer atendimento humano como opção."
          },

          webhookNode: {
            title: "Nó de Webhook",
            description: "O nó de webhook permite realizar chamadas HTTP para sistemas externos, enviando e recebendo dados para integração com outras plataformas.",
            properties: {
              label: "Nome de identificação do nó no fluxo",
              method: "Método da requisição (GET, POST, PUT, PATCH, DELETE)",
              url: "Endereço do endpoint para o qual a requisição será enviada",
              headers: "Cabeçalhos HTTP a serem enviados com a requisição",
              variableName: "Nome da variável onde a resposta será armazenada",
              secretKey: "Chave para assinatura HMAC da requisição (segurança)"
            },
            usage: "Utilize este nó para integrar o fluxo com sistemas externos, buscar ou enviar dados para outras plataformas.",
            example: "Verificar o status de um pedido em um e-commerce, enviar dados de cadastro para um CRM, ou consultar informações em uma API externa."
          },

          apiNode: {
            title: "Nó de API Request",
            description: "O nó de API Request permite realizar chamadas API mais elaboradas com configurações avançadas, tratamento de erros e processamento de resposta.",
            properties: {
              label: "Nome de identificação do nó no fluxo",
              method: "Método da requisição (GET, POST, PUT, PATCH, DELETE)",
              url: "Endereço do endpoint para o qual a requisição será enviada",
              headers: "Cabeçalhos HTTP a serem enviados com a requisição",
              contentType: "Tipo de conteúdo do corpo da requisição",
              body: "Dados a serem enviados no corpo da requisição (para métodos não-GET)",
              queryParams: "Parâmetros a serem adicionados à URL como query string",
              responseVariable: "Nome da variável onde a resposta será armazenada",
              responseFilter: "Caminho JSONPath para extrair apenas parte da resposta",
              authentication: "Configurações de autenticação (Basic Auth, Bearer Token, API Key)"
            },
            connections: {
              successOutput: "Saída seguida quando a requisição é bem-sucedida",
              errorOutput: "Saída seguida quando a requisição falha"
            },
            usage: "Use este nó para integrações avançadas com APIs que exigem configurações específicas, tratamento de erros ou processamento de dados.",
            example: "Integrar com APIs de pagamento, sistemas CRM complexos, ou serviços que exigem autenticação específica e tratamento de respostas elaborado."
          },
          tagNode: {
            title: "Nó de Tag",
            description: "O nó de tag permite adicionar ou remover tags dos contatos. As tags são úteis para segmentação e automação de campanhas.",
            properties: {
              label: "Nome de identificação do nó no fluxo",
              operation: "Define se as tags serão adicionadas ou removidas do contato",
              selectionMode: "Determina se apenas uma ou múltiplas tags serão manipuladas",
              tags: "Lista de tags que serão adicionadas ou removidas do contato"
            },
            connections: {
              output: "Uma saída que será seguida após a adição/remoção das tags"
            },
            usage: "Utilize este nó para adicionar ou remover tags dos contatos durante o fluxo de conversa, permitindo segmentação futura.",
            example: "Adicionar uma tag 'Interessado' quando o contato mostra interesse em um produto, ou remover a tag 'Não contatado' após a primeira interação."
          }
        },

        openai: {
          name: "Nome da integração",
          apiKey: "Chave API OpenAI",
          prompt: "Prompt",
          promptHelp: "Insira as instruções para o modelo OpenAI",
          voice: "Voz",
          voiceKey: "Chave da API de voz",
          voiceRegion: "Região da API de voz",
          temperature: "Temperatura",
          maxTokens: "Máximo de tokens",
          maxMessages: "Máximo de mensagens",
          helpText: "Este nó permite integrar o OpenAI ao seu fluxo para criar respostas dinâmicas baseadas em inteligência artificial. Defina o prompt adequado para orientar o comportamento do modelo."
        },

        typebot: {
          name: "Nome da integração",
          typebotUrl: "URL do Typebot",
          typebotUrlHelp: "URL completo do seu Typebot (ex: https://bot.exemplo.com)",
          typebotId: "ID do Typebot",
          typebotToken: "Token do Typebot",
          typebotTokenHelp: "Opcional. Usado para autenticação",
          saveResponse: "Salvar resposta do Typebot",
          helpText: "Este nó permite integrar um fluxo do Typebot no seu atendimento. Configure o URL e ID corretos para direcionar o usuário para o fluxo apropriado."
        },

        queue: {
          transferTo: "Transferir para setor",
          selectQueue: "Selecione o setor",
          queueRequired: "Setor é obrigatório",
          endFlow: "Encerra o fluxo",
          terminalDescription: "Quando o atendimento é transferido para um setor, o fluxo é encerrado. O ticket ficará pendente no setor selecionado.",
          helpText: "Nota: O nó de setor transfere a conversa para um setor específico. O fluxo será encerrado e o ticket ficará pendente no setor selecionado."
        },

        // Nós  //
        nodes: {
          start: "Início",
          end: "Fim",
          message: "Conteúdo",
          conditional: "Condição",
          attendant: "Atendente",
          switchFlow: "Trocar fluxo",
          user: "Usuário",
          location: "Localização",
          outputs: "Este nó tem {{count}} saídas",
          openai: "OpenAI",
          typebot: "Typebot",
          queue: "Setor",
          webhook: "Webhook",
          image: "Imagem",
          question: "Pergunta",
          database: "Banco de Dados",
          openai: "OpenAI",
          typebot: "Typebot",
          withVoice: "Com Voz",
          automatedFlow: "Fluxo Automatizado",
          api: "Requisição API",
          end: "Fim",
          tag: {
            title: "Tag",
            configuration: "Configuração de Tags",
            selectTags: "Selecionar Tags",
            searchTags: "Pesquisar tags",
            createTag: "Criar tag",
            noTags: "Nenhuma tag encontrada",
            noTagsSelected: "Nenhuma tag selecionada",
            noResults: "Nenhum resultado encontrado",
            operation: "Operação",
            addOperation: "Adicionar tag",
            removeOperation: "Remover tag",
            selectionMode: "Modo de seleção",
            singleMode: "Única tag",
            multipleMode: "Múltiplas tags",
            selectOne: "Selecione uma tag",
            selectMultiple: "Selecione uma ou mais tags",
            preview: "Visualização",
            willAdd: "Será adicionado ao contato:",
            willRemove: "Será removido do contato:",
            helpText: "Este nó permite adicionar ou remover tags dos contatos. As tags são úteis para segmentação e automação de campanhas."
          },
        },

        // Painel de propriedades
        properties: {
          title: "Propriedades do Nó",
          label: "Rótulo",
          message: "Mensagem",
          messagePlaceholder: "Digite a mensagem para enviar...",
          messageType: "Tipo de mensagem",
          variable: "Variável",
          variablePlaceholder: "Nome da variável a ser avaliada",
          conditions: "Condições",
          conditionValue: "Valor da condição",
          targetNode: "Nó de destino",
          addCondition: "Adicionar condição",
          unknownNodeType: "Tipo de nó desconhecido",
          buttons: "Botões",
          buttonText: "Texto do botão",
          buttonValue: "Valor do botão",
          addButton: "Adicionar botão",
          mode: "Modo",
          flow: "Fluxo",
          timeout: "Timeout",
          caption: "Legenda",
          address: "Endereço",
          url: 'URL',
          method: 'Método',
          headers: 'Cabeçalhos',
          body: 'Corpo da Requisição',
          responseVariable: 'Variável de Resposta',
          authType: 'Tipo de Autenticação',
          maxMessages: "Máximo de mensagens",
          name: "Nome",
          apiKey: "Chave API",
          prompt: "Prompt",
          voice: "Voz",
          temperature: "Temperatura",
          maxTokens: "Máximo de tokens",
          typebotUrl: "URL do Typebot",
          typebotId: "ID do Typebot",
          typebotToken: "Token do Typebot",
          saveResponse: "Salvar resposta",
          types: {
            text: "Texto",
            image: "Imagem",
            audio: "Áudio",
            video: "Vídeo",
            file: "Arquivo",
            button: "Botões",
            list: "Lista"
          },
          mediaUrl: "URL da mídia",
          mediaUrlPlaceholder: "Digite a URL da mídia",
          listItems: "Itens da lista",
          listTitle: "Título da lista",
          listButtonText: "Texto do botão da lista",
          triggers: "Gatilhos",
          triggersPlaceholder: "Palavras que iniciam o fluxo (separadas por vírgula)",
          exclusive: "Exclusivo (impede outros fluxos)"
        },

        // Controles do fluxo
        controls: {
          zoomIn: "Ampliar",
          zoomOut: "Reduzir",
          fitView: "Ajustar à tela",
          undo: "Desfazer",
          redo: "Refazer"
        },

        // Tooltips
        tooltips: {
          deleteNode: "Excluir nó",
          duplicateNode: "Duplicar nó",
          connectNodes: "Conecte para definir o próximo nó"
        },

        // Mensagens
        messages: {
          deleteNode: "Tem certeza que deseja excluir este nó?",
          connectionRemoved: "Conexão removida",
          connectionAdded: "Conexão adicionada",
          nodeAdded: "Nó adicionado",
          nodeRemoved: "Nó removido",
          invalidConnection: "Conexão inválida",
          maxConnectionsReached: "Número máximo de conexões atingido",
          noContent: "Sem conteúdo",
          noImage: "Sem imagem",
          uploaded: "carregado",
          unsupportedType: "Tipo de mensagem não suportado",
          noConditions: "Nenhuma condição definida"
        },

        messageTypes: {
          text: "Texto",
          image: "Imagem",
          audio: "Áudio",
          video: "Vídeo",
          document: "Documento",
          location: "Localização",
          unknown: "Tipo desconhecido"
        },

        outputs: {
          success: "Sucesso",
          error: "Erro",
          below: "abaixo",
          right: "à direita",
          noSelection: 'Nenhuma seleção',
          default: "Saída padrão",
          validationError: "Erro de validação"
        },

        actions: {
          duplicate: "Duplicar",
          deleteEdge: "Remover conexão",
          edit: "Editar",
          delete: "Excluir",
          transferVariables: "Transferir variáveis"
        },

        // Tipos de execução
        execution: {
          testMode: "Modo de teste",
          startedAt: "Iniciado em",
          status: {
            active: "Em execução",
            completed: "Concluído",
            error: "Erro",
            waitingInput: "Aguardando resposta"
          }
        },
        inputTypes: {
          text: "Texto",
          number: "Número",
          email: "E-mail",
          phone: "Telefone",
          cpf: "CPF",
          cnpj: "CNPJ",
          media: "Mídia",
          options: "Opções",
          undefined: "Indefinido"
        },
        validationTypes: {
          none: "Sem validação",
          email: "Validação de E-mail",
          cpf: "Validação de CPF",
          cnpj: "Validação de CNPJ",
          regex: "Expressão Regular"
        },
        modes: {
          automatic: "Automático",
          manual: "Manual"
        },
        units: {
          seconds: "segundos"
        }
      },

      showTicketOpenModal: {
        title: {
          header: "Atendimento em Andamento"
        },
        form: {
          message: "Este contato já está sendo atendido",
          user: "Atendente",
          queue: "Setor",
          messageWait: "Aguarde, você será transferido"
        },
        buttons: {
          close: "Fechar"
        }
      },
      adminDashboard: {
        title: "Dashboard Administrativo",
        loadingMessage: "Carregando dados do dashboard...",
        fetchError: "Erro ao carregar dados. Por favor, tente novamente.",
        updatingMessage: "Atualizando dados...",
        lastUpdate: "Última atualização: {{time}}",
        refreshTooltip: "Atualizar dados",

        timeRanges: {
          last7days: "Últimos 7 dias",
          last30days: "Últimos 30 dias",
          last90days: "Últimos 90 dias"
        },

        tabs: {
          overview: "Visão Geral",
          financial: "Financeiro",
          system: "Sistema"
        },

        metrics: {
          activeCompanies: "Empresas Ativas",
          total: "total",
          activeUsers: "Usuários Ativos",
          lastMonth: "último mês",
          monthlyRevenue: "Receita Mensal",
          avgResponseTime: "Tempo Médio Resposta",
          pending: "pendentes"
        },

        contactMap: {
          title: "Distribuição Geográfica",
          loading: "Carregando mapa...",
          totalContacts: "Total de Contatos",
          noContacts: "Sem contatos",
          concentration: "Concentração",
          info: "Visualização da distribuição de contatos por estado"
        },

        qualityMetrics: {
          title: "Métricas de Qualidade",
          info: "Indicadores de qualidade do atendimento",
          fcr: {
            title: "Resolução no Primeiro Contato",
            subtitle: "Total resolvido: {{total}}",
            trend: "Tendência FCR"
          },
          directResolution: {
            title: "Resolução Direta",
            subtitle: "Total direto: {{total}}",
            trend: "Tendência Resolução Direta"
          },
          chartHelp: "O gráfico mostra a evolução das métricas de qualidade ao longo do tempo"
        },

        messaging: {
          title: "Métricas de Mensagens",
          lastUpdate: "Última atualização",
          info: "Informações sobre métricas de mensagens",
          totalMessages: "Total de Mensagens",
          sent: "Enviadas",
          received: "Recebidas",
          averageResponseTime: "Tempo médio de resposta",
          engagementRate: "Taxa de Engajamento",
          growth: "crescimento",
          activeUsers: "Usuários Ativos",
          avgMessagesPerUser: "Média de Mensagens por Usuário",
          peakHour: "Hora de Pico",
          messages: "mensagens",
          responseTime: "Tempo de Resposta",
          failureRate: "Taxa de Falha",
          disconnections: "Desconexões Hoje"
        },

        whatsapp: {
          title: "Status WhatsApp",
          info: "Monitoramento das conexões WhatsApp",
          activeConnections: "Conexões Ativas",
          status: {
            connected: "Conectado",
            disconnected: "Desconectado",
            connecting: "Conectando"
          },
          deliveryRate: "Taxa de Entrega",
          messages: "Mensagens",
          responseTime: "Tempo Resposta",
          failureRate: "Taxa Falha",
          disconnections: "Desconexões"
        },

        performance: {
          title: "Performance do Sistema",
          info: "Métricas de performance e recursos",
          cpuUsage: "Uso de CPU",
          memoryUsage: "Uso de Memória",
          networkUsage: "Uso de Rede",
          cpuCores: "Núcleos CPU",
          totalMemory: "Memória Total",
          statusChecks: "Verificações",
          services: {
            database: "Banco de Dados",
            cache: "Cache",
            network: "Rede"
          },
          alerts: "Alertas",
          healthy: "Sistema Saudável",
          issues: "Problemas Detectados",
          avgResponseTime: "Tempo Resposta Médio",
          requestsPerSecond: "Requisições/s",
          errorRate: "Taxa de Erro",
          systemInfo: "Informações do Sistema"
        },

        financialMetrics: {
          title: "Métricas Financeiras",
          info: "Indicadores financeiros e receita",
          monthlyRevenue: "Receita Mensal",
          revenue: "Receita",
          planDistribution: "Distribuição por Plano",
          defaultRate: "Taxa de Inadimplência",
          projection: "Projeção de Receita",
          projectedRevenue: "Receita Projetada",
          actualRevenue: "Receita Real"
        },

        engagementMetrics: {
          title: "Métricas de Engajamento",
          info: "Métricas de interação e envolvimento",
          messagesPerDay: "Mensagens/Dia",
          campaignSuccess: "Sucesso Campanhas",
          activeContacts: "Contatos Ativos",
          deliveryRate: "Taxa de Entrega"
        },
        campaignMetrics: {
          title: "Métricas de Campanha",
          successRate: "Taxa de Sucesso",
          active: "Ativas",
          completed: "Concluídas",
          pending: "Pendentes",
          failed: "Falhas",
          sent: "Enviadas",
          delivered: "Entregues",
          info: "Informações sobre as métricas de campanha",
          status: {
            active: "Campanhas Ativas",
            completed: "Campanhas Concluídas",
            pending: "Campanhas Pendentes",
            failed: "Campanhas com Falha"
          },
          totalContacts: "Total de Contatos",
          deliveryRate: "Taxa de Entrega",
          engagementRate: "Taxa de Engajamento",
          performance: "Gráfico de Performance",
          byType: "Distribuição por Tipo",
          info: "Análise das campanhas de mensagens"
        }
      },
      queueHelpModal: {
        title: "Ajuda - Opções de Setor",
        helpButtonTooltip: "Abrir ajuda sobre opções de setor",
        tabs: {
          overview: "Visão Geral",
          optionTypes: "Tipos de Opções",
          advanced: "Recursos Avançados",
          examples: "Exemplos"
        },
        overview: {
          subtitle: "O que são Opções de Setor?",
          description: "As Opções de setor permitem criar fluxos interativos de atendimento automatizado. Com elas, é possível configurar menus de atendimento, coletar informações dos clientes, aplicar validações, transferir conversas e muito mais.",
          commonUseCases: "Casos de uso comuns",
          useCase1: "Menu de Atendimento",
          useCase1Desc: "Crie menus interativos para direcionar os clientes para o setor correto",
          useCase2: "Transferência Automática",
          useCase2Desc: "Transfira conversas para filas, usuários ou outros números conforme necessário",
          useCase3: "Coleta de Dados",
          useCase3Desc: "Colete e valide informações dos clientes antes do atendimento humano",
          structureTitle: "Estrutura das Opções",
          structureDesc: "As opções de setor são organizadas em uma estrutura hierárquica:",
          structure1: "Etapas",
          structure1Desc: "Cada nível representa uma etapa do fluxo de atendimento",
          structure2: "Mensagens",
          structure2Desc: "Cada etapa pode conter uma mensagem e opções de resposta",
          structure3: "Teste e Visualização",
          structure3Desc: "É possível testar o fluxo usando o botão de reprodução"
        },
        optionTypes: {
          subtitle: "Tipos de Opções Disponíveis",
          description: "Existem vários tipos de opções que podem ser utilizadas para diferentes finalidades:",
          textDescription: "Envia uma mensagem de texto simples para o cliente.",
          textUseWhen: "Use para mensagens informativas, solicitações ou instruções.",
          audioDescription: "Envia um arquivo de áudio para o cliente.",
          audioUseWhen: "Use para mensagens de voz, instruções de áudio ou saudações personalizadas.",
          videoDescription: "Envia um arquivo de vídeo para o cliente.",
          videoUseWhen: "Use para tutoriais, demonstrações de produtos ou apresentações.",
          imageDescription: "Envia uma imagem para o cliente.",
          imageUseWhen: "Use para mostrar produtos, catálogos, instruções visuais ou qualquer conteúdo gráfico.",
          documentDescription: "Envia um documento para o cliente (PDF, DOCX, etc).",
          documentUseWhen: "Use para enviar manuais, contratos, formulários ou qualquer documento formal.",
          contactDescription: "Envia um cartão de contato para o cliente.",
          contactUseWhen: "Use para compartilhar contatos importantes, como suporte técnico, vendas ou outros departamentos.",
          transferTitle: "Opções de Transferência",
          transferDescription: "Permitem transferir a conversa para diferentes destinos:",
          transferQueueDesc: "Transfere a conversa para outro setor de atendimento",
          transferUserDesc: "Transfere a conversa para um atendente específico",
          transferWhatsappDesc: "Transfere a conversa para outro número de WhatsApp da sua conta",
          transferUseWhen: "Use quando precisar direcionar o cliente para o setor ou atendente mais adequado.",
          validationDescription: "Valida as informações fornecidas pelo cliente conforme regras predefinidas.",
          validationUseWhen: "Use para coletar e validar dados como CPF, e-mail, telefone ou informações personalizadas.",
          validationCPFDesc: "Valida se o formato do CPF está correto e se é um CPF válido",
          validationEmailDesc: "Valida se o formato do e-mail está correto",
          validationPhoneTitle: "Telefone",
          validationPhoneDesc: "Valida se o formato do número de telefone está correto",
          validationCustomTitle: "Personalizado",
          validationCustomDesc: "Permite criar validações personalizadas usando expressões regulares (regex)",
          conditionalDescription: "Analisa a resposta do cliente e direciona para diferentes opções com base em condições.",
          conditionalUseWhen: "Use para criar fluxos dinâmicos que se adaptam às respostas dos clientes.",
          conditionalOperators: "Operadores disponíveis",
          operatorEqualsDesc: "Verifica se a resposta é exatamente igual ao valor especificado",
          operatorContainsDesc: "Verifica se a resposta contém o valor especificado",
          operatorStartsWithDesc: "Verifica se a resposta começa com o valor especificado",
          operatorEndsWithDesc: "Verifica se a resposta termina com o valor especificado",
          operatorRegexDesc: "Verifica se a resposta corresponde ao padrão regex especificado"
        },
        advanced: {
          subtitle: "Recursos Avançados",
          description: "Explore recursos avançados para criar fluxos de atendimento mais sofisticados:",
          nestingTitle: "Estrutura Aninhada",
          nestingDesc: "É possível criar estruturas aninhadas para organizar o fluxo de atendimento em níveis hierárquicos.",
          nestingExample: "Exemplo de estrutura aninhada",
          variablesTitle: "Variáveis na Mensagem",
          variablesDesc: "Use variáveis para personalizar as mensagens com informações do contato, do setor ou da empresa.",
          variablesExample: "Exemplo de uso de variáveis",
          variablesSample: "Olá {{contact.name}}, seja bem-vindo à {{queue.name}}!",
          flowControlTitle: "Controle de Fluxo",
          flowControlDesc: "Combine opções condicionais e validações para criar fluxos de atendimento dinâmicos.",
          conditionalExample: "Exemplo de fluxo condicional",
          conditionalStep1: "Configure uma pergunta inicial (ex: 'Como posso ajudar?')",
          conditionalStep2: "Adicione uma opção do tipo 'conditional'",
          conditionalStep3: "Configure condições baseadas em palavras-chave (ex: 'suporte', 'compra')",
          conditionalStep4: "Defina destinos diferentes para cada condição",
          previewTitle: "Visualização e Teste",
          previewDesc: "Use o recurso de visualização para testar como as mensagens aparecerão para o cliente.",
          previewSteps: "Como usar o recurso de visualização"
        },
        examples: {
          subtitle: "Exemplos Práticos",
          description: "Veja exemplos de configurações comuns para inspirar seus fluxos de atendimento:",
          menuTitle: "Menu de Atendimento",
          menuDescription: "Um menu básico de atendimento que direciona o cliente para diferentes setores.",
          menuExample: "Exemplo de menu",
          menuText: "Bem-vindo ao nosso atendimento! 👋\n\nSelecione uma opção digitando o número correspondente:\n\n1️⃣ Suporte Técnico\n2️⃣ Financeiro\n3️⃣ Vendas\n\nOu digite 'atendente' para falar com um de nossos colaboradores.",
          menuStep1: "Configurar a mensagem de boas-vindas com as opções",
          menuStep2: "Configurar mensagem específica do suporte técnico",
          menuStep3: "Configurar transferência para o setor do financeiro",
          menuStep4: "Configurar transferência para um atendente de vendas",
          formTitle: "Coleta de Dados",
          formDescription: "Um formulário para coletar e validar informações do cliente antes do atendimento.",
          formExample: "Exemplo de coleta de dados",
          formText: "Para prosseguirmos com seu atendimento, precisamos de algumas informações:\n\nPor favor, informe seu nome completo:",
          formStep1: "Configurar a mensagem inicial solicitando dados",
          formStep2: "Configurar validação para o nome (não vazio)",
          formStep3: "Configurar validação de e-mail",
          formStep4: "Configurar validação de CPF",
          formStep5: "Configurar mensagem de conclusão e transferência",
          conditionalTitle: "Atendimento Condicional",
          conditionalDescription: "Um fluxo que direciona o cliente com base em palavras-chave na resposta.",
          conditionalExample: "Exemplo de fluxo condicional",
          conditionalText: "Como posso ajudar você hoje? Por favor, descreva brevemente sua necessidade.",
          conditionalStep1: "Configurar a pergunta inicial",
          conditionalStep2: "Configurar a análise condicional da resposta",
          conditionalCondition1: "Se contém 'problema' ou 'não funciona'",
          conditionalTarget1: "Direcionar para opção de Suporte Técnico",
          conditionalCondition2: "Se contém 'comprar' ou 'preço'",
          conditionalTarget2: "Direcionar para opção de Vendas",
          conditionalDefault: "Opção padrão para outras respostas",
          conditionalTarget3: "Direcionar para Atendimento Geral",
          implementation: "Implementação"
        },
        common: {
          useWhen: "Quando usar",
          availableTypes: "Tipos disponíveis"
        }
      },
      groups: {
        title: "Grupos",
        createNewGroup: "Criar Novo Grupo",
        joinGroup: "Entrar em um Grupo",
        groupInfo: "Informações do Grupo",
        groupDeleted: "Grupo excluído com sucesso",
        createSuccess: "Grupo criado com sucesso",
        updateSuccess: "Grupo atualizado com sucesso",
        deleteConfirmTitle: "Confirmar exclusão",
        deleteConfirmMessage: "Tem certeza que deseja excluir o grupo {name}?",

        // Campos do formulário
        groupName: "Nome do Grupo",
        groupNamePlaceholder: "Digite o nome do grupo",
        description: "Descrição",
        settings: "Configurações",
        onlyAdminsMessage: "Somente administradores podem enviar mensagens",
        onlyAdminsSettings: "Somente administradores podem alterar configurações",
        forceDelete: "Excluir Forçadamente",
        forceDeleteConfirmTitle: "Confirmar Exclusão Forçada",
        forceDeleteConfirmMessage: "Você tem certeza que deseja excluir forçadamente o grupo \"{name}\"?",
        forceDeleteWarning: "ATENÇÃO: Esta ação irá remover o grupo apenas do sistema, ignorando erros de comunicação com o WhatsApp. Use somente quando o grupo já foi excluído no WhatsApp e ainda aparece no sistema.",
        groupForceDeleted: "Grupo excluído forçadamente com sucesso.",
        extractContacts: "Extrair Contatos de Grupo",
        extractContactsDescription: "Insira o link de convite de um grupo do WhatsApp para extrair a lista de contatos.",
        groupInviteLink: "Link de Convite do Grupo",
        downloadExcel: "Baixar Lista de Contatos",
        copyDownloadLink: "Copiar Link de Download",
        extractContactsInfo: "Este recurso permite extrair contatos de grupos públicos. O sistema entrará no grupo, extrairá os contatos e gerará um arquivo Excel que você pode baixar.",
        importContacts: "Importar Contatos para Grupo",
        importContactsDescription: "Selecione um grupo e envie um arquivo CSV ou Excel contendo os números de telefone que deseja adicionar.",
        selectGroup: "Selecionar Grupo",
        selectGroupHelp: "Escolha o grupo para o qual deseja importar contatos.",
        selectFile: "Selecionar Arquivo",
        fileFormatInfo: "O arquivo deve conter uma coluna chamada 'numero' com os números de telefone no formato internacional, sem caracteres especiais (ex: 5511999999999).",
        downloadTemplate: "Baixar Modelo de Arquivo",
        template: "Modelo",
        importSuccess: "Importação concluída: {valid} contato(s) válido(s) importado(s), {invalid} número(s) inválido(s).",
        invalidNumbers: "Números inválidos",
        importTips: "Dicas de importação",
        importTip1: "Use números no formato internacional (Ex: 5511999999999).",
        importTip2: "Verifique se os números são válidos e ativos no WhatsApp.",
        importTip3: "Evite incluir muitos números de uma só vez para prevenir bloqueio por spam.",
        // Tabs
        tabs: {
          info: "Informações",
          participants: "Participantes",
          inviteLink: "Link de Convite",
          list: "Lista",
          invites: "Convites",
          requests: "Solicitações",
          extract: "Extrair Contatos",
          import: "Importar Contatos"
        },

        // Participantes
        addParticipants: "Adicionar Participantes",
        addNewParticipants: "Adicionar Novos Participantes",
        searchContacts: "Pesquisar contatos...",
        selectedParticipants: "Participantes Selecionados",
        noParticipantsSelected: "Nenhum participante selecionado",
        searchParticipants: "Pesquisar participantes...",
        selectContacts: "Selecionar contatos",
        participantsAdded: "Participantes adicionados com sucesso",
        noParticipantsFound: "Nenhum participante encontrado",
        tryAnotherSearch: "Tente outra pesquisa ou limpe o campo de busca",
        admin: "Administrador",
        promoteToAdmin: "Promover a Administrador",
        demoteFromAdmin: "Remover Privilégios de Administrador",
        removeParticipant: "Remover Participante",
        participantPromoted: "Participante promovido a administrador",
        participantDemoted: "Privilégios de administrador removidos",
        participantRemoved: "Participante removido do grupo",

        // Link de convite
        inviteLink: "Link de Convite",
        inviteLinkDescription: "Compartilhe este link para convidar pessoas para o grupo. Qualquer pessoa com o link pode entrar no grupo.",
        generateInviteLink: "Gerar Link de Convite",
        copyLink: "Copiar Link",
        revokeAndGenerate: "Revogar e Gerar Novo",
        inviteCodeRevoked: "Link de convite revogado e novo link gerado",
        linkCopied: "Link copiado para a área de transferência",

        // Solicitações
        pendingRequests: "Solicitações Pendentes",
        noRequests: "Nenhuma solicitação pendente",
        requestsDescription: "Quando novas solicitações forem recebidas, elas aparecerão aqui.",
        requestedAt: "Solicitado em",
        approve: "Aprovar",
        reject: "Rejeitar",
        participantApproved: "Participante aprovado",
        participantRejected: "Participante rejeitado",
        requestsInfo: "Apenas solicitações de entrada em grupos com aprovação aparecem aqui.",
        selectGroupToSeeRequests: "Selecione um grupo na lista para ver as solicitações pendentes",

        // Busca e tabela
        searchPlaceholder: "Buscar grupos...",
        newGroup: "Novo Grupo",
        noGroupsFound: "Nenhum grupo encontrado",
        createGroupsMessage: "Crie um novo grupo ou entre em um grupo existente",
        table: {
          name: "Nome",
          participants: "Participantes",
          createdAt: "Criado em",
          actions: "Ações",
          rowsPerPage: "Linhas por página",
          of: "de"
        },

        // Ações da tabela
        actions: {
          edit: "Informações",
          requests: "Solicitações",
          delete: "Excluir",
          forceDelete: "Exclusão Forçada"
        },

        // Entrar em grupo
        joinByInvite: "Entrar com Código de Convite",
        joinByInviteDescription: "Para entrar em um grupo, você precisa do código de convite. Cole o código ou link de convite abaixo.",
        joinGroupDescription: "Para entrar em um grupo, você precisa do código de convite. Cole o código ou link de convite abaixo.",
        inviteCode: "Código ou Link de Convite",
        check: "Verificar",
        joining: "Entrando...",
        join: "Entrar",
        groupInfoFound: "Informações do grupo encontradas! Verifique os detalhes abaixo antes de entrar.",
        createdBy: "Criado por",
        participants: "Participantes",
        unknown: "Desconhecido",
        joinSuccess: "Entrou no grupo com sucesso",

        // Imagem de perfil
        profilePicSuccess: "Foto de perfil atualizada com sucesso",
        profilePicRemoved: "Foto de perfil removida com sucesso",
        clickToChangePhoto: "Clique para alterar a foto",
        clickToAddPhoto: "Clique para adicionar uma foto",
        removeProfilePicConfirm: "Remover foto de perfil",
        removeProfilePicMessage: "Tem certeza que deseja remover a foto de perfil deste grupo?",
        addGroupPhoto: "Adicionar foto do grupo",
        groupPhotoSelected: "Foto selecionada (clique para alterar)",
        profilePicUploadError: "Erro ao fazer upload da imagem",

        // Erros
        errors: {
          titleRequired: "O nome do grupo é obrigatório",
          participantsRequired: "Adicione pelo menos um participante",
          inviteCodeRequired: "O código de convite é obrigatório",
          invalidInviteCode: "Código de convite inválido",
          inviteCodeFailed: "Falha ao obter o código de convite",
          selectParticipants: "Selecione pelo menos um participante para adicionar",
          linkRequired: "O link de convite é obrigatório",
          extractFailed: "Falha ao extrair contatos. Tente novamente mais tarde.",
          selectGroup: "Selecione um grupo",
          selectFile: "Selecione um arquivo",
          invalidFileFormat: "Formato de arquivo inválido. Use CSV, XLSX ou XLS.",
          importFailed: "Falha ao importar contatos. Verifique o formato do arquivo e tente novamente."
        }

      },
      employers: {
        title: 'Gerenciamento de Empresas',
        searchPlaceholder: 'Buscar empresas...',
        noEmployers: 'Nenhuma empresa encontrada',

        buttons: {
          add: 'Adicionar Empresa',
          edit: 'Editar',
          delete: 'Excluir',
          cancel: 'Cancelar',
          update: 'Atualizar',
          create: 'Criar',
          refresh: 'Atualizar lista',
          filter: 'Filtrar'
        },

        table: {
          name: 'Nome',
          positions: 'Cargos',
          createdAt: 'Data de Criação',
          status: 'Status',
          actions: 'Ações',
          rowsPerPage: 'Linhas por página',
          positionsLabel: 'cargos'
        },

        status: {
          active: 'Ativo',
          inactive: 'Inativo'
        },

        modal: {
          add: 'Adicionar Nova Empresa',
          edit: 'Editar Empresa'
        },

        form: {
          name: 'Nome da Empresa',
          nameRequired: 'Nome é obrigatório'
        },
        confirmModal: {
          deleteTitle: 'Confirmar Exclusão',
          deleteMessage: 'Tem certeza que deseja excluir esta empresa?'
        },
        notifications: {
          created: 'Empresa criada com sucesso',
          updated: 'Empresa atualizada com sucesso',
          deleted: 'Empresa excluída com sucesso',
          fetchError: 'Erro ao carregar empresas',
          saveError: 'Erro ao salvar empresa',
          deleteError: 'Erro ao excluir empresa',
          nameRequired: 'Nome da empresa é obrigatório'
        },

        stats: {
          total: 'Total de Empresas',
          active: 'Empresas Ativas',
          recentlyAdded: 'Adicionadas Recentemente'
        }
      },
      positions: {
        title: 'Gerenciamento de Cargos',
        searchPlaceholder: 'Buscar cargos...',
        noDataFound: 'Ops, não temos nada por aqui.',
        buttons: {
          add: 'Adicionar Cargo',
          edit: 'Editar',
          delete: 'Excluir',
          cancel: 'Cancelar',
          update: 'Atualizar',
          create: 'Criar',
          refresh: 'Atualizar lista',
          filter: 'Filtrar'
        },

        table: {
          name: 'Nome',
          employers: 'Empresas',
          createdAt: 'Data de Criação',
          status: 'Status',
          actions: 'Ações',
          rowsPerPage: 'Linhas por página'
        },

        status: {
          active: 'Ativo',
          inactive: 'Inativo'
        },

        modal: {
          add: 'Adicionar Novo Cargo',
          edit: 'Editar Cargo',
          employersLabel: 'Empresas',
          employersPlaceholder: 'Selecione as empresas'
        },

        form: {
          name: 'Nome do Cargo',
          nameRequired: 'Nome é obrigatório'
        },

        confirmModal: {
          deleteTitle: 'Confirmar Exclusão',
          deleteMessage: 'Tem certeza que deseja excluir este cargo?'
        },

        notifications: {
          created: 'Cargo criado com sucesso',
          updated: 'Cargo atualizado com sucesso',
          deleted: 'Cargo excluído com sucesso',
          fetchError: 'Erro ao carregar cargos',
          saveError: 'Erro ao salvar cargo',
          deleteError: 'Erro ao excluir cargo',
          nameRequired: 'Nome do cargo é obrigatório'
        },

        stats: {
          total: 'Total de Cargos',
          active: 'Cargos Ativos',
          recentlyAdded: 'Adicionados Recentemente'
        }
      },
      buttons: {
        save: "Salvar",
        cancel: "Cancelar",
        close: "Fechar",
        delete: "Excluir",
        edit: "Editar",
        add: "Adicionar",
        update: "Atualizar",
        download: "Baixar arquivo",
        confirm: "Confirmar",
        export: "Exportar",
        print: "Imprimir",
        add: "Adicionar",
        saving: "Salvando...",
        filter: "Filtrar",
        clear: "Limpar",
        clearFilters: "Limpar Filtros",
        applyFilters: "Aplicar Filtros",
        finish: "Concluir",
        next: "Próximo",
        back: "Voltar",
        processing: "Processando...",
      },
      dateTime: {
        today: "Hoje",
        clear: "Limpar",
        ok: "OK",
        invalidDate: "Formato de data inválido",
        maxDate: "Data não pode ser posterior à máxima",
        minDate: "Data não pode ser anterior à mínima"
      },
      taskReports: {
        title: "Relatórios de Tarefas",
        subtitle: "Visão geral do desempenho e estatísticas das tarefas",
        all: "Todos",
        summary: {
          total: "Total de Tarefas",
          completed: "Tarefas Concluídas",
          pending: "Tarefas Pendentes",
          overdue: "Tarefas Atrasadas",
          inProgress: "Em Andamento"
        },
        filters: {
          title: "Filtros",
          startDate: "Data Inicial",
          endDate: "Data Final",
          user: "Usuário",
          status: "Status",
          group: "Grupo",
          all: "Todos",
          clearFilters: "Limpar Filtros"
        },
        status: {
          title: "Status",
          completed: "Concluída",
          pending: "Pendente",
          overdue: "Atrasada",
          inProgress: "Em Andamento",
          assigned: "Atribuidas"
        },
        weeklyProgress: {
          title: "Progresso Semanal",
          subtitle: "Tarefas concluídas por dia",
          noData: "Nenhum dado disponível para o período selecionado"
        },
        userPerformance: {
          title: "Desempenho por Usuário",
          subtitle: "Comparativo de tarefas por usuário",
          assigned: "Atribuídas",
          completed: "Concluídas",
          overdue: "Atrasadas",
          noData: "Nenhum usuário encontrado"
        },
        statusDistribution: {
          title: "Distribuição por Status",
          subtitle: "Visão geral das tarefas por status",
          noData: "Nenhuma tarefa encontrada"
        },
        attachments: {
          title: "Anexos e Anotações",
          subtitle: "Estatísticas de anexos e anotações",
          withAttachments: "Com Anexos",
          withNotes: "Com Anotações",
          fileTypes: "Tipos de Arquivos",
          noData: "Nenhum anexo encontrado"
        },
        export: {
          title: "Exportar Relatório",
          pdf: "Exportar como PDF",
          excel: "Exportar como Excel",
          success: "Relatório exportado com sucesso",
          error: "Erro ao exportar relatório"
        },
        errors: {
          loadError: "Erro ao carregar dados",
          retryButton: "Tentar novamente",
          invalidDateRange: "Período inválido",
          generic: "Ocorreu um erro. Tente novamente mais tarde."
        },
        tooltips: {
          refresh: "Atualizar dados",
          export: "Exportar relatório",
          filter: "Aplicar filtros",
          clearFilters: "Limpar filtros"
        },
        noData: {
          title: "Sem dados para exibir",
          message: "Tente ajustar os filtros ou criar algumas tarefas"
        }
      },
      asaas: {
        title: "Integração Asaas",
        subtitle: "Configure sua integração com o Asaas para envio automático de cobranças",
        configuration: "Configuração",
        credentials: "Credenciais",
        rules: "Regras de Envio",
        preview: "Preview",
        success: {
          saveSettings: "Configurações salvas com sucesso"
        },
        stats: {
          title: "Estatísticas Asaas",
          totalCompanies: "Total de Empresas",
          pendingCompanies: "Empresas com Faturas Pendentes",
          overdueCompanies: "Empresas com Faturas Vencidas",
          lastUpdate: "Última atualização"
        },

        steps: {
          credentials: "Credenciais",
          connection: "Conexão",
          rules: "Regras",
          review: "Revisão"
        },

        stepHelper: {
          credentials: "Configure suas credenciais do Asaas",
          connection: "Selecione a conexão WhatsApp",
          rules: "Configure as regras de envio",
          review: "Revise suas configurações"
        },


        token: "Token do Asaas",
        tokenRequired: "Token é obrigatório",
        tokenHelper: "Token de acesso encontrado no painel do Asaas",
        validatingToken: "Validando token...",
        tokenConfigured: "Token configurado",


        whatsapp: "Conexão WhatsApp",
        whatsappRequired: "Conexão WhatsApp é obrigatória",
        whatsappHelper: "Selecione qual conexão será usada para envio",
        whatsappSelected: "WhatsApp selecionado",


        rule: "Regra",
        rulesCount: "Total de regras",
        addRule: "Adicionar Regra",
        editRule: "Editar Regra",
        deleteRule: "Excluir Regra",
        ruleTitle: "Regra de Envio",
        daysBeforeDue: "Dias antes do vencimento",
        days: "dias",
        message: "Mensagem",
        messageHelper: "Utilize as variáveis disponíveis para personalizar sua mensagem",
        availableVariables: "Variáveis disponíveis",
        variables: {
          name: "Nome do cliente",
          value: "Valor da cobrança",
          dueDate: "Data de vencimento",
          paymentLink: "Link de pagamento"
        },
        defaultMessage: "Olá {name}, você tem uma fatura no valor de {value} que vence em {dueDate}.",


        sendBoleto: "Enviar Boleto/PIX",
        sendBoletoHelp: "Envia QR Code do PIX e código para copiar e colar",
        qrCodeMessage: "Aqui está o QR Code para pagamento via PIX:",
        pixCodeMessage: "Código PIX para copiar e colar:",
        paymentOptions: "Opções de Pagamento",


        executionTime: "Horário de execução",
        messageInterval: "Intervalo entre mensagens",
        messageIntervalHelper: "Intervalo em minutos entre o envio de cada mensagem",
        weekdays: {
          monday: "Segunda-feira",
          tuesday: "Terça-feira",
          wednesday: "Quarta-feira",
          thursday: "Quinta-feira",
          friday: "Sexta-feira",
          saturday: "Sábado",
          sunday: "Domingo"
        },


        viewMode: "Modo de visualização",
        listView: "Lista",
        gridView: "Grid",
        previewTitle: "Preview da Mensagem",
        messagePreview: "Preview da mensagem",
        previewBoletoMessage: "O boleto/QR Code será anexado automaticamente",


        optional: "Opcional",
        save: "Salvar",
        saving: "Salvando...",
        cancel: "Cancelar",
        next: "Próximo",
        back: "Voltar",
        finish: "Concluir",
        runNow: "Executar Agora",
        processStarted: "Processamento iniciado",
        processing: "Processando...",
        readyToSave: "Configuração pronta para ser salva",
        configurationSummary: "Resumo da configuração",


        configured: "Configurado",
        notConfigured: "Não Configurado",
        savedSuccess: "Configurações salvas com sucesso",
        deleteSuccess: "Regra excluída com sucesso",
        deleteConfirm: "Tem certeza que deseja excluir esta regra?",


        errors: {
          fetchStats: "Erro ao buscar estatísticas do Asaas",
          invalidDays: "Número de dias inválido",
          messageRequired: "Mensagem é obrigatória",
          invalidToken: "Token inválido",
          errorSaving: "Erro ao salvar configurações",
          errorLoading: "Erro ao carregar configurações",
          errorConnection: "Erro ao testar conexão",
          loadSettings: "Erro ao carregar configurações",
          saveSettings: "Erro ao salvar configurações",
          runProcess: "Erro ao executar processamento",
          preview: "Erro ao carregar preview"
        },

        noRules: "Nenhuma regra configurada",


        tooltips: {
          addRule: "Adicionar nova regra de envio",
          deleteRule: "Excluir esta regra",
          editRule: "Editar esta regra",
          preview: "Ver preview da mensagem",
          sendBoleto: "Habilitar envio de boleto/PIX",
          runNow: "Executar processamento agora",
          settings: "Configurações da integração",
          showVariables: "Mostrar variáveis disponíveis"
        },
        status: {
          success: "Sucesso",
          error: "Erro",
          warning: "Atenção",
          info: "Informação"
        },
        cancel: "Cancelar",
        save: "Salvar",
        saving: "Salvando...",
        delete: "Excluir",
        edit: "Editar",
        add: "Adicionar",
        settings: {
          success: "Configurações salvas com sucesso",
          error: "Erro ao salvar configurações",
          save: "Salvar Configurações"
        },
      },
      whatsappTemplates: {
        title: "Templates do WhatsApp",
        fetchError: "Erro ao buscar templates",
        deleteSuccess: "Template excluído com sucesso",
        deleteError: "Erro ao excluir template",
        createSuccess: "Template criado com sucesso",
        updateSuccess: "Template atualizado com sucesso",
        submitError: "Erro ao salvar template",
        deleteTitle: "Excluir Template",
        deleteMessage: "Tem certeza que deseja excluir este template?",
        table: {
          name: "Nome",
          status: "Status",
          language: "Idioma",
          category: "Categoria",
          actions: "Ações"
        },
        buttons: {
          add: "Novo Template",
          edit: "Editar",
          delete: "Excluir",
          view: "Visualizar",
          cancel: "Cancelar"
        },
        modal: {
          addTitle: "Novo Template",
          editTitle: "Editar Template",
          viewTitle: "Visualizar Template"
        },
        form: {
          name: "Nome do Template",
          language: "Idioma",
          category: "Categoria",
          header: "Cabeçalho",
          body: "Corpo da Mensagem",
          bodyHelp: "Use {{1}}, {{2}}, etc para variáveis dinâmicas",
          footer: "Rodapé",
          buttons: "Botões",
          addButton: "Adicionar Botão",
          buttonType: "Tipo do Botão",
          buttonText: "Texto do Botão"
        },
        preview: {
          title: "Prévia do Template"
        }
      },
      campaigns: {
        title: "Campanhas",
        searchPlaceholder: "Busque por campanhas...",
        empty: {
          title: "Nenhuma campanha encontrada",
          message: "Você ainda não possui campanhas cadastradas. Crie uma nova campanha para iniciar seus envios em massa.",
          button: "Criar Campanha"
        },
        buttons: {
          add: "Nova Campanha",
          edit: "Editar",
          delete: "Excluir",
          report: "Relatório",
          duplicate: "Duplicar",
          stop: "Parar",
          restart: "Reiniciar",
          upload: "Fazer Upload"
        },
        tabs: {
          campaigns: "Campanhas",
          contactLists: "Listas de Contatos",
          reports: "Relatórios",
          settings: "Configurações",
          files: "Arquivos"
        },
        table: {
          name: "Nome",
          status: "Status",
          contactList: "Lista de Contatos",
          whatsapp: "WhatsApp",
          scheduledAt: "Agendamento",
          confirmation: "Confirmação",
          actions: "Ações",
          enabled: "Ativado",
          disabled: "Desativado",
          noList: "Sem lista",
          noWhatsapp: "Não definido",
          noSchedule: "Não agendado",
          rowsPerPage: "Itens por página",
          of: "de",
          openTicket: "Abrir Ticket",
        },
        status: {
          inactive: "Inativa",
          scheduled: "Agendada",
          inProgress: "Em Andamento",
          cancelled: "Cancelada",
          finished: "Finalizada",
          unknown: "Desconhecido"
        },
        dialog: {
          new: "Nova Campanha",
          update: "Editar Campanha",
          readonly: "Visualizar Campanha",
          form: {
            name: "Nome da Campanha",
            confirmation: "Confirmação de Leitura",
            contactList: "Lista de Contatos",
            identifier: "Identificador",
            identifierHelper: "Identificador único para a campanha",
            tagList: "Tag",
            whatsapp: "Conexão WhatsApp",
            scheduledAt: "Agendamento",
            fileList: "Lista de Arquivos",
            none: "Nenhum",
            disabled: "Desativado",
            enabled: "Ativado",
            message1: "Mensagem 1",
            message2: "Mensagem 2",
            message3: "Mensagem 3",
            message4: "Mensagem 4",
            message5: "Mensagem 5",
            confirmationMessage1: "Mensagem de confirmação 1",
            confirmationMessage2: "Mensagem de confirmação 2",
            confirmationMessage3: "Mensagem de confirmação 3",
            confirmationMessage4: "Mensagem de confirmação 4",
            confirmationMessage5: "Mensagem de confirmação 5",
            messagePlaceholder: "Digite sua mensagem...",
            confirmationPlaceholder: "Digite a mensagem de confirmação...",
            messageHelp: "Use {nome} para inserir o nome do contato, {numero} para o número",
            confirmationHelp: "Mensagem enviada quando o contato confirmar o recebimento",
            openTicket: "Abrir Ticket",
            user: "Atendente",
            queue: "Fila",
            statusTicket: "Status do Ticket",
            pending: "Pendente",
            open: "Aberto",
            closed: "Fechado",
          },
          tabs: {
            message1: "Mensagem 1",
            message2: "Mensagem 2",
            message3: "Mensagem 3",
            message4: "Mensagem 4",
            message5: "Mensagem 5"
          },
          buttons: {
            add: "Adicionar",
            edit: "Salvar Alterações",
            cancel: "Cancelar",
            close: "Fechar",
            restart: "Reiniciar",
            attach: "Anexar Arquivo"
          }
        },
        confirmationModal: {
          deleteTitle: "Excluir campanha",
          deleteMessage: "Esta ação não pode ser desfeita e todos os dados relacionados a esta campanha serão perdidos.",
          deleteMediaTitle: "Remover anexo",
          cancelConfirmTitle: "Cancelar campanha",
          cancelConfirmMessage: "Tem certeza que deseja cancelar esta campanha? Esta ação não pode ser desfeita.",
          restartConfirmTitle: "Reiniciar campanha",
          restartConfirmMessage: "Tem certeza que deseja reiniciar esta campanha? Isso enviará mensagens novamente para todos os contatos."
        },
        toasts: {
          success: "Campanha salva com sucesso!",
          deleted: "Campanha excluída com sucesso!",
          cancel: "Campanha cancelada com sucesso!",
          restart: "Campanha reiniciada com sucesso!",
          fetchError: "Erro ao buscar campanhas.",
          saveError: "Erro ao salvar campanha.",
          deleteError: "Erro ao excluir campanha.",
          cancelError: "Erro ao cancelar campanha.",
          restartError: "Erro ao reiniciar campanha.",
          campaignFetchError: "Erro ao carregar dados da campanha.",
          contactListsFetchError: "Erro ao carregar listas de contatos.",
          whatsappsFetchError: "Erro ao carregar conexões do WhatsApp.",
          filesFetchError: "Erro ao carregar listas de arquivos.",
          mediaDeleted: "Anexo removido com sucesso!",
          mediaDeleteError: "Erro ao remover anexo.",
          mediaError: "Erro ao fazer upload do anexo, mas a campanha foi salva."
        },
        validation: {
          nameRequired: "O nome é obrigatório",
          nameMin: "O nome deve ter pelo menos 2 caracteres",
          nameMax: "O nome deve ter no máximo 50 caracteres",
          whatsappRequired: "A conexão WhatsApp é obrigatória",
          contactsRequired: "Selecione uma lista de contatos ou uma tag",
          messageRequired: "Preencha pelo menos uma mensagem"
        },
        warning: {
          title: "Atenção!",
          contactLimit: {
            title: "Limite de Contatos:",
            description: "Recomendamos não exceder 200 contatos por campanha para evitar bloqueios no WhatsApp."
          },
          interval: {
            title: "Intervalo Entre Mensagens:",
            description: "Configure intervalos adequados entre as mensagens para evitar bloqueios no WhatsApp."
          },
          observation: {
            title: "Observação:",
            description: "Use as campanhas com responsabilidade. Envios abusivos podem resultar no bloqueio da sua conta WhatsApp."
          }
        },
        reports: {
          title: "Relatórios de Campanhas",
          selectCampaign: "Selecione uma campanha",
          selectToView: "Selecione uma campanha para visualizar o relatório",
          stats: {
            total: "Total de Mensagens",
            delivered: "Entregues",
            read: "Lidas",
            replied: "Respondidas"
          },
          filters: {
            today: "Hoje",
            week: "Última semana",
            month: "Último mês",
            quarter: "Últimos 3 meses"
          },
          errors: {
            title: "Erro ao Carregar Dados",
            fetchCampaigns: "Erro ao buscar campanhas!",
            fetchReportData: "Erro ao gerar relatório!",
            invalidResponse: "Resposta inválida da API"
          },
          stats: {
            total: "Total de Mensagens",
            delivered: "Entregues",
            read: "Lidas",
            replied: "Respondidas"
          },
          charts: {
            title: "Análise de Desempenho",
            statusDistribution: "Distribuição por Status",
            dailyProgress: "Progresso Diário",
            messages: "Mensagens",
            delivered: "Entregues",
            read: "Lidas",
            replied: "Respondidas"
          },
          details: {
            title: "Detalhes da Campanha",
            startedAt: "Iniciada em",
            completedAt: "Concluída em",
            status: "Status",
            confirmation: "Confirmação",
            notStarted: "Não iniciada",
            notCompleted: "Não concluída"
          },
          noData: "Sem dados para exibir",
          noChartData: "Sem dados disponíveis para este gráfico",
          empty: {
            title: "Nenhum relatório disponível",
            message: "Você precisa ter campanhas cadastradas para visualizar relatórios.",
            button: "Criar Campanha"
          },
          noData: {
            title: "Sem dados para exibir",
            message: "Não há informações disponíveis para esta campanha ainda."
          },
          chartType: "Tipo de Gráfico",
          chartTypes: {
            line: "Linha",
            bar: "Barra",
            pie: "Pizza"
          },

          status: {
            pending: "Pendente",
            pendente: "Pendente",
            enviado: "Enviada",
            confirmado: "Confirmada",
            solicitado: "Solicitada",
            entregue: "Entregue",
            delivered: "Entregue",
            read: "Lida",
            replied: "Respondida",
            error: "Erro",
            rejected: "Rejeitada",
            canceled: "Cancelada",
            finalizada: "Finalizada",
            unknown: "Desconhecido"
          }
        }
      },
      contactLists: {
        dialog: {
          add: "Nova Lista de Contatos",
          edit: "Editar Lista de Contatos",
          name: "Nome da Lista",
          cancel: "Cancelar",
          okAdd: "Adicionar",
          okEdit: "Salvar"
        },
        confirmationModal: {
          deleteTitle: "Excluir lista de contatos",
          deleteMessage: "Esta ação não pode ser desfeita. Todos os contatos desta lista serão excluídos."
        },
        empty: {
          title: "Nenhuma lista de contatos encontrada",
          message: "Crie sua primeira lista de contatos para iniciar campanhas.",
          button: "Criar Lista"
        },
        searchPlaceholder: "Buscar listas de contatos...",
        toasts: {
          fetchError: "Erro ao buscar listas de contatos.",
          deleted: "Lista de contatos excluída com sucesso!",
          added: "Lista de contatos criada com sucesso!",
          edited: "Lista de contatos atualizada com sucesso!",
          saveError: "Erro ao salvar lista de contatos."
        },
        buttons: {
          add: "Nova Lista",
          edit: "Editar",
          delete: "Excluir"
        },
        table: {
          name: "Nome",
          contacts: "Contatos",
          actions: "Ações"
        }
      },
      contactListsValidation: {
        nameRequired: "O nome é obrigatório",
        nameMin: "O nome deve ter pelo menos 2 caracteres",
        nameMax: "O nome deve ter no máximo 50 caracteres"
      },
      contactListItems: {
        validation: {
          nameRequired: "O nome é obrigatório",
          nameMin: "O nome deve ter pelo menos 2 caracteres",
          nameMax: "O nome deve ter no máximo 50 caracteres",
          numberRequired: "O número é obrigatório",
          numberMin: "O número deve ter pelo menos 8 caracteres",
          numberMax: "O número deve ter no máximo 50 caracteres",
          emailInvalid: "E-mail inválido"
        },
        modal: {
          addTitle: "Adicionar Contato",
          editTitle: "Editar Contato",
          mainInfo: "Informações Principais",
          name: "Nome",
          number: "Número",
          email: "E-mail",
          customMessage: "Mensagem Personalizada",
          numberHelp: "Formato: DDI + DDD + Número (Ex: 5513912344321)",
          cancel: "Cancelar",
          add: "Adicionar",
          saveChanges: "Salvar Alterações"
        },
        confirmationModal: {
          deleteTitle: "Excluir contato",
          deleteMessage: "Esta ação não pode ser desfeita. O contato será removido permanentemente da lista."
        },
        importDialog: {
          title: "Importar Contatos",
          message: "Deseja importar contatos de outras listas para esta lista?",
          confirm: "Importar",
          cancel: "Cancelar"
        },
        table: {
          name: "Nome",
          number: "Número",
          email: "E-mail",
          customMessage: "Mensagem Personalizada",
          status: "Status",
          actions: "Ações",
          rowsPerPage: "Itens por página",
          of: "de"
        },
        buttons: {
          add: "Adicionar Contato",
          import: "Importar / Exportar",
          importFile: "Importar Arquivo",
          importContacts: "Importar Contatos",
          export: "Exportar Contatos",
          downloadTemplate: "Baixar Modelo",
          edit: "Editar",
          delete: "Excluir",
          deleteSelected: "Excluir Selecionados"
        },
        searchPlaceholder: "Buscar por nome, número ou e-mail...",
        selected: "contatos selecionados",
        valid: "Válido",
        invalid: "Inválido",
        empty: {
          noContacts: "Nenhum contato encontrado"
        },
        toasts: {
          added: "Contato adicionado com sucesso!",
          updated: "Contato atualizado com sucesso!",
          deleted: "Contato excluído com sucesso!",
          deletedAll: "Contatos excluídos com sucesso!",
          partialDeleteSuccess: "{success} contatos excluídos com sucesso. {failed} não puderam ser excluídos.",
          fetchError: "Erro ao buscar contatos.",
          saveError: "Erro ao salvar contato.",
          deleteError: "Erro ao excluir contato.",
          importing: "Importando contatos. Isto pode levar alguns minutos."
        }
      },
      contactListManager: {
        errors: {
          noListSelected: "Nenhuma lista de contatos selecionada.",
          importError: "Erro ao importar contatos.",
          fileUploadError: "Erro ao fazer upload do arquivo.",
          invalidFileType: "Tipo de arquivo inválido. Apenas arquivos Excel ou CSV são permitidos.",
          fileTooLarge: "Arquivo muito grande. Tamanho máximo: 10MB."
        },
        toasts: {
          exportSuccess: "Contatos exportados com sucesso!",
          exportError: "Erro ao exportar contatos.",
          fileUploadSuccess: "Arquivo enviado com sucesso!",
          processingInBackground: "Os contatos estão sendo processados em segundo plano."
        }
      },
      campaignsConfig: {
        title: "Configurações de Campanhas",
        intervalSettings: {
          title: "Configurações de Intervalo",
          messageInterval: "Intervalo entre mensagens",
          longerIntervalAfter: "Intervalo maior após",
          greaterInterval: "Intervalo maior",
          noInterval: "Sem intervalo",
          notDefined: "Não definido",
          second: "segundo",
          seconds: "segundos",
          sends: "envios"
        },
        variables: {
          title: "Variáveis Personalizadas",
          add: "Adicionar Variável",
          shortcut: "Atalho",
          content: "Conteúdo",
          shortcutPlaceholder: "Ex: saudacao",
          contentPlaceholder: "Ex: Olá, como vai?",
          addButton: "Adicionar",
          cancel: "Cancelar",
          empty: "Nenhuma variável personalizada cadastrada"
        },
        confirmationModal: {
          deleteTitle: "Excluir variável",
          deleteMessage: "Tem certeza que deseja excluir esta variável personalizada?"
        },
        saveButton: "Salvar Configurações",
        warning: {
          title: "Aviso Importante",
          content1: "As configurações de intervalos afetam o comportamento do envio de mensagens em campanhas.",
          content2: "Um intervalo muito curto entre mensagens pode aumentar o risco de bloqueio da sua conta WhatsApp.",
          content3: "Recomendamos manter intervalos maiores que 5 segundos entre mensagens e configurar um intervalo maior a cada 30-40 envios.",
          regards: "Atenciosamente,",
          team: "Equipe"
        },
        toasts: {
          success: "Configurações salvas com sucesso!",
          fetchError: "Erro ao carregar configurações.",
          saveError: "Erro ao salvar configurações.",
          emptyVariable: "Preencha o atalho e o conteúdo da variável.",
          duplicatedVariable: "Este atalho já está em uso."
        }
      },
      files: {
        modal: {
          addTitle: "Nova Lista de Arquivos",
          editTitle: "Editar Lista de Arquivos",
          name: "Nome da Lista",
          description: "Descrição",
          add: "Adicionar",
          saveChanges: "Salvar Alterações",
          cancel: "Cancelar",
          noPreview: "Nenhuma prévia disponível"
        },
        buttons: {
          add: "Adicionar",
          edit: "Editar",
          delete: "Excluir",
          upload: "Escolher Arquivo",
          uploadFile: "Enviar Arquivo",
          download: "Download",
          close: "Fechar",
          openPdf: "Abrir PDF",
          selectFile: "Selecionar Arquivo",
          addList: "Nova Lista"
        },
        deleteDialog: {
          title: "Excluir Lista de Arquivos",
          message: "Esta ação excluirá todos os arquivos associados a esta lista. Esta ação não pode ser desfeita."
        },
        deleteFileDialog: {
          title: "Excluir Arquivo",
          message: "Tem certeza que deseja excluir este arquivo? Esta ação não pode ser desfeita."
        },
        empty: {
          title: "Nenhuma lista de arquivos encontrada",
          message: "Crie sua primeira lista de arquivos para compartilhar em suas campanhas."
        },
        tooltips: {
          edit: "Editar lista",
          delete: "Excluir lista",
          view: "Visualizar arquivo",
          download: "Baixar arquivo"
        },
        searchPlaceholder: "Buscar listas de arquivos...",
        filesList: "Arquivos na Lista",
        emptyFileList: "Nenhum arquivo nesta lista. Faça upload do seu primeiro arquivo.",
        preview: {
          title: "Visualização do Arquivo",
          description: "Descrição",
          details: "Detalhes do arquivo",
          noPreview: "Visualização não disponível para este arquivo",
          pdfMessage: "Clique no botão abaixo para abrir o PDF",
          notSupported: "Visualização não disponível para este tipo de arquivo"
        },
        table: {
          name: "Nome",
          type: "Tipo",
          size: "Tamanho",
          actions: "Ações",
          unknownType: "Tipo desconhecido"
        },
        validation: {
          nameRequired: "O nome é obrigatório",
          nameMin: "O nome deve ter pelo menos 2 caracteres",
          nameMax: "O nome deve ter no máximo 100 caracteres",
          descriptionMax: "A descrição deve ter no máximo 500 caracteres"
        },
        toasts: {
          added: "Lista de arquivos criada com sucesso!",
          updated: "Lista de arquivos atualizada com sucesso!",
          deleted: "Lista de arquivos excluída com sucesso!",
          fileDeleted: "Arquivo excluído com sucesso!",
          fileAddedToList: "Arquivo adicionado com sucesso!",
          filesAddedToList: "{count} arquivos adicionados com sucesso!",
          fetchError: "Erro ao buscar listas de arquivos.",
          error: "Ocorreu um erro. Tente novamente.",
          deleteError: "Erro ao excluir lista de arquivos.",
          deleteFileError: "Erro ao excluir arquivo.",
          uploadError: "Erro ao fazer upload do arquivo.",
          uploadMultipleError: "Erro ao fazer upload dos arquivos."
        },
        noResults: "Nenhum resultado encontrado para a pesquisa."
      },
      delete: {
        campaign: {
          title: "Excluir Campanha",
          message: "Tem certeza que deseja excluir a campanha"
        },
        contactList: {
          title: "Excluir Lista de Contatos",
          message: "Tem certeza que deseja excluir a lista de contatos"
        },
        fileList: {
          title: "Excluir Lista de Arquivos",
          message: "Tem certeza que deseja excluir a lista de arquivos"
        },
        file: {
          title: "Excluir Arquivo",
          message: "Tem certeza que deseja excluir o arquivo"
        },
        warning: "Esta ação não pode ser desfeita.",
        cancel: "Cancelar",
        confirm: "Excluir"
      },
      empty: {
        title: "Nenhum item encontrado",
        message: "Não há itens para exibir nesta seção",
        button: "Adicionar"
      },

      optionsPage: {
        // Seções
        general: "Geral",
        integrations: "Integrações",
        advanced: "Avançado",
        ai: "Inteligência Artificial",
        general_params: "Configurações Gerais",
        downloadSettings: "Tamanho maxímo de arquivos (enviados e recebidos)",
        // Botões e ações
        saveAll: "Salvar Tudo",
        successMessage: "Operação atualizada com sucesso.",
        allSettingsSaved: "Todas as configurações foram salvas com sucesso.",
        onlyOneCloseOptionActive: "Apenas uma opção de encerramento pode estar ativa por vez",
        // Configurações de IA
        openaiModel: "Modelo OpenAI",
        openaiModelHelp: "Escolha o modelo de inteligência artificial OpenAI para utilizar nas respostas automáticas. Fundamental para garantir a qualidade e precisão das respostas automáticas, melhorando a eficiência do atendimento.",
        enableAudioTranscriptions: "Ativar transcrição de áudio",
        enableAudioTranscriptionsHelp: "Ativa a transcrição de áudio utilizando o serviço da OpenAI",
        audioTranscriptionsEnabled: "Transcrição de áudio ativada com sucesso",
        audioTranscriptionsDisabled: "Transcrição de áudio desativada com sucesso",
        openAiKey: "Chave da API OpenAI",
        openAiKeyHelp: "Informe a chave da API OpenAI para realizar a transcrição de áudio",
        saveOpenAiKey: "Salvar chave da API",
        openAiKeySuccess: "Chave da API OpenAI salva com sucesso",
        copyApiKey: "Copiar chave da API",
        apiKeyCopied: "Chave da API copiada com sucesso!",
        satisfactionSurveyTitle: "Pesquisa de Satisfação",
        enableSatisfactionSurvey: "Ativar pesquisa e relatório de satisfação",
        enableSatisfactionSurveyHelp: "Ativa ou desativa os recursos de pesquisa de satisfação e relatórios no menu superior",
        satisfactionSurveyEnabled: "Pesquisa de satisfação ativada com sucesso",
        satisfactionSurveyDisabled: "Pesquisa de satisfação desativada com sucesso",

        // Configurações gerais
        enableOneTicketPerConnection: "Ativar uso de um ticket por conexão",
        enableOneTicketPerConnectionHelp: "Ao ativar a funcionalidade de um ticket por conexão, caso um cliente entre em contato com a equipe através de diferentes conexões, será gerado um ticket distinto para cada uma delas. O operador, por padrão, responderá pela conexão em que recebeu a mensagem.",
        enableOfficialWhatsapp: "Ativar API Oficial do WhatsApp",
        enableOfficialWhatsappHelp: "Ativa ou desativa o uso da API oficial do WhatsApp Business para comunicação. Importante para empresas que necessitam de uma conexão oficial e verificada com o WhatsApp.",
        initialPage: "Página Inicial",
        initialPageHelp: "Define qual será a página inicial do sistema quando acessado. Escolha entre a página de apresentação (home) ou a página de login direta.",
        homePage: "Página de Apresentação (Home)",
        loginPage: "Página de Login",
        enableQueueWhenCloseTicket: "Definir setor ao encerrar atendimento",
        enableQueueWhenCloseTicketHelp: "Solicita a seleção de um setor (Setor) ao encerrar um atendimento",
        enableTagsWhenCloseTicket: "Definir tag(s) ao encerrar atendimento",
        enableTagsWhenCloseTicketHelp: "Solicita a seleção de tags ao encerrar um atendimento",
        enableRegisterInSignup: "Habilitar registro na tela inicial",
        enableRegisterInSignupHelp: "Habilita ou desabilita a opção de signup na tela inicial, permitindo que novos usuários se cadastrem na plataforma quando não possuem cadastro. Controla a visibilidade da opção de cadastro, sendo crucial para gerenciar o acesso de novos usuários à plataforma, mantendo o controle sobre quem pode se registrar.",
        sendEmailInRegister: "Enviar e-mail ao registrar",
        sendEmailInRegisterHelp: "Enviar e-mail usando a empresa 1",
        downloadLimit: "Limite de Download",
        downloadLimitHelp: "Define o limite máximo para o download de arquivos em megabytes. Crucial para evitar sobrecarga no sistema ou mau uso da infraestrutura ao limitar o tamanho dos arquivos transferidos.",
        sendMessageWhenRegiter: "Enviar mensagem ao registrar",
        sendMessageWhenRegiterHelp: "Ao cadastrar-se, o sistema irá enviar uma mensagem de boas vindas. Essa configuração garante que, ao se registrar, uma mensagem de boas vindas será enviada, proporcionando uma comunicação clara e eficiente.",
        enableSaveCommonContacts: "Ativar salvar contatos comuns",
        enableSaveCommonContactsHelp: "Permite salvar contatos que não estão cadastrados no WhatsApp. Ideal para manter um registro completo de todos os contatos, independentemente de possuírem uma conta no WhatsApp.",
        saveContactsEnabled: "Salvar contatos comuns ativado.",
        saveContactsDisabled: "Salvar contatos comuns desativado.",
        enableReasonWhenCloseTicket: "Exibir modal de motivo ao resolver ticket",
        enableReasonWhenCloseTicketHelp: "Ao finalizar o atendimento, o sistema exibirá um modal para o atendente informar o motivo do encerramento. Essa configuração garante o registro de motivos para o encerramento de atendimentos, proporcionando maior controle e análise sobre os motivos de finalização, o que pode ajudar na melhoria contínua do atendimento ao cliente.",
        showSKU: "Exibir valor do ticket e SKU",
        showSKUHelp: "Configura se o valor do ticket e SKU será exibido no atendimento. Importante para fornecer informações financeiras detalhadas, otimizando a tomada de decisão durante o atendimento.",
        speedMessage: "Mensagens Rápidas",
        speedMessageHelp: "Define a utilização de mensagens rápidas para facilitar o atendimento. Aumenta a produtividade dos atendentes, permitindo respostas rápidas e padronizadas, economizando tempo em atendimentos repetitivos.",
        byCompany: "Por Empresa",
        byUser: "Por Usuário",
        sendanun: "Enviar saudação ao aceitar ticket",
        sendanunHelp: "Define se uma mensagem de saudação será enviada automaticamente ao aceitar um novo ticket. Melhora a experiência do cliente ao receber uma saudação instantânea, garantindo uma interação mais acolhedora e profissional.",
        sendQueuePosition: "Enviar mensagem com posição na fila",
        sendQueuePositionHelp: "Define se o sistema enviará mensagens informando a posição do cliente na fila de atendimento. Importante para manter o cliente informado sobre seu tempo de espera estimado.",
        settingsUserRandom: "Escolher atendente aleatório",
        settingsUserRandomHelp: "Ativa ou desativa a seleção aleatória de atendentes para novos tickets. Útil para distribuir a carga de trabalho de forma mais equilibrada entre a equipe.",
        calif: "Ativar avaliação automática",
        califHelp: "Configura a ativação ou desativação de avaliações automáticas do atendimento. Crucial para obter feedback contínuo dos clientes, permitindo a melhoria constante da qualidade do serviço.",
        expedient: "Gerenciamento de Expediente",
        expedientHelp: "Ativa ou desativa o gerenciamento de expediente para controle de horários. Importante para otimizar a organização e garantir que os atendimentos sejam realizados dentro dos horários estabelecidos.",
        buttons: {
          off: "Desativado",
          partner: "Por Empresa",
          quee: "Por Setor"
        },
        ignore: "Ignorar grupos de WhatsApp",
        ignoreHelp: "Define se grupos de WhatsApp serão ignorados no atendimento. Essencial para focar o atendimento em interações individuais, evitando distrações e sobrecarga com grupos de conversa.",
        typechatbot: "Tipo de Chatbot",
        typechatbotHelp: "Define o tipo de chatbot que será utilizado, como texto ou outro formato. Essencial para personalizar a interação automática com os clientes, oferecendo uma experiência mais adaptada às necessidades do negócio.",
        text: "Texto",
        list: "Lista",
        button: "Botões",
        ticketSettings: "Opções de Atendimentos",
        contactSettings: "Opções de Contatos",
        displayContactInfoDisabled: "Essa recurso só pode ser ativado se Exibir dados comerciais do contato estiver desativada",
        displayProfileImages: "Exibir a foto de perfil do contato e do usuário na tela de atendimento",
        displayProfileImagesHelp: "Permite exibir ou ocultar a foto de perfil do contato e também do usuário nas mensagens.",
        sendagent: "Enviar mensagem na transferência",
        donwloadSettings: "Configurações de Arquivos Enviados/Recebidos",
        developmentPanels: "Paineis do Desenvolvedor",
        sendagentHelp: "Ativa ou desativa o envio de mensagens automáticas ao transferir um atendimento entre filas ou agentes. Importante para manter o cliente informado sobre a troca de atendentes, melhorando a transparência e a experiência do usuário.",
        greeatingOneQueue: "Enviar mensagem de saudação para setor único",
        greeatingOneQueueHelp: "Define se uma mensagem de saudação será enviada automaticamente quando o atendimento for transferido para um setor único. Garante que o contato receba uma saudação automática ao ser transferido para um setor, mantendo o atendimento mais pessoal e organizado, mesmo em filas com apenas um atendente.",
        callSuport: "Ativar botão de suporte",
        callSuportHelp: "Ativa ou desativa a função de chamar suporte técnico direto pelo sistema. Essencial para resolver problemas rapidamente, oferecendo uma solução imediata para questões técnicas dos usuários.",
        displayContactInfo: "Exibir número do telefone",
        displayContactInfoHelp: "Define se o número de telefone será exibido no lugar do nome do contato. Útil em situações onde o nome do cliente pode não ser conhecido, permitindo uma organização eficiente baseada no número de telefone.",
        displayBusinessInfo: "Exibir dados comerciais do contato",
        displayBusinessInfoHelp: "Define se os dados comerciais (empresa e cargo) serão exibidos na tela de atendimento. Útil para personalizar o atendimento com base no perfil profissional do contato.",
        trialExpiration: "Dias para teste gratuito",
        trialExpirationHelp: "Define o número de dias disponíveis para teste gratuito do sistema. Crucial para atrair novos clientes, proporcionando uma experiência completa do sistema antes da contratação.",

        // Integrações
        enableMetaPixel: "Ativar Pixel da Meta",
        enableMetaPixelHelp: "Ativa o uso do Pixel da Meta para todas as empresas",
        metaPixelEnabled: "Pixel da Meta ativado com sucesso",
        metaPixelDisabled: "Pixel da Meta desativado com sucesso",
        metaPixelSettings: "Configurações do Pixel da Meta",
        metaPixelId: "ID do Pixel da Meta",
        metaPixelIdHelp: "Insira o ID do Pixel da Meta para rastreamento de conversões",
        saveMetaPixelSettings: "Salvar Configurações do Pixel",
        enableGroupTool: "Habilitar Gerenciador de Grupos",
        enableGroupToolHelp: "Permite o uso de ferramentas avançadas para gerenciamento de grupos",
        groupToolEnabled: "Gerenciador de Grupos habilitado com sucesso",
        groupToolDisabled: "Gerenciador de Grupos desabilitado com sucesso",

        enableMessageRules: "Habilitar Regras de Mensagens",
        enableMessageRulesHelp: "Permite a criação e gerenciamento de regras para mensagens",
        messageRulesEnabled: "Regras de Mensagens habilitadas com sucesso",
        messageRulesDisabled: "Regras de Mensagens desabilitadas com sucesso",

        enableUPSix: "Ativar integração com UPSix",
        enableUPSixHelp: "Ativa ou desativa a integração com a UPSix no sistema.",
        upsixEnabled: "Integração com UPSix ativada.",
        upsixDisabled: "Integração com UPSix desativada.",
        enableUPSixWebphone: "Ativar webphone UPSix",
        enableUPSixWebphoneHelp: "Ativa ou desativa o uso do webphone integrado da UPSix.",
        enableUPSixNotifications: "Ativar notificações UPSix",
        enableUPSixNotificationsHelp: "Ativa ou desativa as notificações via UPSix.",

        whatsappApiEnabled: "API Oficial do WhatsApp ativada.",
        whatsappApiDisabled: "API Oficial do WhatsApp desativada.",

        // Configurações avançadas
        support: "Suporte",
        wasuport: "WhatsApp do Suporte",
        msgsuport: "Mensagem pré-definida",

        apiToken: "Token de API",
        apiTokenHelp: "Token de acesso para integração com API externa.",
        generateToken: "Gerar novo token",
        copyToken: "Copiar token",
        deleteToken: "Excluir token",
        tokenCopied: "Token copiado para a área de transferência",

        smtpServer: "Servidor SMTP",
        smtpUser: "Usuário SMTP",
        smtpPassword: "Senha SMTP",
        smtpPort: "Porta SMTP",
        smtpHelp: "Configurações do servidor SMTP para envio de e-mails pelo sistema.",
        days: "dias"
      },
      campaignsConfig: {
        title: "Configurações de Campanhas",

        intervalSettings: {
          title: "Configurações de Intervalo",
          messageInterval: "Intervalo entre Mensagens",
          longerIntervalAfter: "Intervalo Maior Após",
          greaterInterval: "Intervalo Maior",
          noInterval: "Sem Intervalo",
          second: "segundo",
          seconds: "segundos",
          notDefined: "Não definido",
          sends: "envios"
        },

        variables: {
          title: "Variáveis Personalizadas",
          add: "Adicionar Variável",
          shortcut: "Atalho",
          content: "Conteúdo",
          shortcutPlaceholder: "Ex: saudacao",
          contentPlaceholder: "Ex: Olá, tudo bem?",
          addButton: "Adicionar",
          cancel: "Cancelar",
          empty: "Nenhuma variável personalizada definida."
        },

        saveButton: "Salvar Configurações",

        warning: {
          title: "Atenção ao Uso de Campanhas",
          content1: "O envio em massa de mensagens é uma funcionalidade poderosa, porém sensível.",
          content2: "O WhatsApp pode aplicar restrições ou bloqueios ao seu número, dependendo da configuração de tempo e do volume de mensagens.",
          content3: "Para evitar bloqueios, recomendamos configurar períodos de envio mais espaçados e moderados.",
          regards: "Atenciosamente,",
          team: "Equipe"
        },

        confirmationModal: {
          deleteTitle: "Remover Variável",
          deleteMessage: "Tem certeza que deseja remover esta variável?"
        },

        toasts: {
          success: "Configurações salvas com sucesso!",
          emptyVariable: "Preencha todos os campos da variável.",
          duplicatedVariable: "Já existe uma variável com este atalho.",
          fetchError: "Erro ao carregar configurações.",
          saveError: "Erro ao salvar configurações."
        }
      },

      contactListManager: {
        tooltips: {
          contacts: "Ver Contatos",
          import: "Importar",
          downloadTemplate: "Baixar Modelo"
        },

        buttons: {
          contacts: "Contatos",
          import: "Importar",
          downloadTemplate: "Baixar Modelo"
        },

        menu: {
          uploadFile: "Enviar Arquivo",
          importContacts: "Importar dos Contatos",
          exportContacts: "Exportar Contatos"
        },

        importDialog: {
          title: "Importar Contatos",
          message: "Deseja importar contatos do seu WhatsApp para esta lista?",
          cancel: "Cancelar",
          confirm: "Importar"
        },

        errors: {
          noListSelected: "Nenhuma lista de contatos selecionada.",
          importError: "Erro ao importar contatos.",
          fileUploadError: "Erro ao enviar arquivo."
        },

        toasts: {
          importing: "Importando contatos do WhatsApp...",
          exportSuccess: "Contatos exportados com sucesso!",
          exportError: "Erro ao exportar contatos.",
          fileUploadSuccess: "Arquivo importado com sucesso!"
        }
      },
      delete: {
        warning: "Esta ação não pode ser desfeita!",
        cancel: "Cancelar",
        confirm: "Excluir",
        campaign: {
          title: "Excluir Campanha",
          message: "Tem certeza que deseja excluir esta campanha?"
        },
        contactList: {
          title: "Excluir Lista de Contatos",
          message: "Tem certeza que deseja excluir esta lista de contatos?"
        },
        item: {
          title: "Excluir Item",
          message: "Tem certeza que deseja excluir este item?"
        }
      },

      contactListsValidation: {
        nameRequired: "Nome é obrigatório",
        nameMin: "Nome deve ter pelo menos 2 caracteres",
        nameMax: "Nome deve ter no máximo 50 caracteres"
      },

      empty: {
        title: "Nenhum dado encontrado",
        message: "Não há dados para exibir.",
        button: "Adicionar"
      },
      backendErrors: {
        ERR_NO_OTHER_WHATSAPP: "Deve haver pelo menos um WhatsApp padrão.",
        ERR_CONNECTION_NOT_CONNECTED:
          "A conexão vinculada ao ticket não está conectada na plataforma, verifique a página de conexões.",
        ERR_NO_DEF_WAPP_FOUND:
          "Nenhum WhatsApp padrão encontrado. Verifique a página de conexões.",
        ERR_WAPP_NOT_INITIALIZED:
          "Esta sessão do WhatsApp não foi inicializada. Verifique a página de conexões.",
        ERR_WAPP_CHECK_CONTACT:
          "Não foi possível verificar o contato do WhatsApp. Verifique a página de conexões",
        ERR_WAPP_INVALID_CONTACT: "Este não é um número de Whatsapp válido.",
        ERR_WAPP_DOWNLOAD_MEDIA:
          "Não foi possível baixar mídia do WhatsApp. Verifique a página de conexões.",
        ERR_INVALID_CREDENTIALS:
          "Erro de autenticação. Por favor, tente novamente.",
        ERR_SENDING_WAPP_MSG:
          "Erro ao enviar mensagem do WhatsApp. Verifique a página de conexões.",
        ERR_DELETE_WAPP_MSG: "Não foi possível excluir a mensagem do WhatsApp.",
        ERR_OTHER_OPEN_TICKET: "Já existe um tíquete aberto para este contato.",
        ERR_SESSION_EXPIRED: "Sessão expirada. Por favor entre.",
        ERR_USER_CREATION_DISABLED:
          "A criação do usuário foi desabilitada pelo administrador.",
        ERR_NO_PERMISSION: "Você não tem permissão para acessar este recurso.",
        ERR_DUPLICATED_CONTACT: "Já existe um contato com este número.",
        ERR_NO_SETTING_FOUND: "Nenhuma configuração encontrada com este ID.",
        ERR_NO_CONTACT_FOUND: "Nenhum contato encontrado com este ID.",
        ERR_NO_TICKET_FOUND: "Nenhum tíquete encontrado com este ID.",
        ERR_NO_USER_FOUND: "Nenhum usuário encontrado com este ID.",
        ERR_NO_WAPP_FOUND: "Nenhum WhatsApp encontrado com este ID.",
        ERR_NO_TAG_FOUND: "Nenhuma TAG encontrada",
        ERR_CREATING_MESSAGE: "Erro ao criar mensagem no banco de dados.",
        ERR_CREATING_TICKET: "Erro ao criar tíquete no banco de dados.",
        ERR_FETCH_WAPP_MSG:
          "Erro ao buscar a mensagem no WhtasApp, talvez ela seja muito antiga.",
        ERR_QUEUE_COLOR_ALREADY_EXISTS:
          "Esta cor já está em uso, por favor escolha outra.",
        ERR_WAPP_GREETING_REQUIRED:
          "A mensagem de saudação é obrigatório quando há mais de um setor.",
        ERR_NO_USER_DELETE: "Não é possível excluir usuário Super",
        ERR_OUT_OF_HOURS: "Fora do Horário de Expediente!",
        ERR_QUICKMESSAGE_INVALID_NAME: "Nome inválido",
        ERR_EDITING_WAPP_MSG: "Não foi possível editar a mensagem do WhatsApp",
        ERR_CREATE_CONTACT_MSG:
          "Ops! Houve um erro na criação do contato, atualize a página e tente novamente, se o problema persistir entre em contato com o suporte técnico.",
        ERR_ACCESS_ANOTHER_COMPANY:
          "Não é possível acessar registros de outra empresa",
        ERR_THE_NUMBER: "O número",
        ERR_THE_NUMBER_IS_NOT_PRESENT_WITHIN_THE_GROUP:
          "não está presente dentro do grupo para realizar a extração dos contatos. É necessário que o mesmo esteja dentro do grupo para realizar a ação.",
        ERR_GENERIC:
          "Ops! Houve um erro, atualize a página e tente novamente, se o problema persistir entre em contato com o suporte técnico.",
        ERR_NAME_INTEGRATION_ALREADY_EXISTS:
          "Este nome de integração já está em uso.",
        ERR_NAME_INTEGRATION_OPENAI_ALREADY_EXISTS:
          "A integração com a OpenAI já está em uso.",
        ERR_NAME_INTEGRATION_MIN_2: "O nome deve ter pelo menos 2 caracteres.",
        ERR_NAME_INTEGRATION_MAX_50: "O nome deve ter no máximo 50 caracteres.",
        ERR_NAME_INTEGRATION_REQUIRED: "O nome é obrigatório.",
        ERR_ACCESS_ANOTHER_COMPANY_INTEGRATION:
          "Não é possível utilizar integração de outra empresa.",
        ERR_NEED_COMPANY_ID_OR_TOKEN_DATA:
          "É necessário companyId ou tokenData.",
        ERR_ONLY_ACTIVE_USER_OR_ADMIN_CAN_EDIT_TICKET:
          "Apenas o usuário ativo do ticket ou o Admin podem fazer alterações no ticket.",
        ERR_WHATSAPP_LINK_ERROR:
          "Ocorreu um erro ao tentar localizar o WhatsApp associado ao usuário.",
        ERR_WHATSAPP_DEFAULT_NOT_FOUND: "O WhatsApp default não encontrado.",
        ERR_WBOT_NOT_FOUND: "Wbot não encontrado.",
        ERR_SMTP_URL_NOT_FOUND: "Configuração de URL SMTP não encontrada.",
        ERR_SMTP_USER_NOT_FOUND: "Configuração de usuário SMTP não encontrada.",
        ERR_SMTP_PASSWORD_NOT_FOUND:
          "Configuração de senha SMTP não encontrada.",
        ERR_SMTP_PORT_NOT_FOUND: "Configuração de porta SMTP não encontrada.",
        ERR_EMAIL_SENDING: "Opa! Houve um erro ao enviar e-mail.",
        ERR_WHATSAPP_NOT_FOUND:
          "Não foi possível encontrar o whatsapp vinculado ao usuário.",
        ERR_CONTACT_HAS_OPEN_TICKET:
          "Já existe um atendimento aberto para esse contato.",
        ERR_TICKET_NOT_FOUND: "Ticket não encontrado.",
        ERR_SKU_REQUIRED: "SKU é obrigatório.",
        ERR_SKU_VALUE_REQUIRED: "Valor do SKU obrigatório.",
        ERR_INVALID_TICKET_ID: "ID de tíquete inválido fornecido.",
        ERR_WORK_HOURS_UNDEFINED: "O horário de trabalho não foi definido.",
        ERR_INVALID_URL:
          "A URL informada é inválida! Por favor, verifique se os dados de autenticação estão corretos na tela de configurações do sistema e tente novamente.",
        ERR_INTERNAL_SERVER_ERROR: "Ocorreu um erro interno do servidor.",
        ERR_CONNECTION_NOT_PROVIDED: "Conexão não informada.",
        ERR_INVALID_NUMBER_FORMAT:
          "Formato de número inválido. Apenas números são permitidos.",
        ERR_QUICKMESSAGE_MIN_3_CARACTERES:
          "A mensagem deve ter pelo menos 3 caracteres.",
        ERR_SHORTCUT_MIN_3_CHARACTERS:
          "O atalho deve ter pelo menos 3 caracteres.",
        ERR_NO_FILE_UPLOADED_QUICK_MESSAGE: "Nenhum arquivo foi enviado.",
        ERR_QUICK_MESSAGE_NOT_FOUND: "Mensagem rápida não encontrada.",
        ERR_UNAUTHENTICATED_OR_UNIDENTIFIED_COMPANY:
          "Usuário não autenticado ou empresa não identificada.",
        ERR_SHORTCODE_REQUIRED: "Atalho é obrigatório.",
        ERR_MESSAGE_REQUIRED: "Mensagem é obrigatória.",
        ERR_QUICKMESSAGE_REQUIRED: "Resposta rápida é obrigatória.",
        ERR_FILE_EXTENSION_NOT_ALLOWED:
          "Tipo de arquivo não permitido na plataforma. Por favor tente outro tipo de arquivo.",
      },
    },
  },
};

export { messages };