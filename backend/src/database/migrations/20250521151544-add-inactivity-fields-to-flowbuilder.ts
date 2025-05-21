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
  
  // migrations/YYYYMMDDHHMMSS-add-inactivity-fields-to-flowbuilderexecution.js
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
  
  // migrations/YYYYMMDDHHMMSS-create-inactivity-nodes.js
  module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable("InactivityNodes", {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        nodeId: {
          type: Sequelize.STRING,
          allowNull: false
        },
        label: {
          type: Sequelize.STRING,
          allowNull: true
        },
        timeout: {
          type: Sequelize.INTEGER,
          defaultValue: 300,
          allowNull: false
        },
        action: {
          type: Sequelize.STRING,
          defaultValue: 'warning',
          allowNull: false
        },
        warningMessage: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        endMessage: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        transferQueueId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: "Queues", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL"
        },
        maxWarnings: {
          type: Sequelize.INTEGER,
          defaultValue: 2,
          allowNull: false
        },
        warningInterval: {
          type: Sequelize.INTEGER,
          defaultValue: 60,
          allowNull: false
        },
        companyId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "Companies", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE"
        },
        flowId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: "FlowBuilders", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE"
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false
        }
      });
      
      await queryInterface.addIndex("InactivityNodes", ["nodeId", "companyId"], {
        unique: true,
        name: "inactivity_nodes_node_id_company_id_unique"
      });
    },
    
    down: async (queryInterface, Sequelize) => {
      await queryInterface.dropTable("InactivityNodes");
    }
  };
  
  // migrations/YYYYMMDDHHMMSS-add-inactivity-fields-to-tickettrackings.js
  module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn("TicketTraking", "lastInactivityCheckAt", {
        type: Sequelize.DATE,
        allowNull: true
      });
      
      await queryInterface.addColumn("TicketTraking", "inactivityWarningCount", {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      });
    },
    
    down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn("TicketTraking", "lastInactivityCheckAt");
      await queryInterface.removeColumn("TicketTraking", "inactivityWarningCount");
    }
  };