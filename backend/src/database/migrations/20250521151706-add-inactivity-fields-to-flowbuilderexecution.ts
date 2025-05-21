module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn("FlowBuilderExecutions", "lastInteractionAt", {
        type: Sequelize.DATE,
        allowNull: true
      });
      
      await queryInterface.addColumn("FlowBuilderExecutions", "inactivityWarningsSent", {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      });
      
      await queryInterface.addColumn("FlowBuilderExecutions", "inactivityStatus", {
        type: Sequelize.STRING,
        defaultValue: 'active',
        allowNull: false
      });
      
      await queryInterface.addColumn("FlowBuilderExecutions", "lastWarningAt", {
        type: Sequelize.DATE,
        allowNull: true
      });
      
      await queryInterface.addColumn("FlowBuilderExecutions", "inactivityReason", {
        type: Sequelize.TEXT,
        allowNull: true
      });
      
      await queryInterface.addColumn("FlowBuilderExecutions", "transferredToQueueId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "Queues", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      });
      
      // Atualizar a coluna de status para aceitar o novo valor "inactive"
      await queryInterface.changeColumn("FlowBuilderExecutions", "status", {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "active"
      });
    },
    
    down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn("FlowBuilderExecutions", "lastInteractionAt");
      await queryInterface.removeColumn("FlowBuilderExecutions", "inactivityWarningsSent");
      await queryInterface.removeColumn("FlowBuilderExecutions", "inactivityStatus");
      await queryInterface.removeColumn("FlowBuilderExecutions", "lastWarningAt");
      await queryInterface.removeColumn("FlowBuilderExecutions", "inactivityReason");
      await queryInterface.removeColumn("FlowBuilderExecutions", "transferredToQueueId");
      
      // Restaurar a coluna de status para o formato original
      await queryInterface.changeColumn("FlowBuilderExecutions", "status", {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "active"
      });
    }
  };