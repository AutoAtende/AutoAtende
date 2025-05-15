/**
 * FlowOptimizer.js - Utilitário de otimização completo para FlowBuilder
 * 
 * Este módulo analisa e atualiza fluxos antigos para garantir compatibilidade
 * com as versões mais recentes dos componentes, adicionando campos faltantes
 * e atualizando estruturas desatualizadas.
 * 
 * Quando novos campos são adicionados aos componentes do FlowBuilder,
 * basta atualizar os schemas neste arquivo.
 */

// Definições completas dos schemas de nós
// Estas definições refletem TODOS os campos que cada tipo de nó deve ter
const NODE_SCHEMAS = {
    /**
     * Nó de Início - Ponto de entrada do fluxo
     */
    startNode: {
      label: 'Início', // Label padrão
      // Sem campos adicionais específicos
    },
    
    /**
     * Nó de Fim - Ponto de saída do fluxo
     */
    endNode: {
      label: 'Fim', // Label padrão
      // Sem campos adicionais específicos
    },
    
    /**
     * Nó de Mensagem - Envia mensagens de texto ou mídia para o contato
     */
    messageNode: {
      message: '', // Conteúdo da mensagem (para tipo texto)
      messageType: 'text', // Tipo de mensagem: 'text', 'image', 'audio', 'video', 'document', 'location'
      caption: '', // Legenda (para mídia)
      mediaUrl: '', // URL da mídia (para tipos não-texto)
      filename: '', // Nome do arquivo (para documento)
      mimeType: '', // Tipo MIME (para mídia)
      mediaType: '', // Tipo de mídia (imagem, áudio, vídeo, documento)
      label: 'Mensagem', // Label padrão
      latitude: null, // Latitude (para localização)
      longitude: null, // Longitude (para localização)
      address: '', // Endereço (para localização)
      locationName: '', // Nome do local (para localização)
      delay: 1000, // Atraso em milissegundos antes de enviar a mensagem (default: 1s)
      // Campos para compatibilidade com whatsapp e outros canais
      templateId: null, // ID do template (para mensagens de template)
      templateData: {}, // Dados do template (para mensagens de template)
      headerType: null, // Tipo de cabeçalho para templates
      bodyText: '', // Texto do corpo para templates
      footerText: '', // Texto do rodapé para templates
      header: {}, // Informações de cabeçalho para templates
      buttons: [], // Botões para mensagens interativas (se aplicável)
    },
    
    /**
     * Nó de Mensagem Interna - Cria mensagem interna no ticket
     */
    internalMessageNode: {
      message: '', // Corpo da mensagem interna
      selectedVariable: null, // Variável selecionada para inserção
      label: 'Mensagem Interna', // Label padrão
      nodeId: null, // ID do nó para referência
    },
    
    /**
     * Nó de Imagem - Envia imagem com legenda opcional
     */
    imageNode: {
      caption: '', // Legenda da imagem
      mediaUrl: '', // URL da imagem
      mimeType: '', // Tipo MIME da imagem
      mediaType: 'image', // Tipo de mídia (sempre 'image')
      label: 'Imagem', // Label padrão
    },
    
    /**
     * Nó de Menu - Exibe menu com opções para seleção
     */
    menuNode: {
      menuTitle: '', // Título do menu
      menuOptions: [], // Opções do menu [{id, text, value}]
      label: 'Menu', // Label padrão
      useEmoji: false, // Se deve usar emojis nas opções
    },
    
    /**
     * Nó de Pergunta - Faz perguntas e aguarda resposta
     */
    questionNode: {
      question: '', // Texto da pergunta
      required: true, // Se a resposta é obrigatória
      inputType: 'text', // Tipo de entrada (text, email, cpf, cnpj, etc)
      errorMessage: '', // Mensagem de erro personalizada
      variableName: '', // Nome da variável para armazenar a resposta
      validationType: null, // Tipo de validação (email, cpf, cnpj, regex)
      useValidationErrorOutput: false, // Se deve usar saída de erro de validação
      options: [], // Opções de resposta predefinidas [{id, text, value}]
      validationRegex: '', // Expressão regular para validação personalizada
      label: 'Pergunta', // Label padrão
    },
    
    /**
     * Nó Condicional - Direciona o fluxo baseado em condições
     */
    conditionalNode: {
      variable: '', // Variável a ser avaliada
      conditions: [], // Lista de condições [{id, operator, value, description}]
      defaultValue: '', // Valor padrão se a variável não existir
      label: 'Condição', // Label padrão
    },
    
    /**
     * Nó de Atendente - Transfere para atendimento humano
     */
    attendantNode: {
      assignedUserId: null, // ID do usuário atendente
      assignmentType: 'manual', // Tipo de atribuição (sempre 'manual')
      queueId: null, // ID da fila
      timeoutSeconds: 300, // Tempo limite em segundos
      endFlowFlag: true, // Flag indicando que este nó encerra o fluxo
      label: 'Atendente', // Label padrão
    },
    
    /**
     * Nó de Verificação de Horário - Verifica horário de funcionamento
     */
    scheduleNode: {
      horarioGroupId: null, // ID do grupo de horário
      horarioGroupName: '', // Nome do grupo de horário
      label: 'Verificação de Horário', // Label padrão
    },
    
    /**
     * Nó de Webhook - Envia dados para URL externa
     */
    webhookNode: {
      url: '', // URL do webhook
      method: 'GET', // Método HTTP
      headers: {}, // Cabeçalhos HTTP
      variableName: '', // Nome da variável para armazenar a resposta
      timeout: 10000, // Tempo limite em milissegundos
      retries: 3, // Número de tentativas
      secretKey: '', // Chave secreta para assinatura HMAC
      label: 'Webhook', // Label padrão
      nodeId: null, // ID do nó para referência
    },
    
    /**
     * Nó de API - Faz chamadas para APIs externas
     */
    apiNode: {
      url: '', // URL da API
      method: 'GET', // Método HTTP
      headers: {}, // Cabeçalhos HTTP
      body: '', // Corpo da requisição
      queryParams: {}, // Parâmetros de consulta
      contentType: 'application/json', // Tipo de conteúdo
      responseVariable: '', // Variável para armazenar a resposta
      timeout: 10000, // Tempo limite em milissegundos
      retries: 1, // Número de tentativas
      parseVariables: false, // Se deve substituir variáveis no corpo
      paramsFromVariables: false, // Permitir adicionar parâmetros a partir de variáveis
      paramsVariable: '', // Variável com parâmetros adicionais
      label: 'API', // Label padrão
      nodeId: null, // ID do nó para referência
      useResponseFilter: false, // Se deve filtrar dados da resposta
      responseFilterPath: '', // Caminho para extrair da resposta (JSONPath)
      statusVariable: '', // Variável para código de status
      storeErrorResponse: true, // Armazenar resposta mesmo em caso de erro
      // Campos para autenticação
      authType: 'none', // Tipo de autenticação: 'none', 'basic', 'bearer', 'apiKey'
      authUser: '', // Usuário para Basic Auth
      authPassword: '', // Senha para Basic Auth
      authToken: '', // Token para Bearer Auth
      apiKeyName: '', // Nome da API Key
      apiKeyValue: '', // Valor da API Key
      apiKeyIn: 'header', // Local para enviar API Key (header ou query)
      // Campos para validação de sucesso
      successCondition: 'statusCode', // Condição de sucesso: 'statusCode' ou 'custom'
      successExpression: '', // Expressão personalizada para validação de sucesso
    },
    
    /**
     * Nó de Tag - Aplica ou remove tags do contato
     */
    tagNode: {
      tags: [], // Lista de tags a serem aplicadas [{id, name, color}]
      operation: 'add', // Operação (add ou remove)
      selectionMode: 'multiple', // Modo de seleção: 'single' ou 'multiple'
      label: 'Tag', // Label padrão
    },
    
    /**
     * Nó de Fila - Direciona para fila de atendimento
     */
    queueNode: {
      queueId: null, // ID da fila
      queueName: null, // Nome da fila (para exibição)
      label: 'Fila', // Label padrão
      endFlowFlag: true, // Flag indicando que este nó encerra o fluxo
    },
    
    /**
     * Nó de Banco de Dados - Consulta ou salva dados no banco
     */
    databaseNode: {
      databaseType: 'firebase', // Tipo de banco de dados (firebase, realtime, postgresql, mysql, firebird)
      operation: 'get', // Operação (get, get_document, add, update, delete)
      collection: '', // Coleção/tabela
      document: '', // Documento/registro
      whereConditions: [], // Condições WHERE [{field, operator, value}]
      orderBy: { field: '', direction: 'asc' }, // Ordenação
      limit: 10, // Limite de resultados
      responseVariable: '', // Variável para armazenar a resposta
      // Campos para Firebase/Realtime
      credentials: '', // Credenciais em formato JSON
      dataToWrite: '', // Dados para adicionar/atualizar
      useVariableForData: false, // Usar dados de uma variável
      dataVariable: '', // Nome da variável com dados
      // Campos para bancos relacionais
      host: '', // Host/servidor
      port: '', // Porta
      database: '', // Nome do banco de dados
      username: '', // Usuário
      password: '', // Senha
      sqlQuery: '', // Query SQL
      sqlParams: [], // Parâmetros SQL [{name, value}]
      // Campos comuns
      label: 'Banco de Dados', // Label padrão
      timeout: 30000, // Tempo limite em milissegundos
      retries: 1, // Número de tentativas
      statusVariable: '', // Variável para código de status
      storeErrorResponse: true, // Armazenar resposta mesmo em caso de erro
    },
    
    /**
     * Nó de OpenAI - Integração com assistente OpenAI
     */
    openaiNode: {
      typebotIntegration: {
        name: '', // Nome da integração
        prompt: '', // Prompt para o modelo
        apiKey: '', // Chave de API OpenAI
        voice: 'texto', // Tipo de voz (texto ou TTS)
        voiceKey: '', // Chave de API para voz
        voiceRegion: '', // Região para API de voz
        maxTokens: 100, // Número máximo de tokens
        temperature: 1, // Temperatura (criatividade)
        maxMessages: 10 // Número máximo de mensagens
      },
      label: 'OpenAI', // Label padrão
      endFlowFlag: true, // Flag indicando que este nó encerra o fluxo
    },
    
    /**
     * Nó de Typebot - Integração com Typebot
     */
    typebotNode: {
      typebotIntegration: {
        name: '', // Nome da integração
        typebotUrl: '', // URL do Typebot
        typebotId: '', // ID do Typebot
        typebotToken: '', // Token de autenticação
        saveTypebotResponse: false // Se deve salvar respostas do Typebot
      },
      label: 'Typebot', // Label padrão
    },
    
    /**
     * Nó de Troca de Fluxo - Muda para outro fluxo de atendimento
     */
    switchFlowNode: {
      targetFlowId: null, // ID do fluxo de destino
      targetFlowName: '', // Nome do fluxo de destino
      transferVariables: false, // Se deve transferir variáveis
      label: 'Trocar Fluxo', // Label padrão
    },
    
    /**
     * Nó de Agendamento - Sistema de agendamento de compromissos
     */
    appointmentNode: {
      configuration: {
        welcomeMessage: 'Bem-vindo ao sistema de agendamento!', // Mensagem de boas-vindas
        timeoutMinutes: 30 // Tempo limite em minutos
      },
      label: 'Agendamento', // Label padrão
      endFlowFlag: true, // Flag indicando que este nó encerra o fluxo
    }
  };
  
  /**
   * Analisa um nó e retorna uma versão otimizada com campos faltantes preenchidos
   * @param {Object} node - O nó a ser analisado
   * @returns {Object} - O nó otimizado e um objeto de log com detalhes
   */
  const optimizeNode = (node) => {
    if (!node || !node.type || !node.data) {
      return { 
        node, 
        optimized: false, 
        log: { message: 'Nó inválido ou sem tipo definido', status: 'error' } 
      };
    }
    
    // Obter schema para o tipo de nó
    const schema = NODE_SCHEMAS[node.type];
    if (!schema) {
      return { 
        node, 
        optimized: false, 
        log: { message: `Tipo de nó desconhecido: ${node.type}`, status: 'warning' } 
      };
    }
    
    // Clonar nó para modificação
    let optimizedNode = { ...node };
    optimizedNode.data = { ...node.data };
    
    // Variáveis para controle de otimização
    let optimized = false;
    const fieldsAdded = [];
    const fieldsModified = [];
    const details = {};
    
    // Verificar e adicionar campos faltantes
    for (const [key, defaultValue] of Object.entries(schema)) {
      // Verifica se o campo existe no nó original
      if (!(key in optimizedNode.data)) {
        optimizedNode.data[key] = defaultValue;
        fieldsAdded.push(key);
        optimized = true;
        details[key] = { added: defaultValue };
      }
      // Casos especiais para estruturas aninhadas ou formatos específicos
      else if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue)) {
        // Verifica estruturas aninhadas (objetos)
        if (optimizedNode.data[key] === null || typeof optimizedNode.data[key] !== 'object') {
          optimizedNode.data[key] = defaultValue;
          fieldsModified.push(key);
          optimized = true;
          details[key] = { 
            before: optimizedNode.data[key],
            after: defaultValue
          };
        } else {
          // Verifica campos faltantes dentro do objeto
          const nestedOptimized = {};
          let nestedModified = false;
          
          for (const [nestedKey, nestedDefault] of Object.entries(defaultValue)) {
            if (!(nestedKey in optimizedNode.data[key])) {
              if (!optimizedNode.data[key]) {
                optimizedNode.data[key] = {};
              }
              optimizedNode.data[key][nestedKey] = nestedDefault;
              nestedOptimized[nestedKey] = nestedDefault;
              nestedModified = true;
              optimized = true;
            }
          }
          
          if (nestedModified) {
            fieldsModified.push(key);
            details[key] = { 
              nestedFields: nestedOptimized
            };
          }
        }
      }
    }
    
    // Tratamentos específicos por tipo de nó
    switch (node.type) {
      case 'internalMessageNode':
        // Garantir que o campo message nunca seja undefined ou null
        if (!optimizedNode.data.message && optimizedNode.data.selectedVariable) {
          optimizedNode.data.message = `Nota interna: ${optimizedNode.data.selectedVariable} = \${${optimizedNode.data.selectedVariable}}`;
          if (!fieldsModified.includes('message')) {
            fieldsModified.push('message');
          }
          optimized = true;
          details.message = {
            before: null,
            after: optimizedNode.data.message,
            reason: 'Criado automaticamente com base na variável selecionada'
          };
        }
        break;
        
      case 'questionNode':
        // Para nós de pergunta, verificar novos recursos como saída de erro de validação
        if (optimizedNode.data.inputType === 'cpf' || 
            optimizedNode.data.inputType === 'cnpj' || 
            optimizedNode.data.inputType === 'email' ||
            optimizedNode.data.validationType === 'cpf' ||
            optimizedNode.data.validationType === 'cnpj' ||
            optimizedNode.data.validationType === 'email' ||
            optimizedNode.data.validationType === 'regex') {
          
          // Se tem validação mas não tem flag de saída de erro, adicionar
          if ('useValidationErrorOutput' in optimizedNode.data) {
            if (optimizedNode.data.useValidationErrorOutput === false) {
              optimizedNode.data.useValidationErrorOutput = true;
              if (!fieldsModified.includes('useValidationErrorOutput')) {
                fieldsModified.push('useValidationErrorOutput');
              }
              optimized = true;
              details.useValidationErrorOutput = {
                before: false,
                after: true,
                reason: 'Atualizado para permitir tratamento de erro de validação'
              };
            }
          } else {
            optimizedNode.data.useValidationErrorOutput = true;
            if (!fieldsAdded.includes('useValidationErrorOutput')) {
              fieldsAdded.push('useValidationErrorOutput');
            }
            optimized = true;
            details.useValidationErrorOutput = {
              added: true,
              reason: 'Adicionado automaticamente para permitir tratamento de erro de validação'
            };
          }
        }
        
        // Verificar campos obrigatórios para o nó de pergunta
        if (!optimizedNode.data.variableName) {
          // Criar nome de variável baseado na pergunta ou ID do nó
          let autoVarName = '';
          if (optimizedNode.data.question) {
            // Extrair palavras-chave da pergunta
            const text = optimizedNode.data.question.toLowerCase();
            const words = text.split(/\s+/).filter(w => w.length > 3).slice(0, 2);
            if (words.length > 0) {
              autoVarName = words.join('_');
              // Remover caracteres especiais e acentos
              autoVarName = autoVarName.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                                      .replace(/[^a-z0-9_]/g, '');
            }
          }
          
          if (!autoVarName) {
            // Usar ID do nó se não conseguir extrair da pergunta
            autoVarName = `resp_${node.id.replace(/[^a-zA-Z0-9]/g, '')}`; 
          }
          
          optimizedNode.data.variableName = autoVarName;
          if (!fieldsAdded.includes('variableName')) {
            fieldsAdded.push('variableName');
          }
          optimized = true;
          details.variableName = {
            added: autoVarName,
            reason: 'Criado automaticamente para armazenar resposta da pergunta'
          };
        }
        break;
      
      case 'attendantNode':
      case 'queueNode':
      case 'appointmentNode':
      case 'openaiNode':
        // Garantir que os nós terminais sempre tenham a flag de fim de fluxo
        if (!('endFlowFlag' in optimizedNode.data)) {
          optimizedNode.data.endFlowFlag = true;
          if (!fieldsAdded.includes('endFlowFlag')) {
            fieldsAdded.push('endFlowFlag');
          }
          optimized = true;
          details.endFlowFlag = {
            added: true,
            reason: 'Nó terminal - sempre encerra o fluxo'
          };
        } else if (optimizedNode.data.endFlowFlag === false) {
          optimizedNode.data.endFlowFlag = true;
          if (!fieldsModified.includes('endFlowFlag')) {
            fieldsModified.push('endFlowFlag');
          }
          optimized = true;
          details.endFlowFlag = {
            before: false,
            after: true,
            reason: 'Nó terminal - sempre encerra o fluxo'
          };
        }
        break;
        
      case 'apiNode':
      case 'webhookNode':
        // Verificar headers para evitar undefined/null
        if (!optimizedNode.data.headers) {
          optimizedNode.data.headers = {};
          if (!fieldsAdded.includes('headers')) {
            fieldsAdded.push('headers');
          }
          optimized = true;
          details.headers = {
            added: {},
            reason: 'Objeto de headers vazio adicionado'
          };
        }
        
        // Verificar nodeId para referência
        if (!optimizedNode.data.nodeId) {
          optimizedNode.data.nodeId = node.id;
          if (!fieldsAdded.includes('nodeId')) {
            fieldsAdded.push('nodeId');
          }
          optimized = true;
          details.nodeId = {
            added: node.id,
            reason: 'ID do nó adicionado para referência'
          };
        }
        break;
        
      case 'databaseNode':
        // Verificar whereConditions
        if (!optimizedNode.data.whereConditions) {
          optimizedNode.data.whereConditions = [];
          if (!fieldsAdded.includes('whereConditions')) {
            fieldsAdded.push('whereConditions');
          }
          optimized = true;
          details.whereConditions = {
            added: [],
            reason: 'Array de condições vazio adicionado'
          };
        }
        
        // Verificar orderBy
        if (!optimizedNode.data.orderBy) {
          optimizedNode.data.orderBy = { field: '', direction: 'asc' };
          if (!fieldsAdded.includes('orderBy')) {
            fieldsAdded.push('orderBy');
          }
          optimized = true;
          details.orderBy = {
            added: { field: '', direction: 'asc' },
            reason: 'Objeto de ordenação padrão adicionado'
          };
        }
        break;
        
      case 'tagNode':
        // Verificar tipo de operação e garante que é válido
        if (optimizedNode.data.operation && 
            !['add', 'remove'].includes(optimizedNode.data.operation)) {
          optimizedNode.data.operation = 'add';
          if (!fieldsModified.includes('operation')) {
            fieldsModified.push('operation');
          }
          optimized = true;
          details.operation = {
            before: optimizedNode.data.operation,
            after: 'add',
            reason: 'Operação inválida corrigida para "add"'
          };
        }
        
        // Verificar tags para evitar undefined/null
        if (!optimizedNode.data.tags) {
          optimizedNode.data.tags = [];
          if (!fieldsAdded.includes('tags')) {
            fieldsAdded.push('tags');
          }
          optimized = true;
          details.tags = {
            added: [],
            reason: 'Array de tags vazio adicionado'
          };
        }
  
        // Verificar selectionMode
        if (!optimizedNode.data.selectionMode) {
          optimizedNode.data.selectionMode = 'multiple';
          if (!fieldsAdded.includes('selectionMode')) {
            fieldsAdded.push('selectionMode');
          }
          optimized = true;
          details.selectionMode = {
            added: 'multiple',
            reason: 'Modo de seleção padrão adicionado'
          };
        }
        break;
        
      case 'menuNode':
        // Verificar menuOptions para evitar undefined/null
        if (!optimizedNode.data.menuOptions) {
          optimizedNode.data.menuOptions = [];
          if (!fieldsAdded.includes('menuOptions')) {
            fieldsAdded.push('menuOptions');
          }
          optimized = true;
          details.menuOptions = {
            added: [],
            reason: 'Array de opções vazio adicionado'
          };
        }
        
        // Verificar useEmoji
        if (!('useEmoji' in optimizedNode.data)) {
          optimizedNode.data.useEmoji = false;
          if (!fieldsAdded.includes('useEmoji')) {
            fieldsAdded.push('useEmoji');
          }
          optimized = true;
          details.useEmoji = {
            added: false,
            reason: 'Campo useEmoji adicionado com valor padrão'
          };
        }
        break;
        
      case 'scheduleNode':
        // Verificar campo horarioGroupId (obrigatório para o funcionamento)
        if (!optimizedNode.data.horarioGroupId && !optimizedNode.data.horarioGroupName) {
          // Como esse campo é obrigatório, alertamos mas não tentamos corrigir
          details.missingRequired = {
            field: 'horarioGroupId',
            reason: 'Campo obrigatório faltando - verificação não funcionará corretamente'
          };
        }
        break;
        
      case 'conditionalNode':
        // Verificar conditions para evitar undefined/null
        if (!optimizedNode.data.conditions) {
          optimizedNode.data.conditions = [];
          if (!fieldsAdded.includes('conditions')) {
            fieldsAdded.push('conditions');
          }
          optimized = true;
          details.conditions = {
            added: [],
            reason: 'Array de condições vazio adicionado'
          };
        }
  
        // Verificar defaultValue
        if (!('defaultValue' in optimizedNode.data)) {
          optimizedNode.data.defaultValue = '';
          if (!fieldsAdded.includes('defaultValue')) {
            fieldsAdded.push('defaultValue');
          }
          optimized = true;
          details.defaultValue = {
            added: '',
            reason: 'Campo defaultValue adicionado com valor padrão'
          };
        }
        break;
        
      case 'switchFlowNode':
        // Verificar targetFlowId (obrigatório para o funcionamento)
        if (!optimizedNode.data.targetFlowId && !optimizedNode.data.targetFlowName) {
          // Como esse campo é obrigatório, alertamos mas não tentamos corrigir
          details.missingRequired = {
            field: 'targetFlowId',
            reason: 'Campo obrigatório faltando - troca de fluxo não funcionará'
          };
        }
        break;
    }
    
    // Gerar mensagem de log
    let message, status;
    if (optimized) {
      if (fieldsAdded.length > 0 && fieldsModified.length > 0) {
        message = `Nó otimizado: ${fieldsAdded.length} campos adicionados, ${fieldsModified.length} campos modificados`;
      } else if (fieldsAdded.length > 0) {
        message = `Nó otimizado: ${fieldsAdded.length} campos adicionados`;
      } else {
        message = `Nó otimizado: ${fieldsModified.length} campos modificados`;
      }
      status = 'success';
    } else {
      // Verificar alertas
      if (details.missingRequired) {
        message = `Alerta: ${details.missingRequired.reason}`;
        status = 'warning';
      } else {
        message = 'Nó já está atualizado, nenhuma otimização necessária';
        status = 'info';
      }
    }
    
    return {
      node: optimizedNode,
      optimized,
      log: {
        message,
        status,
        fieldsAdded,
        fieldsModified,
        details: Object.keys(details).length > 0 ? details : null
      }
    };
  };
  
  /**
   * Otimiza um fluxo completo, atualizando todos os nós conforme necessário
   * @param {Object} flow - O fluxo a ser otimizado
   * @returns {Object} - O fluxo otimizado e logs detalhados
   */
  const optimizeFlow = (flow) => {
    if (!flow || !flow.nodes || !Array.isArray(flow.nodes)) {
      return {
        flow,
        optimized: false,
        logs: [{ message: 'Fluxo inválido ou sem nós', status: 'error' }]
      };
    }
    
    // Clonar o fluxo para não modificar o original
    const optimizedFlow = { ...flow };
  
    // Clonar apenas os arrays de nós e arestas para modificação
    optimizedFlow.nodes = [...flow.nodes];
    optimizedFlow.edges = flow.edges ? [...flow.edges] : [];
    
    // Estatísticas
    let totalOptimized = 0;
    const logs = [];
    
    // Otimizar cada nó
    optimizedFlow.nodes = flow.nodes.map((node, index) => {
      const result = optimizeNode(node);
      
      // Adicionar log com informações do nó
      logs.push({
        nodeId: node.id,
        nodeType: node.type,
        nodeName: node.data?.label || `Nó ${index + 1}`,
        message: result.log.message,
        status: result.log.status,
        details: result.log.details,
        fieldsAdded: result.log.fieldsAdded,
        fieldsModified: result.log.fieldsModified
      });
      
      // Incrementar contador se houve otimização
      if (result.optimized) {
        totalOptimized++;
      }
      
      return result.node;
    });
    
    // Verificar se há nós que precisam ser atualizados
    const optimized = totalOptimized > 0;
    
    return {
      flow: optimizedFlow,
      optimized,
      totalOptimized,
      logs
    };
  };
  
  /**
   * Função para verificar se um fluxo precisa ser otimizado
   * @param {Object} flow - O fluxo a ser analisado
   * @returns {boolean} - True se o fluxo precisa de otimização
   */
  const needsOptimization = (flow) => {
    if (!flow || !flow.nodes || !Array.isArray(flow.nodes)) {
      return false;
    }
    
    // Verificar cada nó do fluxo
    for (const node of flow.nodes) {
      const result = optimizeNode(node);
      if (result.optimized) {
        return true;
      }
    }
    
    return false;
  };
  
  // Export individual functions and constants
  export { optimizeNode, optimizeFlow, needsOptimization, NODE_SCHEMAS };
  
  // Default export for backward compatibility
  export default {
    optimizeNode,
    optimizeFlow,
    needsOptimization,
    NODE_SCHEMAS
  };