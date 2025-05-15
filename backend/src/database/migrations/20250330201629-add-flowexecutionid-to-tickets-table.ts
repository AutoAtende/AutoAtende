'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Tickets', 'flowExecutionId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'FlowBuilderExecutions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Tickets', 'flowExecutionId');
  }
};