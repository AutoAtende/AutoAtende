module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('ScheduleNodes', {
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
        useSpecificHorario: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false
        },
        horarioId: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        flowId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'FlowBuilders',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          allowNull: true
        },
        companyId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'Companies',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          allowNull: false
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
  
      // Criação de índice para melhorar a performance
      await queryInterface.addIndex('ScheduleNodes', ['nodeId', 'companyId']);
      await queryInterface.addIndex('ScheduleNodes', ['horarioId']);
    },
  
    down: async (queryInterface) => {
      await queryInterface.dropTable('ScheduleNodes');
    }
  };