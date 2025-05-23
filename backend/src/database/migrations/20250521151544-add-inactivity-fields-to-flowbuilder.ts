module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("FlowBuilders", "generalInactivityTimeout", {
      type: Sequelize.INTEGER,
      defaultValue: 300,
      allowNull: false
    });
    
    await queryInterface.addColumn("FlowBuilders", "questionInactivityTimeout", {
      type: Sequelize.INTEGER,
      defaultValue: 180,
      allowNull: false
    });
    
    await queryInterface.addColumn("FlowBuilders", "menuInactivityTimeout", {
      type: Sequelize.INTEGER,
      defaultValue: 180,
      allowNull: false
    });
    
    await queryInterface.addColumn("FlowBuilders", "inactivityAction", {
      type: Sequelize.STRING,
      defaultValue: 'warning',
      allowNull: false
    });
    
    await queryInterface.addColumn("FlowBuilders", "inactivityWarningMessage", {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn("FlowBuilders", "inactivityEndMessage", {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn("FlowBuilders", "inactivityTransferQueueId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "Queues", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
    
    await queryInterface.addColumn("FlowBuilders", "maxInactivityWarnings", {
      type: Sequelize.INTEGER,
      defaultValue: 2,
      allowNull: false
    });
    
    await queryInterface.addColumn("FlowBuilders", "warningInterval", {
      type: Sequelize.INTEGER,
      defaultValue: 60,
      allowNull: false
    });
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("FlowBuilders", "generalInactivityTimeout");
    await queryInterface.removeColumn("FlowBuilders", "questionInactivityTimeout");
    await queryInterface.removeColumn("FlowBuilders", "menuInactivityTimeout");
    await queryInterface.removeColumn("FlowBuilders", "inactivityAction");
    await queryInterface.removeColumn("FlowBuilders", "inactivityWarningMessage");
    await queryInterface.removeColumn("FlowBuilders", "inactivityEndMessage");
    await queryInterface.removeColumn("FlowBuilders", "inactivityTransferQueueId");
    await queryInterface.removeColumn("FlowBuilders", "maxInactivityWarnings");
    await queryInterface.removeColumn("FlowBuilders", "warningInterval");
  }
};