// migrations/[timestamp]-update-invoices-table.ts
module.exports = {
    up: async (queryInterface, Sequelize) => {
      // Adiciona a coluna updatedBy
      await queryInterface.addColumn("Invoices", "updatedBy", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      });
  
      // Adiciona a coluna contactId
      await queryInterface.addColumn("Invoices", "contactId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Contacts",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      });
  
      // Adiciona índices para melhor performance
      await queryInterface.addIndex("Invoices", ["updatedBy"]);
      await queryInterface.addIndex("Invoices", ["contactId"]);
    },
  
    down: async (queryInterface, Sequelize) => {
      // Remove os índices
      await queryInterface.removeIndex("Invoices", ["updatedBy"]);
      await queryInterface.removeIndex("Invoices", ["contactId"]);
  
      // Remove as colunas
      await queryInterface.removeColumn("Invoices", "updatedBy");
      await queryInterface.removeColumn("Invoices", "contactId");
    }
  };