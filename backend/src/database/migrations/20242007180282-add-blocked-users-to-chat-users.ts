module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('Starting migration: Adding new columns to "ChatUsers".');
      // Adding "blockedUsers" column
      const tableDescription = await queryInterface.describeTable('ChatUsers');
      if (!tableDescription['blockedUsers']) {
        console.log('Column "blockedUsers" does not exist. Proceeding to add it.');
        await queryInterface.addColumn('ChatUsers', 'blockedUsers', {
          type: Sequelize.JSON,
          defaultValue: [],
          allowNull: true
        });
        console.log('Column "blockedUsers" added successfully.');
      } else {
        console.log('Column "blockedUsers" already exists. Skipping addition.');
      }

      // Adding "isReported" column
      if (!tableDescription['isReported']) {
        console.log('Column "isReported" does not exist. Proceeding to add it.');
        await queryInterface.addColumn('ChatUsers', 'isReported', {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        });
        console.log('Column "isReported" added successfully.');
      } else {
        console.log('Column "isReported" already exists. Skipping addition.');
      }
  },

  down: async (queryInterface) => {
    console.log('Starting rollback: Removing columns from "ChatUsers".');
      // Removing "blockedUsers" column
      await queryInterface.removeColumn('ChatUsers', 'blockedUsers');
      console.log('Column "blockedUsers" removed successfully.');

      // Removing "isReported" column
      await queryInterface.removeColumn('ChatUsers', 'isReported');
      console.log('Column "isReported" removed successfully.');

  }
};
