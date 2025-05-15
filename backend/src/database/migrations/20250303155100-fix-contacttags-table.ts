'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.showAllTables().then(tables =>
      tables.map(t => t.toLowerCase()).includes('contacttags')
    );

    if (tableExists) {
      await queryInterface.sequelize.query(`
        CREATE TABLE "ContactTags_temp" (
          "contactId" INTEGER NOT NULL,
          "tagId" INTEGER NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await queryInterface.sequelize.query(`
        INSERT INTO "ContactTags_temp" ("contactId", "tagId", "createdAt", "updatedAt")
        SELECT "contactId", "tagId", "createdAt", "updatedAt" FROM "ContactTags";
      `);

      await queryInterface.dropTable('ContactTags');
    }

    await queryInterface.createTable('ContactTags', {
      contactId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Contacts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        primaryKey: true,
      },
      tagId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Tags', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        primaryKey: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('ContactTags', ['contactId', 'tagId'], {
      unique: true,
      name: 'contact_tags_unique',
    });

    if (tableExists) {
      await queryInterface.sequelize.query(`
        INSERT INTO "ContactTags" ("contactId", "tagId", "createdAt", "updatedAt")
        SELECT "contactId", "tagId", "createdAt", "updatedAt"
        FROM "ContactTags_temp";
      `);

      await queryInterface.dropTable('ContactTags_temp');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.showAllTables().then(tables =>
      tables.map(t => t.toLowerCase()).includes('contacttags')
    );

    if (tableExists) {
      await queryInterface.sequelize.query(`
        CREATE TABLE "ContactTags_temp" (
          "contactId" INTEGER NOT NULL,
          "tagId" INTEGER NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await queryInterface.sequelize.query(`
        INSERT INTO "ContactTags_temp" ("contactId", "tagId", "createdAt", "updatedAt")
        SELECT "contactId", "tagId", "createdAt", "updatedAt" FROM "ContactTags";
      `);

      await queryInterface.dropTable('ContactTags');
    }

    await queryInterface.createTable('ContactTags', {
      contactId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Contacts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        primaryKey: true,
      },
      tagId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Tags', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        primaryKey: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    if (tableExists) {
      await queryInterface.sequelize.query(`
        INSERT INTO "ContactTags" ("contactId", "tagId", "createdAt", "updatedAt")
        SELECT "contactId", "tagId", "createdAt", "updatedAt"
        FROM "ContactTags_temp";
      `);

      await queryInterface.dropTable('ContactTags_temp');
    }
  },
};
