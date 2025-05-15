'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('VoiceMessages', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      messageId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      ticketId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Tickets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      transcription: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      audioPath: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      responseAudioPath: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      duration: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      metadata: {
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

    // Adicionando índices para melhorar a performance
    await queryInterface.addIndex('VoiceMessages', ['messageId']);
    await queryInterface.addIndex('VoiceMessages', ['ticketId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('VoiceMessages');
  }
};