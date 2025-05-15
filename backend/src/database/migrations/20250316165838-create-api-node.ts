// migrations/YYYYMMDDHHMMSS-create-api-nodes.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ApiNodes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      nodeId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      companyId: {
        type: Sequelize.INTEGER,
        references: { model: 'Companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      method: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'GET'
      },
      headers: {
        type: Sequelize.JSON,
        defaultValue: {}
      },
      queryParams: {
        type: Sequelize.JSON,
        defaultValue: {}
      },
      body: {
        type: Sequelize.TEXT
      },
      contentType: {
        type: Sequelize.STRING,
        defaultValue: 'application/json'
      },
      timeout: {
        type: Sequelize.INTEGER,
        defaultValue: 10000
      },
      retries: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      responseVariable: {
        type: Sequelize.STRING
      },
      statusVariable: {
        type: Sequelize.STRING
      },
      successCondition: {
        type: Sequelize.STRING,
        defaultValue: 'statusCode'
      },
      successExpression: {
        type: Sequelize.TEXT
      },
      useResponseFilter: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      responseFilterPath: {
        type: Sequelize.STRING
      },
      parseVariables: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      paramsFromVariables: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      paramsVariable: {
        type: Sequelize.STRING
      },
      storeErrorResponse: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      authType: {
        type: Sequelize.STRING,
        defaultValue: 'none'
      },
      authUser: {
        type: Sequelize.STRING
      },
      authPassword: {
        type: Sequelize.STRING
      },
      authToken: {
        type: Sequelize.STRING
      },
      apiKeyName: {
        type: Sequelize.STRING
      },
      apiKeyValue: {
        type: Sequelize.STRING
      },
      apiKeyIn: {
        type: Sequelize.STRING,
        defaultValue: 'header'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('ApiNodes');
  }
};