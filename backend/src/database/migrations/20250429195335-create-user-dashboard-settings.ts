// migrations/YYYYMMDDHHMMSS-create-user-dashboard-settings.js
module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable("UserDashboardSettings", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        userId: {
          type: Sequelize.INTEGER,
          references: { model: "Users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        settings: {
          type: Sequelize.JSONB,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      });
    },
  
    down: async (queryInterface) => {
      await queryInterface.dropTable("UserDashboardSettings");
    }
  };