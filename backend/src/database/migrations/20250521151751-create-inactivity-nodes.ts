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
  