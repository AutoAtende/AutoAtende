'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Plans', 'useOpenAIAssistants', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      }),
      queryInterface.addColumn('Plans', 'useFlowBuilder', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      }),
      queryInterface.addColumn('Plans', 'useAPIOfficial', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      }),
      queryInterface.addColumn('Plans', 'useChatBotRules', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      }),
      queryInterface.addColumn('Plans', 'storageLimit', {
        type: Sequelize.INTEGER,
        defaultValue: 500,
        allowNull: false
      }),
      queryInterface.addColumn('Plans', 'openAIAssistantsContentLimit', {
        type: Sequelize.INTEGER,
        defaultValue: 100,
        allowNull: false
      })
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Plans', 'useOpenAIAssistants'),
      queryInterface.removeColumn('Plans', 'useFlowBuilder'),
      queryInterface.removeColumn('Plans', 'useAPIOfficial'),
      queryInterface.removeColumn('Plans', 'useChatBotRules'),
      queryInterface.removeColumn('Plans', 'storageLimit'),
      queryInterface.removeColumn('Plans', 'openAIAssistantsContentLimit')
    ]);
  }
};