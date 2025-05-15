'use strict';

import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Verificar e adicionar colunas na tabela "Tags"
    const tagsTableDefinition = await queryInterface.describeTable("Tags");

    if (!tagsTableDefinition["msgR"]) {
      await queryInterface.addColumn("Tags", "msgR", {
        type: DataTypes.TEXT,
        allowNull: true,
      });
    }

    if (!tagsTableDefinition["rptDays"]) {
      await queryInterface.addColumn("Tags", "rptDays", {
        allowNull: true,
        type: DataTypes.INTEGER,
      });
    }

    if (!tagsTableDefinition["actCamp"]) {
      await queryInterface.addColumn("Tags", "actCamp", {
        allowNull: true,
        type: DataTypes.INTEGER,
      });
    }

    // Verificar e adicionar colunas na tabela "Schedules"
    const schedulesTableDefinition = await queryInterface.describeTable("Schedules");

    if (!schedulesTableDefinition["daysR"]) {
      await queryInterface.addColumn("Schedules", "daysR", {
        type: DataTypes.INTEGER,
        allowNull: true,
      });
    }

    if (!schedulesTableDefinition["campId"]) {
      await queryInterface.addColumn("Schedules", "campId", {
        allowNull: true,
        type: DataTypes.INTEGER,
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    // Remover as colunas adicionadas na tabela "Tags"
    const tagsTableDefinition = await queryInterface.describeTable("Tags");

    if (tagsTableDefinition["msgR"]) {
      await queryInterface.removeColumn("Tags", "msgR");
    }

    if (tagsTableDefinition["rptDays"]) {
      await queryInterface.removeColumn("Tags", "rptDays");
    }

    if (tagsTableDefinition["actCamp"]) {
      await queryInterface.removeColumn("Tags", "actCamp");
    }

    // Remover as colunas adicionadas na tabela "Schedules"
    const schedulesTableDefinition = await queryInterface.describeTable("Schedules");

    if (schedulesTableDefinition["daysR"]) {
      await queryInterface.removeColumn("Schedules", "daysR");
    }

    if (schedulesTableDefinition["campId"]) {
      await queryInterface.removeColumn("Schedules", "campId");
    }
  }
};
