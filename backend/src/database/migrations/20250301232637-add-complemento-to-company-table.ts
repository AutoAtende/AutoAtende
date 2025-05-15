'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Companies', 'complemento', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'numero'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Companies', 'complemento');
  }
};