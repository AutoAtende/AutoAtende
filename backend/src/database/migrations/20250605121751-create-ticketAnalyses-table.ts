'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TicketAnalyses', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      assistantId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Assistants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      frequentQuestions: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      analysisMetrics: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      filterCriteria: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      generatedInstructions: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isApplied: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      appliedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE(6),
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(6)')
      },
      updatedAt: {
        type: Sequelize.DATE(6),
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(6)')
      }
    });

    // Criar índices para melhor performance
    await queryInterface.addIndex('TicketAnalyses', ['companyId'], {
      name: 'idx_ticket_analyses_company_id'
    });

    await queryInterface.addIndex('TicketAnalyses', ['assistantId'], {
      name: 'idx_ticket_analyses_assistant_id'
    });

    await queryInterface.addIndex('TicketAnalyses', ['status'], {
      name: 'idx_ticket_analyses_status'
    });

    await queryInterface.addIndex('TicketAnalyses', ['createdAt'], {
      name: 'idx_ticket_analyses_created_at'
    });

    await queryInterface.addIndex('TicketAnalyses', ['companyId', 'status'], {
      name: 'idx_ticket_analyses_company_status'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remover índices
    await queryInterface.removeIndex('TicketAnalyses', 'idx_ticket_analyses_company_id');
    await queryInterface.removeIndex('TicketAnalyses', 'idx_ticket_analyses_assistant_id');
    await queryInterface.removeIndex('TicketAnalyses', 'idx_ticket_analyses_status');
    await queryInterface.removeIndex('TicketAnalyses', 'idx_ticket_analyses_created_at');
    await queryInterface.removeIndex('TicketAnalyses', 'idx_ticket_analyses_company_status');

    // Remover ENUM primeiro
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_TicketAnalyses_status";');

    // Remover tabela
    await queryInterface.dropTable('TicketAnalyses');
  }
};