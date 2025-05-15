'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('WebhookNodes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nodeId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      label: {
        type: Sequelize.STRING
      },
      url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      method: {
        type: Sequelize.STRING,
        defaultValue: 'GET'
      },
      headers: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      body: {
        type: Sequelize.JSONB
      },
      timeout: {
        type: Sequelize.INTEGER,
        defaultValue: 10000 // 10 segundos por padrão
      },
      retries: {
        type: Sequelize.INTEGER,
        defaultValue: 3
      },
      secretKey: {
        type: Sequelize.STRING
      },
      variableName: {
        type: Sequelize.STRING
      },
      flowId: {
        type: Sequelize.INTEGER,
        references: { model: 'FlowBuilders', key: 'id' },
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
    await queryInterface.addIndex('WebhookNodes', ['flowId']);
    await queryInterface.addIndex('WebhookNodes', ['companyId']);
    await queryInterface.addIndex('WebhookNodes', ['nodeId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('WebhookNodes');
  }
};