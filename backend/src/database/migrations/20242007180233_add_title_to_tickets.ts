import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    console.log('Starting migration: Adding column "name" to "Tickets".');
    const tableDescription = await queryInterface.describeTable("Tickets");

    if (!tableDescription["name"]) {
      console.log('Column "name" does not exist. Proceeding to add it.');
      await queryInterface.addColumn("Tickets", "name", {
        type: DataTypes.STRING,
        allowNull: true,
      });
      console.log('Column "name" added successfully.');
    } else {
      console.log('Column "name" already exists. Skipping addition.');
    }
  },

  down: async (queryInterface: QueryInterface) => {
    console.log('Starting rollback: Removing column "name" from "Tickets".');
    const tableDescription = await queryInterface.describeTable("Tickets");

    if (tableDescription["name"]) {
      console.log('Column "name" exists. Proceeding to remove it.');
      await queryInterface.removeColumn("Tickets", "name");
      console.log('Column "name" removed successfully.');
    } else {
      console.log('Column "name" does not exist. Skipping removal.');
    }
  }
};
