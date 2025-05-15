'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('ScheduleNodes', 'useSpecificHorario');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ScheduleNodes', 'useSpecificHorario', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    });
  }
};