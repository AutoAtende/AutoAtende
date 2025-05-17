module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn("Whatsapps", "phoneNumberId", {
        type: Sequelize.TEXT,
        allowNull: true
      });
      
      await queryInterface.addColumn("Whatsapps", "metaBusinessId", {
        type: Sequelize.TEXT,
        allowNull: true
      });
      
      await queryInterface.addColumn("Whatsapps", "metaBusinessAccountId", {
        type: Sequelize.TEXT,
        allowNull: true
      });
      
      await queryInterface.addColumn("Whatsapps", "metaWABAId", {
        type: Sequelize.TEXT,
        allowNull: true
      });
      
      await queryInterface.addColumn("Whatsapps", "metaVerificationToken", {
        type: Sequelize.TEXT,
        allowNull: true
      });
      
      await queryInterface.addColumn("Whatsapps", "isMetaSetupEnabled", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
      
      await queryInterface.addColumn("Whatsapps", "webhookUrl", {
        type: Sequelize.TEXT,
        allowNull: true
      });
    },
  
    down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn("Whatsapps", "phoneNumberId");
      await queryInterface.removeColumn("Whatsapps", "metaBusinessId");
      await queryInterface.removeColumn("Whatsapps", "metaBusinessAccountId");
      await queryInterface.removeColumn("Whatsapps", "metaWABAId");
      await queryInterface.removeColumn("Whatsapps", "metaVerificationToken");
      await queryInterface.removeColumn("Whatsapps", "isMetaSetupEnabled");
      await queryInterface.removeColumn("Whatsapps", "webhookUrl");
    }
  };