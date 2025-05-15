import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('Messages');
    if (!tableDescription['reactions']) {
      await queryInterface.addColumn('Messages', 'reactions', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('Messages');
    if (tableDescription['reactions']) {
      await queryInterface.removeColumn('Messages', 'reactions');
    }
  }
};
