'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Horarios', 'isHoliday');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Horarios', 'isHoliday', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
  }
};