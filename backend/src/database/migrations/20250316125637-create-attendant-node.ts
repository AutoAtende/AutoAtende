'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('AttendantNodes', {
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
      assignmentType: {
        type: Sequelize.STRING,
        defaultValue: 'manual'
      },
      timeoutSeconds: {
        type: Sequelize.INTEGER,
        defaultValue: 300 // 5 minutos por padrão
      },
      endFlowFlag: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      assignedUserId: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true
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
    await queryInterface.addIndex('AttendantNodes', ['flowId']);
    await queryInterface.addIndex('AttendantNodes', ['companyId']);
    await queryInterface.addIndex('AttendantNodes', ['nodeId']);
    await queryInterface.addIndex('AttendantNodes', ['assignedUserId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('AttendantNodes');
  }
};