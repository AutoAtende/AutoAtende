import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Invoices", "lastNotificationSent", {
      type: DataTypes.DATE,
      allowNull: true
    });

    await queryInterface.addColumn("Invoices", "notificationCount", {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    });

    // Adicionar índice para melhorar performance das consultas
    await queryInterface.addIndex("Invoices", ["lastNotificationSent", "status"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Invoices", "lastNotificationSent");
    await queryInterface.removeColumn("Invoices", "notificationCount");
    await queryInterface.removeIndex("Invoices", ["lastNotificationSent", "status"]);
  }
};