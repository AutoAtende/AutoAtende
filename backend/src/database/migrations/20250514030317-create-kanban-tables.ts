// migrations/YYYYMMDD-create-kanban-tables.ts
import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {

    const tables = await queryInterface.showAllTables();

    if (tables.includes('KanbanBoards')) {
        await queryInterface.dropTable('KanbanBoards');
    }

    // 1. Criar tabela KanbanBoards
    await queryInterface.createTable("KanbanBoards", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      color: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      defaultView: {
        type: DataTypes.ENUM('kanban', 'list', 'calendar'),
        allowNull: false,
        defaultValue: 'kanban'
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Companies",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // 2. Criar tabela KanbanLanes
    await queryInterface.createTable("KanbanLanes", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      color: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      icon: {
        type: DataTypes.STRING(30),
        allowNull: true
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      cardLimit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      boardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "KanbanBoards",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      queueId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Queues",
          key: "id"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // 3. Criar tabela KanbanCards
    await queryInterface.createTable("KanbanCards", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      isArchived: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      sku: {
        type: DataTypes.STRING,
        allowNull: true
      },
      laneId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "KanbanLanes",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      assignedUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
      },
      contactId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Contacts",
          key: "id"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
      },
      ticketId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Tickets",
          key: "id"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
      },
      tags: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      startedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      timeInLane: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      isBlocked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      blockReason: {
        type: DataTypes.STRING,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // 4. Criar tabela KanbanChecklistTemplates
    await queryInterface.createTable("KanbanChecklistTemplates", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Companies",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
      },
      itemsTemplate: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // 5. Criar tabela KanbanChecklistItems
    await queryInterface.createTable("KanbanChecklistItems", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false
      },
      checked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      required: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      cardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "KanbanCards",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      templateId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "KanbanChecklistTemplates",
          key: "id"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
      },
      assignedUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
      },
      checkedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      checkedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // 6. Criar tabela KanbanAutomationRules
    await queryInterface.createTable("KanbanAutomationRules", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      triggerType: {
        type: DataTypes.ENUM(
          'time_in_lane',
          'message_content',
          'status_change',
          'checklist_completion',
          'due_date',
          'priority_change',
          'user_assignment'
        ),
        allowNull: false
      },
      triggerConditions: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      actionType: {
        type: DataTypes.ENUM(
          'move_card',
          'assign_user',
          'send_notification',
          'send_whatsapp_message',
          'change_priority',
          'add_tag',
          'remove_tag'
        ),
        allowNull: false
      },
      actionConfig: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Companies",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      boardId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "KanbanBoards",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      laneId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "KanbanLanes",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // 7. Criar tabela KanbanWorkflows
    await queryInterface.createTable("KanbanWorkflows", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      workflowType: {
        type: DataTypes.ENUM('sales', 'support', 'onboarding', 'custom'),
        allowNull: true
      },
      laneSequence: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      validationRules: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Companies",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      boardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "KanbanBoards",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // 8. Criar tabela KanbanMetrics
    await queryInterface.createTable("KanbanMetrics", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      metricType: {
        type: DataTypes.ENUM(
          'time_in_lane',
          'conversion_rate',
          'throughput',
          'user_productivity',
          'lead_time',
          'cycle_time'
        ),
        allowNull: true
      },
      value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      metricData: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Companies",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      boardId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "KanbanBoards",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      laneId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "KanbanLanes",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // Criar índices para melhorar a performance de consultas
    await queryInterface.addIndex("KanbanBoards", ["companyId"]);
    await queryInterface.addIndex("KanbanLanes", ["boardId"]);
    await queryInterface.addIndex("KanbanCards", ["laneId"]);
    await queryInterface.addIndex("KanbanCards", ["assignedUserId"]);
    await queryInterface.addIndex("KanbanCards", ["ticketId"]);
    await queryInterface.addIndex("KanbanChecklistItems", ["cardId"]);
    await queryInterface.addIndex("KanbanAutomationRules", ["companyId", "boardId"]);
    await queryInterface.addIndex("KanbanWorkflows", ["companyId", "boardId"]);
    await queryInterface.addIndex("KanbanMetrics", ["companyId", "boardId", "laneId"]);
  },

  down: async (queryInterface: QueryInterface) => {
    // Remover tabelas na ordem inversa
    await queryInterface.dropTable("KanbanMetrics");
    await queryInterface.dropTable("KanbanWorkflows");
    await queryInterface.dropTable("KanbanAutomationRules");
    await queryInterface.dropTable("KanbanChecklistItems");
    await queryInterface.dropTable("KanbanChecklistTemplates");
    await queryInterface.dropTable("KanbanCards");
    await queryInterface.dropTable("KanbanLanes");
    await queryInterface.dropTable("KanbanBoards");
  }
};