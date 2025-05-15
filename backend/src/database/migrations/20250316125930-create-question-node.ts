'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('QuestionNodes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nodeId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      label: {
        type: Sequelize.STRING
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      options: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      inputType: {
        type: Sequelize.STRING,
        defaultValue: 'options'
      },
      variableName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      validationRegex: {
        type: Sequelize.STRING
      },
      errorMessage: {
        type: Sequelize.TEXT
      },
      required: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      flowId: {
        type: Sequelize.INTEGER,
        references: { model: 'FlowBuilders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      companyId: {
        type: Sequelize.INTEGER,
        references: { model: 'Companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Adicionar índices para melhorar a performance
    await queryInterface.addIndex('QuestionNodes', ['flowId']);
    await queryInterface.addIndex('QuestionNodes', ['companyId']);
    await queryInterface.addIndex('QuestionNodes', ['nodeId']);
    await queryInterface.addIndex('QuestionNodes', ['variableName']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('QuestionNodes');
  }
};