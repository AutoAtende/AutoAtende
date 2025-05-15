'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('FlowBuilderExecutions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      flowId: {
        type: Sequelize.INTEGER,
        references: { model: 'FlowBuilders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      contactId: {
        type: Sequelize.INTEGER,
        references: { model: 'Contacts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      companyId: {
        type: Sequelize.INTEGER,
        references: { model: 'Companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      currentNodeId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      variables: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'active',
        // Valores possíveis: active, completed, error, paused
      },
      errorMessage: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Adicionar índices para melhorar a performance
    await queryInterface.addIndex('FlowBuilderExecutions', ['flowId']);
    await queryInterface.addIndex('FlowBuilderExecutions', ['contactId']);
    await queryInterface.addIndex('FlowBuilderExecutions', ['companyId']);
    await queryInterface.addIndex('FlowBuilderExecutions', ['status']);
    
    // Índice composto para encontrar execuções ativas por contato
    await queryInterface.addIndex('FlowBuilderExecutions', ['contactId', 'status'], {
      name: 'idx_flow_executions_contact_status'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('FlowBuilderExecutions');
  }
};