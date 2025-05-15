import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    console.log('Starting migration: Adding column "value" to "Tickets".');
    const tableDescription = await queryInterface.describeTable("Tickets");

    if (!tableDescription["value"]) {
      console.log('Column "value" does not exist. Proceeding to add it.');
      await queryInterface.addColumn("Tickets", "value", {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
      });
      console.log('Column "value" added successfully.');
    } else {
      console.log('Column "value" already exists. Skipping addition.');
    }
  },

  down: async (queryInterface: QueryInterface) => {
    console.log('Starting rollback: Removing column "value" from "Tickets".');
    const tableDescription = await queryInterface.describeTable("Tickets");

    if (tableDescription["value"]) {
      console.log('Column "value" exists. Proceeding to remove it.');
      await queryInterface.removeColumn("Tickets", "value");
      console.log('Column "value" removed successfully.');
    } else {
      console.log('Column "value" does not exist. Skipping removal.');
    }
  }
};
