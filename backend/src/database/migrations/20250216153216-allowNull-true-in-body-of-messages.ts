import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.changeColumn("Messages", "body", {
      type: DataTypes.TEXT,
      allowNull: true // Agora permitindo valores null
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.changeColumn("Messages", "body", {
      type: DataTypes.TEXT,
      allowNull: false // Revertendo para não permitir valores null
    });
  }
};