// migrations/YYYYMMDDHHMMSS-enhance-assistant-models.js
module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('Assistants', 'queueId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Queues',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
  
      await queryInterface.addColumn('Assistants', 'tools', {
        type: Sequelize.JSONB,
        allowNull: true
      });
  
      await queryInterface.addColumn('Assistants', 'toolResources', {
        type: Sequelize.JSONB,
        allowNull: true
      });
  
      await queryInterface.addColumn('Assistants', 'active', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      });
  
      await queryInterface.addColumn('Assistants', 'lastSyncAt', {
        type: Sequelize.DATE,
        allowNull: true
      });
  
      await queryInterface.createTable('AssistantFiles', {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4
        },
        fileId: {
          type: Sequelize.STRING,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        type: {
          type: Sequelize.STRING,
          allowNull: false
        },
        purpose: {
          type: Sequelize.STRING,
          allowNull: false
        },
        toolType: {
          type: Sequelize.STRING,
          allowNull: true
        },
        size: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        assistantId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'Assistants',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
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
    },
  
    down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('Assistants', 'queueId');
      await queryInterface.removeColumn('Assistants', 'tools');
      await queryInterface.removeColumn('Assistants', 'toolResources');
      await queryInterface.removeColumn('Assistants', 'active');
      await queryInterface.removeColumn('Assistants', 'lastSyncAt');
      await queryInterface.dropTable('AssistantFiles');
    }
  };