import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableDefinition = await queryInterface.describeTable("Groups");
    
    if (!tableDefinition["companyId"]) {
      await queryInterface.addColumn("Groups", "companyId", {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const tableDefinition = await queryInterface.describeTable("Groups");
    
    if (tableDefinition["companyId"]) {
      await queryInterface.removeColumn("Groups", "companyId");
    }
  }
};
