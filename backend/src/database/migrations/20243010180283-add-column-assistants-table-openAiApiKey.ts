'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Assistants', 'openaiApiKey', {
      type: Sequelize.TEXT,
      allowNull: false,
      after: 'model'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Assistants', 'openaiApiKey');
  }
};