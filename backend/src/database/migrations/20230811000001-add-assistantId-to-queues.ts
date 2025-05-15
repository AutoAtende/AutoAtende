'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Queues', 'assistantId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Assistants',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Queues', 'assistantId');
  }
};