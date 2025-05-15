import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableDefinition = await queryInterface.describeTable("Tickets");

    if (!tableDefinition["isForceDeleteConnection"]) {
      await queryInterface.addColumn("Tickets", "isForceDeleteConnection", {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const tableDefinition = await queryInterface.describeTable("Tickets");

    if (tableDefinition["isForceDeleteConnection"]) {
      await queryInterface.removeColumn("Tickets", "isForceDeleteConnection");
    }
  },
};
