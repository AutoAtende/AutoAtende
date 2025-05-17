import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("DashboardSettings", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onDelete: "CASCADE",
        allowNull: false
      },
      defaultDateRange: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 7
      },
      defaultQueue: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'all'
      },
      componentVisibility: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: JSON.stringify({
          messagesCard: true,
          responseTimeCard: true,
          clientsCard: true,
          messagesByDayChart: true,
          messagesByUserChart: true,
          comparativeTable: true,
          prospectionTable: true
        })
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

    // Criar índice para melhorar performance nas consultas por companyId
    await queryInterface.addIndex("DashboardSettings", ["companyId"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("DashboardSettings");
  }
};