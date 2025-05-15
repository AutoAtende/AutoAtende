// migrations/XXXXXX-create-baileys-groups.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('BaileysGroups', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      groupId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      participantId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      participantNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      isAdmin: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      isSuperAdmin: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      contactId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Contacts',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        allowNull: true,
      },
      whatsappId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Whatsapps',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        allowNull: true,
      },
      serializedData: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      lastFetch: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Adicionar índices para campos de busca frequentes
    await queryInterface.addIndex('BaileysGroups', ['groupId']);
    await queryInterface.addIndex('BaileysGroups', ['participantId']);
    await queryInterface.addIndex('BaileysGroups', ['contactId']);
    await queryInterface.addIndex('BaileysGroups', ['whatsappId']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('BaileysGroups');
  },
};