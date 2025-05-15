'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Schedules', 'recurrenceType', {
      type: Sequelize.ENUM('none', 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semiannually', 'yearly'),
      defaultValue: 'none',
      allowNull: false
    });

    await queryInterface.addColumn('Schedules', 'recurrenceEndDate', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Schedules', 'recurrenceType');
    await queryInterface.removeColumn('Schedules', 'recurrenceEndDate');
  }
};