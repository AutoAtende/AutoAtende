'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('VoiceConfigs', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      voiceId: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'nova'
      },
      speed: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 1.0
      },
      transcriptionModel: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'whisper-1'
      },
      enableVoiceResponses: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      enableVoiceTranscription: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      useStreaming: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      additionalSettings: {
        type: Sequelize.JSONB,
        allowNull: true
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

    // Adicionando índice para melhorar a performance de buscas
    await queryInterface.addIndex('VoiceConfigs', ['companyId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('VoiceConfigs');
  }
};