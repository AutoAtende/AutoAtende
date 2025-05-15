'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('EmployerPasswords', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.changeColumn('EmployerPasswords', 'application', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('EmployerPasswords', 'url', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('EmployerPasswords', 'tag', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('EmployerPasswords', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false
    });

    await queryInterface.changeColumn('EmployerPasswords', 'application', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('EmployerPasswords', 'url', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('EmployerPasswords', 'tag', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
};
