import { Op, Transaction } from 'sequelize';
import AppError from '../../errors/AppError';
import KanbanChecklistTemplate from '../../models/KanbanChecklistTemplate';
import KanbanChecklistItem from '../../models/KanbanChecklistItem';
import KanbanCard from '../../models/KanbanCard';
import KanbanLane from '../../models/KanbanLane';
import KanbanBoard from '../../models/KanbanBoard';
import User from '../../models/User';
import { logger } from '../../utils/logger';
import database from '../../database';
import { Sequelize } from 'sequelize';

interface CreateTemplateData {
  name: string;
  description?: string;
  itemsTemplate: Array<{
    description: string;
    required: boolean;
    position: number;
  }>;
  companyId: number;
  createdBy: number;
}

interface UpdateTemplateData {
  name?: string;
  description?: string;
  itemsTemplate?: Array<{
    description: string;
    required: boolean;
    position: number;
  }>;
  active?: boolean;
}

interface CreateChecklistItemData {
  description: string;
  required?: boolean;
  position?: number;
  cardId: number;
  templateId?: number;
  assignedUserId?: number;
  companyId: number;
}

interface UpdateChecklistItemData {
  description?: string;
  required?: boolean;
  position?: number;
  checked?: boolean;
  assignedUserId?: number;
  checkedBy?: number;
  checkedAt?: Date | null;
}

const createTemplate = async (data: CreateTemplateData): Promise<KanbanChecklistTemplate> => {
  try {
    const template = await KanbanChecklistTemplate.create(data);
    return template;
  } catch (error) {
    logger.error('Error creating checklist template:', error);
    throw new AppError('Error creating checklist template: ' + error.message);
  }
};

const findTemplateById = async (templateId: number, companyId: number): Promise<KanbanChecklistTemplate> => {
  try {
    const template = await KanbanChecklistTemplate.findOne({
      where: {
        id: templateId,
        companyId
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!template) {
      throw new AppError('Checklist template not found', 404);
    }

    return template;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error fetching checklist template:', error);
    throw new AppError('Error fetching checklist template');
  }
};

const findTemplates = async (companyId: number, searchParam?: string, active: boolean = true): Promise<KanbanChecklistTemplate[]> => {
  try {
    const whereCondition: any = {
      companyId
    };

    if (active !== undefined) {
      whereCondition.active = active;
    }

    if (searchParam) {
      whereCondition[Op.or] = [
        { name: { [Op.iLike]: `%${searchParam}%` } },
        { description: { [Op.iLike]: `%${searchParam}%` } }
      ];
    }

    const templates = await KanbanChecklistTemplate.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['name', 'ASC']]
    });

    return templates;
  } catch (error) {
    logger.error('Error fetching checklist templates:', error);
    throw new AppError('Error fetching checklist templates');
  }
};

const updateTemplate = async (
  templateId: number,
  companyId: number,
  data: UpdateTemplateData
): Promise<KanbanChecklistTemplate> => {
  try {
    const template = await KanbanChecklistTemplate.findOne({
      where: {
        id: templateId,
        companyId
      }
    });

    if (!template) {
      throw new AppError('Checklist template not found', 404);
    }

    await template.update(data);

    return template;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error updating checklist template:', error);
    throw new AppError('Error updating checklist template');
  }
};

