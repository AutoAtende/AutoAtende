import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Users", "pushTokens", {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "JSON array of push notification tokens"
    });

    await queryInterface.addColumn("Users", "mobilePreferences", {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "JSON object with mobile app preferences"
    });

    await queryInterface.addColumn("Users", "lastMobileLogin", {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Last login timestamp from mobile app"
    });

    await queryInterface.addColumn("Users", "mobileAppVersion", {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Version of mobile app last used"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Users", "pushTokens");
    await queryInterface.removeColumn("Users", "mobilePreferences");
    await queryInterface.removeColumn("Users", "lastMobileLogin");
    await queryInterface.removeColumn("Users", "mobileAppVersion");
  }
};