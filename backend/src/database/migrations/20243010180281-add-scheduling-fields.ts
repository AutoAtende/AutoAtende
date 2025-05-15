import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Adicionando colunas novas, se elas não existirem
    await queryInterface.describeTable("Schedules").then(async (tableDefinition) => {
      if (!tableDefinition["title"]) {
        await queryInterface.addColumn("Schedules", "title", {
          type: DataTypes.STRING,
          allowNull: true,
        });
      }

      if (!tableDefinition["description"]) {
        await queryInterface.addColumn("Schedules", "description", {
          type: DataTypes.TEXT,
          allowNull: true,
        });
      }

      if (!tableDefinition["recurrence"]) {
        await queryInterface.addColumn("Schedules", "recurrence", {
          type: DataTypes.JSONB,
          allowNull: true,
          defaultValue: null,
        });
      }

      if (!tableDefinition["tags"]) {
        await queryInterface.addColumn("Schedules", "tags", {
          type: DataTypes.JSONB,
          allowNull: true,
          defaultValue: null,
        });
      }

      if (!tableDefinition["currentContacts"]) {
        await queryInterface.addColumn("Schedules", "currentContacts", {
          type: DataTypes.JSONB,
          allowNull: true,
          defaultValue: null,
        });
      }

      if (!tableDefinition["attachments"]) {
        await queryInterface.addColumn("Schedules", "attachments", {
          type: DataTypes.JSONB,
          allowNull: true,
          defaultValue: null,
        });
      }

      if (!tableDefinition["duration"]) {
        await queryInterface.addColumn("Schedules", "duration", {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 30,
        });
      }

      if (!tableDefinition["daysR"]) {
        await queryInterface.addColumn("Schedules", "daysR", {
          type: DataTypes.INTEGER,
          allowNull: true,
        });
      }

      if (!tableDefinition["campId"]) {
        await queryInterface.addColumn("Schedules", "campId", {
          type: DataTypes.INTEGER,
          allowNull: true,
        });
      }

    });

  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Schedules", "title");
    await queryInterface.removeColumn("Schedules", "description");
    await queryInterface.removeColumn("Schedules", "recurrence");
    await queryInterface.removeColumn("Schedules", "tags");
    await queryInterface.removeColumn("Schedules", "currentContacts");
    await queryInterface.removeColumn("Schedules", "attachments");
    await queryInterface.removeColumn("Schedules", "duration");
    await queryInterface.removeColumn("Schedules", "daysR");
    await queryInterface.removeColumn("Schedules", "campId");    
  }
};