const deleteTemplate = async (templateId: number, companyId: number): Promise<void> => {
  try {
    const template = await KanbanChecklistTemplate.findOne({
      where: {
        id: templateId,
        companyId
      }
    });

    if (!template) {
      throw new AppError('Checklist template not found', 404);
    }

    // Verificar se o template está sendo usado
    const checklistItems = await KanbanChecklistItem.findOne({
      where: {
        templateId
      }
    });

    if (checklistItems) {
      // Se estiver em uso, apenas desativar
      await template.update({ active: false });
    } else {
      // Se não estiver em uso, excluir
      await template.destroy();
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error deleting checklist template:', error);
    throw new AppError('Error deleting checklist template');
  }
};

const applyTemplateToCard = async (
  templateId: number,
  cardId: number,
  companyId: number,
  transaction?: Transaction
): Promise<KanbanChecklistItem[]> => {
  try {
    // Verificar se o template existe
    const template = await KanbanChecklistTemplate.findOne({
      where: {
        id: templateId,
        companyId
      }
    });

    if (!template) {
      throw new AppError('Checklist template not found', 404);
    }

    // Verificar se o card existe e pertence à empresa
    const card = await KanbanCard.findOne({
      where: { id: cardId },
      include: [
        {
          model: KanbanLane,
          as: 'lane',
          include: [
            {
              model: KanbanBoard,
              as: 'board',
              where: { companyId }
            }
          ]
        }
      ]
    });

    if (!card) {
      throw new AppError('Card not found or does not belong to company', 404);
    }

    // Obter os itens do template
    const templateItems = template.itemsTemplate || [];

    // Criar os itens do checklist
    const checklistItems = await Promise.all(
      templateItems.map(item => 
        KanbanChecklistItem.create({
          description: item.description,
          required: item.required,
          position: item.position,
          cardId,
          templateId
        }, { transaction })
      )
    );

    return checklistItems;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error applying checklist template to card:', error);
    throw new AppError('Error applying checklist template to card');
  }
};

const createChecklistItem = async (data: CreateChecklistItemData): Promise<KanbanChecklistItem> => {
  const { cardId, companyId, ...itemData } = data;
  
  try {
    // Verificar se o card existe e pertence à empresa
    const card = await KanbanCard.findOne({
      where: { id: cardId },
      include: [
        {
          model: KanbanLane,
          as: 'lane',
          include: [
            {
              model: KanbanBoard,
              as: 'board',
              where: { companyId }
            }
          ]
        }
      ]
    });

    if (!card) {
      throw new AppError('Card not found or does not belong to company', 404);
    }

    // Se a posição não for especificada, colocar no final
    if (itemData.position === undefined) {
      const maxPosition = await KanbanChecklistItem.max('position', {
        where: { cardId }
      }) as number;
      
      itemData.position = (maxPosition !== null) ? maxPosition + 1 : 0;
    }

    // Verificar usuário atribuído
    if (itemData.assignedUserId) {
      const user = await User.findOne({
        where: {
          id: itemData.assignedUserId,
          companyId
        }
      });

      if (!user) {
        throw new AppError('Assigned user not found or does not belong to company', 404);
      }
    }

    const checklistItem = await KanbanChecklistItem.create({
      ...itemData,
      cardId
    });

    // Recarregar o item com relações
    const createdItem = await KanbanChecklistItem.findByPk(checklistItem.id, {
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    return createdItem;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error creating checklist item:', error);
    throw new AppError('Error creating checklist item: ' + error.message);
  }
};

const updateChecklistItem = async (
  itemId: number,
  companyId: number,
  data: UpdateChecklistItemData,
  transaction?: Transaction
): Promise<KanbanChecklistItem> => {
  try {
    const checklistItem = await KanbanChecklistItem.findOne({
      where: { id: itemId },
      include: [
        {
          model: KanbanCard,
          as: 'card',
          include: [
            {
              model: KanbanLane,
              as: 'lane',
              include: [
                {
                  model: KanbanBoard,
                  as: 'board',
                  where: { companyId }
                }
              ]
            }
          ]
        }
      ]
    });

    if (!checklistItem) {
      throw new AppError('Checklist item not found or does not belong to company', 404);
    }

    const updateData = { ...data };

    // Se estiver marcando como verificado, registrar data
    if (data.checked === true && !checklistItem.checked) {
      updateData.checkedAt = new Date();
    } else if (data.checked === false) {
      updateData.checkedAt = null;
      updateData.checkedBy = null;
    }

    await checklistItem.update(updateData, { transaction });

    // Recarregar o item com relações
    const updatedItem = await KanbanChecklistItem.findByPk(itemId, {
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'checkedByUser',
          attributes: ['id', 'name', 'email']
        }
      ],
      transaction
    });

    return updatedItem;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error updating checklist item:', error);
    throw new AppError('Error updating checklist item');
  }
};

const deleteChecklistItem = async (itemId: number, companyId: number): Promise<void> => {
  const t = await database.transaction();
  
  try {
    const checklistItem = await KanbanChecklistItem.findOne({
      where: { id: itemId },
      include: [
        {
          model: KanbanCard,
          as: 'card',
          include: [
            {
              model: KanbanLane,
              as: 'lane',
              include: [
                {
                  model: KanbanBoard,
                  as: 'board',
                  where: { companyId }
                }
              ]
            }
          ]
        }
      ]
    });

    if (!checklistItem) {
      throw new AppError('Checklist item not found or does not belong to company', 404);
    }

    // Obter a posição do item a ser excluído
    const position = checklistItem.position;
    const cardId = checklistItem.cardId;

    // Excluir o item
    await checklistItem.destroy({ transaction: t });

    // Reorganizar as posições dos itens restantes
    await KanbanChecklistItem.update(
      { position: Sequelize.literal('position - 1') },
      {
        where: {
          cardId,
          position: { [Op.gt]: position }
        },
        transaction: t
      }
    );

    await t.commit();
  } catch (error) {
    await t.rollback();
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error deleting checklist item:', error);
    throw new AppError('Error deleting checklist item');
  }
};

const reorderChecklistItems = async (
  cardId: number,
  companyId: number,
  items: { id: number; position: number }[]
): Promise<void> => {
  const t = await database.transaction();
  
  try {
    // Verificar se o card existe e pertence à empresa
    const card = await KanbanCard.findOne({
      where: { id: cardId },
      include: [
        {
          model: KanbanLane,
          as: 'lane',
          include: [
            {
              model: KanbanBoard,
              as: 'board',
              where: { companyId }
            }
          ]
        }
      ]
    });

    if (!card) {
      throw new AppError('Card not found or does not belong to company', 404);
    }

    // Verificar se todos os itens pertencem ao card
    const existingItems = await KanbanChecklistItem.findAll({
      where: {
        cardId,
        id: items.map(i => i.id)
      }
    });

    if (existingItems.length !== items.length) {
      throw new AppError('One or more checklist items do not belong to the specified card', 400);
    }

    // Atualizar as posições
    for (const item of items) {
      await KanbanChecklistItem.update(
        { position: item.position },
        {
          where: { id: item.id },
          transaction: t
        }
      );
    }

    await t.commit();
  } catch (error) {
    await t.rollback();
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error reordering checklist items:', error);
    throw new AppError('Error reordering checklist items');
  }
};

export default {
  createTemplate,
  findTemplateById,
  findTemplates,
  updateTemplate,
  deleteTemplate,
  applyTemplateToCard,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  reorderChecklistItems
};