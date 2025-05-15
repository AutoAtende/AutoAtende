import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    console.log('Starting migration: Adding column "hasAttachments" to "Emails".');
      const tableInfo = await queryInterface.describeTable('Emails');
      const columns = Object.keys(tableInfo);

      if (!columns.includes('hasAttachments')) {
        console.log('Column "hasAttachments" does not exist. Proceeding to add it.');
        await queryInterface.addColumn('Emails', 'hasAttachments', {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        });

        console.log('Column "hasAttachments" added successfully.');

        // Atualiza registros existentes
        console.log('Updating existing records where "hasAttachments" is NULL.');
        await queryInterface.sequelize.query(`
          UPDATE "Emails"
          SET "hasAttachments" = false
          WHERE "hasAttachments" IS NULL
        `);
        console.log('Existing records updated successfully.');
      } else {
        console.log('Column "hasAttachments" already exists. Skipping addition.');
      }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    console.log('Starting rollback: Removing column "hasAttachments" from "Emails".');
      const tableInfo = await queryInterface.describeTable('Emails');
      const columns = Object.keys(tableInfo);

      if (columns.includes('hasAttachments')) {
        console.log('Column "hasAttachments" exists. Proceeding to remove it.');
        await queryInterface.removeColumn('Emails', 'hasAttachments');
        console.log('Column "hasAttachments" removed successfully.');
      } else {
        console.log('Column "hasAttachments" does not exist. Skipping removal.');
      }
  }
};
