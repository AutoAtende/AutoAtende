import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableDefinition = await queryInterface.describeTable("Messages");

    if (!tableDefinition["isForceDeleteConnection"]) {
      await queryInterface.addColumn("Messages", "isForceDeleteConnection", {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const tableDefinition = await queryInterface.describeTable("Messages");

    if (tableDefinition["isForceDeleteConnection"]) {
      await queryInterface.removeColumn("Messages", "isForceDeleteConnection");
    }
  },
};
