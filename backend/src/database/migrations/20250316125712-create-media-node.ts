'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('MediaNodes', {
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
      mediaType: {
        type: Sequelize.STRING, // 'image', 'audio', 'video', 'file'
        allowNull: false
      },
      mediaUrl: {
        type: Sequelize.TEXT
      },
      caption: {
        type: Sequelize.TEXT
      },
      allowedFormats: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      maxFileSize: {
        type: Sequelize.INTEGER,
        defaultValue: 10485760 // 10MB por padrão
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
    await queryInterface.addIndex('MediaNodes', ['flowId']);
    await queryInterface.addIndex('MediaNodes', ['companyId']);
    await queryInterface.addIndex('MediaNodes', ['nodeId']);
    await queryInterface.addIndex('MediaNodes', ['mediaType']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('MediaNodes');
  }
};