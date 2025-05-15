import * as Yup from "yup";
import AppError from "../../errors/AppError";
import MenuNode from "../../models/MenuNode";
import { logger } from "../../utils/logger";

interface MenuOption {
  id: string;
  text: string;
  value: string;
}

interface SaveMenuNodeRequest {
  nodeId: string;
  companyId: number;
  flowId: number;
  label?: string;
  menuTitle: string;
  menuOptions: MenuOption[];
  timeoutSeconds?: number;
  defaultOption?: string;
}

const SaveMenuNodeService = async (data: SaveMenuNodeRequest): Promise<MenuNode> => {
  try {
    // Validação dos dados
    const schema = Yup.object().shape({
      nodeId: Yup.string().required(),
      companyId: Yup.number().required(),
      flowId: Yup.number().required(),
      label: Yup.string(),
      menuTitle: Yup.string().required(),
      menuOptions: Yup.array()
        .of(
          Yup.object().shape({
            id: Yup.string().required(),
            text: Yup.string().required(),
            value: Yup.string().required()
          })
        )
        .min(1, "Pelo menos uma opção de menu é necessária")
        .required(),
      timeoutSeconds: Yup.number().default(300),
      defaultOption: Yup.string()
    });
    
    await schema.validate(data);
    
    // Buscar nó existente ou criar novo
    let menuNode = await MenuNode.findOne({
      where: { nodeId: data.nodeId, companyId: data.companyId }
    });
    
    if (menuNode) {
      // Atualizar nó existente
      menuNode = await menuNode.update({
        label: data.label,
        menuTitle: data.menuTitle,
        menuOptions: data.menuOptions,
        timeoutSeconds: data.timeoutSeconds || 300,
        defaultOption: data.defaultOption
      });
    } else {
      // Criar novo nó
      menuNode = await MenuNode.create({
        nodeId: data.nodeId,
        companyId: data.companyId,
        flowId: data.flowId,
        label: data.label,
        menuTitle: data.menuTitle,
        menuOptions: data.menuOptions,
        timeoutSeconds: data.timeoutSeconds || 300,
        defaultOption: data.defaultOption
      });
    }
    
    return menuNode;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      throw new AppError(error.message);
    }
    
    logger.error(`Erro ao salvar nó de menu: ${error.message}`);
    throw new AppError(`Erro ao salvar nó de menu: ${error.message}`);
  }
};

export default SaveMenuNodeService;