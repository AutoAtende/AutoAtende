import OpenAI from "openai";
import fs from "fs";
import mime from "mime-types";
import Assistant from "../../models/Assistant";
import AssistantFile from "../../models/AssistantFile";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

interface Request {
  assistantId: string;
  file: Express.Multer.File;
  companyId: number;
  toolType?: string;
}

const UploadFileToAssistantService = async ({ 
  assistantId, 
  file, 
  companyId,
  toolType = "file_search" 
}: Request): Promise<any> => {
  try {
    const assistant = await Assistant.findOne({
      where: { id: assistantId, companyId }
    });

    if (!assistant) {
      // Remover arquivo temporário
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new AppError("Assistente não encontrado", 404);
    }

    const openai = new OpenAI({
      apiKey: assistant.openaiApiKey,
    });

    // Verificar se o assistente tem a ferramenta correspondente habilitada
    const hasToolEnabled = assistant.tools && 
      assistant.tools.some(tool => tool.type === toolType);
    
    if (!hasToolEnabled) {
      // Se a ferramenta não estiver habilitada, atualizamos o assistente para incluí-la
      const updatedTools = [
        ...(assistant.tools || []),
        { type: toolType }
      ];
      
      // Atualizar o assistente na OpenAI para incluir a nova ferramenta
      await openai.beta.assistants.update(assistant.assistantId, {
        tools: updatedTools
      });
      
      // Atualizar o registro local
      await assistant.update({ tools: updatedTools });
      
      logger.info({
        companyId,
        assistantId: assistant.id,
        toolType
      }, `Ferramenta ${toolType} adicionada ao assistente`);
    }

    // Processar o arquivo de acordo com o tipo de ferramenta
    if (toolType === "file_search") {
      return await processFileSearchUpload(openai, assistant, file);
    } else if (toolType === "code_interpreter") {
      return await processCodeInterpreterUpload(openai, assistant, file);
    } else {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new AppError(`Tipo de ferramenta ${toolType} não suportado para upload de arquivos`, 400);
    }
  } catch (error) {
    // Garantir que o arquivo temporário seja excluído em caso de erro
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    logger.error({
      companyId,
      assistantId,
      error: error.message,
      stack: error.stack
    }, "Erro ao fazer upload de arquivo para o assistente");
    
    if (error instanceof AppError) throw error;
    
    throw new AppError("Falha ao fazer upload do arquivo para o assistente", 500);
  }
};

// Função auxiliar para processar upload para File Search
async function processFileSearchUpload(openai, assistant, file) {
  try {
    // Upload do arquivo para a OpenAI
    const uploadedFile = await openai.files.create({
      file: fs.createReadStream(file.path),
      purpose: "assistants",
    });
    
    // Criar ou obter o vector store existente
    let vectorStore;
    if (!assistant.vectorStoreId) {
      vectorStore = await openai.vectorStores.create({
        name: `Assistente ${assistant.name} - Vector Store`,
      });
      
      // Atualizar o assistente com o ID do vector store
      await assistant.update({ vectorStoreId: vectorStore.id });
    } else {
      vectorStore = { id: assistant.vectorStoreId };
    }
    
    // Adicionar o arquivo ao vector store
    await openai.vectorStores.files.createAndPoll(vectorStore.id, {
      file_id: uploadedFile.id,
    });
    
    // Atualizar o assistente para usar o vector store
    const toolResources = assistant.toolResources || {};
    const fileSearchResources = toolResources.file_search || {};
    const vectorStoreIds = fileSearchResources.vector_store_ids || [];
    
    if (!vectorStoreIds.includes(vectorStore.id)) {
      vectorStoreIds.push(vectorStore.id);
    }
    
    const updatedToolResources = {
      ...toolResources,
      file_search: {
        ...fileSearchResources,
        vector_store_ids: vectorStoreIds
      }
    };
    
    await openai.beta.assistants.update(assistant.assistantId, {
      tool_resources: updatedToolResources
    });
    
    await assistant.update({ toolResources: updatedToolResources });
    
    // Salvar informações do arquivo no banco de dados
    const assistantFile = await AssistantFile.create({
      assistantId: assistant.id,
      fileId: uploadedFile.id,
      name: file.originalname,
      type: mime.lookup(file.originalname) || file.mimetype,
      purpose: "assistants",
      toolType: "file_search",
      size: file.size
    });
    
    // Remover o arquivo temporário
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    return {
      file: assistantFile,
      vectorStoreId: vectorStore.id
    };
  } catch (error) {
    // Remover o arquivo temporário em caso de erro
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw error;
  }
}

// Função auxiliar para processar upload para Code Interpreter
async function processCodeInterpreterUpload(openai, assistant, file) {
  try {
    // Upload do arquivo para a OpenAI
    const uploadedFile = await openai.files.create({
      file: fs.createReadStream(file.path),
      purpose: "assistants",
    });
    
    // Atualizar o assistente para usar o arquivo com Code Interpreter
    const toolResources = assistant.toolResources || {};
    const codeInterpreterResources = toolResources.code_interpreter || {};
    const fileIds = codeInterpreterResources.file_ids || [];
    
    if (!fileIds.includes(uploadedFile.id)) {
      fileIds.push(uploadedFile.id);
    }
    
    const updatedToolResources = {
      ...toolResources,
      code_interpreter: {
        ...codeInterpreterResources,
        file_ids: fileIds
      }
    };
    
    await openai.beta.assistants.update(assistant.assistantId, {
      tool_resources: updatedToolResources
    });
    
    await assistant.update({ toolResources: updatedToolResources });
    
    // Salvar informações do arquivo no banco de dados
    const assistantFile = await AssistantFile.create({
      assistantId: assistant.id,
      fileId: uploadedFile.id,
      name: file.originalname,
      type: mime.lookup(file.originalname) || file.mimetype,
      purpose: "assistants",
      toolType: "code_interpreter",
      size: file.size
    });
    
    // Remover o arquivo temporário
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    return {
      file: assistantFile
    };
  } catch (error) {
    // Remover o arquivo temporário em caso de erro
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw error;
  }
}

export default UploadFileToAssistantService;