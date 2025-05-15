// migrations/YYYYMMDDHHMMSS-add-horario-group-id-to-schedule-node.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ScheduleNodes', 'horarioGroupId', {
      type: Sequelize.INTEGER,
      references: { model: 'HorarioGroups', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true
    });

    // Índice para melhorar a performance
    await queryInterface.addIndex('ScheduleNodes', ['horarioGroupId']);
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('ScheduleNodes', 'horarioGroupId');
  }
};