import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableDesc = await queryInterface.describeTable("Contacts");

    if (!tableDesc["employerId"]) {
      await queryInterface.addColumn("Contacts", "employerId", {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "ContactEmployers", // Nome da tabela referenciada
          key: "id", // Chave primária da tabela referenciada
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    }

    if (!tableDesc["position"]) {
      await queryInterface.addColumn("Contacts", "position", {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const tableDesc = await queryInterface.describeTable("Contacts");
    
    if (tableDesc["employerId"]) {
      await queryInterface.removeColumn("Contacts", "employerId");
    }
    
    if (tableDesc["position"]) {
      await queryInterface.removeColumn("Contacts", "position");
    }
  },
};