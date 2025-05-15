'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDefinition = await queryInterface.describeTable("QuickMessages");

    if (!tableDefinition["mediaType"]) {
      await queryInterface.addColumn("QuickMessages", "mediaType", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDefinition = await queryInterface.describeTable("QuickMessages");

    if (tableDefinition["mediaType"]) {
      await queryInterface.removeColumn("QuickMessages", "mediaType");
    }
  },
};
