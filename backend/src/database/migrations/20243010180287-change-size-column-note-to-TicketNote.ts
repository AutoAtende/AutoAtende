import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface, Sequelize: typeof DataTypes) => {
    await queryInterface.changeColumn('TicketNotes', 'note', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface: QueryInterface, Sequelize: typeof DataTypes) => {
    await queryInterface.changeColumn('TicketNotes', 'note', {
      type: Sequelize.STRING(255),
      allowNull: true, 
    });
  },
};
