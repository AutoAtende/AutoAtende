import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    console.log('Starting migration: Adding column "sku" to "Tickets".');
    const tableDescription = await queryInterface.describeTable("Tickets");

    if (!tableDescription["sku"]) {
      console.log('Column "sku" does not exist. Proceeding to add it.');
      await queryInterface.addColumn("Tickets", "sku", {
        type: DataTypes.STRING(30),
        allowNull: true
      });
      console.log('Column "sku" added successfully.');
    } else {
      console.log('Column "sku" already exists. Skipping addition.');
    }
  },

  down: async (queryInterface: QueryInterface) => {
    console.log('Starting rollback: Removing column "sku" from "Tickets".');
    const tableDescription = await queryInterface.describeTable("Tickets");

    if (tableDescription["sku"]) {
      console.log('Column "sku" exists. Proceeding to remove it.');
      await queryInterface.removeColumn("Tickets", "sku");
      console.log('Column "sku" removed successfully.');
    } else {
      console.log('Column "sku" does not exist. Skipping removal.');
    }
  }
};
