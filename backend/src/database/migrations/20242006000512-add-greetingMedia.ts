'use strict';

import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    console.log('Starting migration: Adding column "greetingMediaAttachment" to "Whatsapps".');
    const tableDescription = await queryInterface.describeTable('Whatsapps');

    if (!tableDescription["greetingMediaAttachment"]) {
      console.log('Column "greetingMediaAttachment" does not exist. Proceeding to add it.');
      await queryInterface.addColumn('Whatsapps', 'greetingMediaAttachment', {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
      });
      console.log('Column "greetingMediaAttachment" added successfully.');
    } else {
      console.log('Column "greetingMediaAttachment" already exists. Skipping addition.');
    }
  },

  down: async (queryInterface: QueryInterface) => {
    console.log('Starting rollback: Removing column "greetingMediaAttachment" from "Whatsapps".');
    const tableDescription = await queryInterface.describeTable('Whatsapps');

    if (tableDescription["greetingMediaAttachment"]) {
      console.log('Column "greetingMediaAttachment" exists. Proceeding to remove it.');
      await queryInterface.removeColumn("Whatsapps", "greetingMediaAttachment");
      console.log('Column "greetingMediaAttachment" removed successfully.');
    } else {
      console.log('Column "greetingMediaAttachment" does not exist. Skipping removal.');
    }
  }
};
