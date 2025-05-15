'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('EmployerPasswords', 'username', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('EmployerPasswords', 'notes', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('EmployerPasswords', 'username');
    await queryInterface.removeColumn('EmployerPasswords', 'notes');
  }
};