import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("DashboardCaches", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      queueId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      data: {
        type: DataTypes.JSON,
        allowNull: false
      },
      isProcessing: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // Adicionar índices para melhorar a performance das consultas
    await queryInterface.addIndex("DashboardCaches", ["companyId", "type"]);
    await queryInterface.addIndex("DashboardCaches", ["companyId", "type", "queueId"]);
    await queryInterface.addIndex("DashboardCaches", ["companyId", "type", "startDate", "endDate"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("DashboardCaches");
  }
};
