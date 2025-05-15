'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SwitchFlowNodes', {
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
      targetFlowId: {
        type: Sequelize.INTEGER,
        references: { model: 'FlowBuilders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true
      },
      transferVariables: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
    await queryInterface.addIndex('SwitchFlowNodes', ['flowId']);
    await queryInterface.addIndex('SwitchFlowNodes', ['companyId']);
    await queryInterface.addIndex('SwitchFlowNodes', ['nodeId']);
    await queryInterface.addIndex('SwitchFlowNodes', ['targetFlowId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SwitchFlowNodes');
  }
};