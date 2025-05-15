import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableDefinition = await queryInterface.describeTable("Groups");

    if (!tableDefinition["participantsJson"]) {
      await queryInterface.addColumn("Groups", "participantsJson", {
        type: DataTypes.JSONB,
        defaultValue: [],
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const tableDefinition = await queryInterface.describeTable("Groups");

    if (tableDefinition["participantsJson"]) {
      await queryInterface.removeColumn("Groups", "participantsJson");
    }
  },
};
