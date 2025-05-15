'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Assistants', 'queueId');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Assistants', 'queueId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Queues',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  }
};