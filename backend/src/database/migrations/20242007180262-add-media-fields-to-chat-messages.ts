module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('Starting migration: Adding new columns to "ChatMessages".');
    
    try {
      // Adding "messageType" column
      const tableDescription = await queryInterface.describeTable('ChatMessages');
      if (!tableDescription['messageType']) {
        console.log('Column "messageType" does not exist. Proceeding to add it.');
        await queryInterface.addColumn('ChatMessages', 'messageType', {
          type: Sequelize.STRING,
          defaultValue: 'text',
          allowNull: false
        });
        console.log('Column "messageType" added successfully.');
      } else {
        console.log('Column "messageType" already exists. Skipping addition.');
      }

      // Adding "mediaDuration" column
      if (!tableDescription['mediaDuration']) {
        console.log('Column "mediaDuration" does not exist. Proceeding to add it.');
        await queryInterface.addColumn('ChatMessages', 'mediaDuration', {
          type: Sequelize.INTEGER,
          defaultValue: 0
        });
        console.log('Column "mediaDuration" added successfully.');
      } else {
        console.log('Column "mediaDuration" already exists. Skipping addition.');
      }

      // Adding "mediaSize" column
      if (!tableDescription['mediaSize']) {
        console.log('Column "mediaSize" does not exist. Proceeding to add it.');
        await queryInterface.addColumn('ChatMessages', 'mediaSize', {
          type: Sequelize.INTEGER,
          defaultValue: null
        });
        console.log('Column "mediaSize" added successfully.');
      } else {
        console.log('Column "mediaSize" already exists. Skipping addition.');
      }

    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface) => {
    console.log('Starting rollback: Removing columns from "ChatMessages".');
    try {
      // Removing "messageType" column
      await queryInterface.removeColumn('ChatMessages', 'messageType');
      console.log('Column "messageType" removed successfully.');

      // Removing "mediaDuration" column
      await queryInterface.removeColumn('ChatMessages', 'mediaDuration');
      console.log('Column "mediaDuration" removed successfully.');

      // Removing "mediaSize" column
      await queryInterface.removeColumn('ChatMessages', 'mediaSize');
      console.log('Column "mediaSize" removed successfully.');

    } catch (error) {
      console.error('Rollback failed:', error);
      throw error;
    }
  }
};
