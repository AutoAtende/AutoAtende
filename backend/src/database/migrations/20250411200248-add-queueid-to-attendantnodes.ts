'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('AttendantNodes', 'queueId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Queues', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('AttendantNodes', 'queueId');
  }
};