import * as Yup from "yup";
import AppError from "../../errors/AppError";
import QuestionNode from "../../models/QuestionNode";
import { logger } from "../../utils/logger";

interface SaveQuestionNodeRequest {
  nodeId: string;
  companyId: number;
  flowId: number;
  label?: string;
  question: string;
  inputType: string;
  validationType?: string;
  validationRegex?: string;
  errorMessage?: string;
  variableName: string;
  options?: Array<{
    id: number | string;
    text: string;
    value: string;
  }>;
  required?: boolean;
  useValidationErrorOutput?: boolean;
  mediaType?: string;
  allowedFormats?: string[];
  maxFileSize?: number;
}

const SaveQuestionNodeService = async (data: SaveQuestionNodeRequest): Promise<QuestionNode> => {
  try {
    // Validação dos dados
    const schema = Yup.object().shape({
      nodeId: Yup.string().required(),
      companyId: Yup.number().required(),
      flowId: Yup.number().required(),
      label: Yup.string(),
      question: Yup.string().required(),
      inputType: Yup.string().required(),
      validationType: Yup.string(),
      validationRegex: Yup.string(),
      errorMessage: Yup.string(),
      variableName: Yup.string()
        .required()
        .matches(/^[a-zA-Z][a-zA-Z0-9_]*$/, "Nome da variável inválido"),
      options: Yup.array().of(
        Yup.object().shape({
          id: Yup.mixed().required(),
          text: Yup.string().required(),
          value: Yup.string().required()
        })
      ),
      required: Yup.boolean().default(true),
      useValidationErrorOutput: Yup.boolean(),
      mediaType: Yup.string(),
      allowedFormats: Yup.array().of(Yup.string()),
      maxFileSize: Yup.number()
    });
    
    await schema.validate(data);
    
    // Validações específicas para cada tipo de entrada
    if (data.inputType === "options" && (!data.options || data.options.length === 0)) {
      throw new AppError("É necessário fornecer pelo menos uma opção para o tipo 'options'");
    }
    
    if (data.validationType === "regex" && !data.validationRegex) {
      throw new AppError("É necessário fornecer uma expressão regular para o tipo de validação 'regex'");
    }
    
    if (data.inputType === "cpf") {
      // Certifique-se de que a validação de CPF tenha uma mensagem de erro padrão
      if (!data.errorMessage) {
        data.errorMessage = "Por favor, digite um CPF válido.";
      }
    }
    
    // Buscar nó existente ou criar novo
    let questionNode = await QuestionNode.findOne({
      where: { nodeId: data.nodeId, companyId: data.companyId }
    });
    
    if (questionNode) {
      // Atualizar nó existente
      logger.info(`Atualizando nó de pergunta ${data.nodeId}`);
      questionNode = await questionNode.update({
        label: data.label,
        question: data.question,
        inputType: data.inputType,
        validationType: data.validationType,
        validationRegex: data.validationRegex,
        errorMessage: data.errorMessage,
        variableName: data.variableName,
        options: data.options,
        required: data.required !== false, // default é true
        useValidationErrorOutput: data.useValidationErrorOutput,
        mediaType: data.mediaType,
        allowedFormats: data.allowedFormats,
        maxFileSize: data.maxFileSize
      });
    } else {
      // Criar novo nó
      logger.info(`Criando novo nó de pergunta para ${data.nodeId}`);
      questionNode = await QuestionNode.create({
        nodeId: data.nodeId,
        companyId: data.companyId,
        flowId: data.flowId,
        label: data.label,
        question: data.question,
        inputType: data.inputType,
        validationType: data.validationType,
        validationRegex: data.validationRegex,
        errorMessage: data.errorMessage,
        variableName: data.variableName,
        options: data.options,
        required: data.required !== false, // default é true
        useValidationErrorOutput: data.useValidationErrorOutput,
        mediaType: data.mediaType,
        allowedFormats: data.allowedFormats,
        maxFileSize: data.maxFileSize
      });
    }
    
    return questionNode;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      throw new AppError(error.message);
    }
    
    logger.error(`Erro ao salvar nó de pergunta: ${error.message}`);
    throw new AppError(`Erro ao salvar nó de pergunta: ${error.message}`);
  }
};

export default SaveQuestionNodeService;