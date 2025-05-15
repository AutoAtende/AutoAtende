'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verificar se a tabela existe
    const tableExists = await queryInterface.sequelize.query(
      `SELECT to_regclass('public."AttendantNodes"')::TEXT as exists`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const exists = tableExists[0].exists !== null;
    
    if (!exists) {
      // Se a tabela não existir, criar do zero
      await queryInterface.createTable('AttendantNodes', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        nodeId: {
          type: Sequelize.STRING,
          allowNull: true
        },
        assignmentType: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'auto'
        },
        assignedUserId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        queueId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Queues',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        timeoutSeconds: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0
        },
        endFlowFlag: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        companyId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Companies',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
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
      
      // Adicionar índices para melhorar performance
      await queryInterface.addIndex('AttendantNodes', ['nodeId']);
      await queryInterface.addIndex('AttendantNodes', ['companyId']);
      await queryInterface.addIndex('AttendantNodes', ['queueId']);
      await queryInterface.addIndex('AttendantNodes', ['assignedUserId']);
      
      console.log('Tabela AttendantNodes criada com sucesso');
      return;
    } 
    
    // Se a tabela existir, verificar as colunas
    const tableInfo = await queryInterface.describeTable('AttendantNodes');
    
    // Adicionar colunas que não existem
    const requiredColumns = [
      { 
        name: 'nodeId', 
        config: { 
          type: Sequelize.STRING, 
          allowNull: true 
        } 
      },
      { 
        name: 'assignmentType', 
        config: { 
          type: Sequelize.STRING, 
          allowNull: false, 
          defaultValue: 'auto' 
        } 
      },
      { 
        name: 'assignedUserId', 
        config: { 
          type: Sequelize.INTEGER, 
          allowNull: true,
          references: {
            model: 'Users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        } 
      },
      { 
        name: 'queueId', 
        config: { 
          type: Sequelize.INTEGER, 
          allowNull: true,
          references: {
            model: 'Queues',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL' 
        } 
      },
      { 
        name: 'timeoutSeconds', 
        config: { 
          type: Sequelize.INTEGER, 
          allowNull: true,
          defaultValue: 0 
        } 
      },
      { 
        name: 'endFlowFlag', 
        config: { 
          type: Sequelize.BOOLEAN, 
          allowNull: false,
          defaultValue: false 
        } 
      },
      { 
        name: 'companyId', 
        config: { 
          type: Sequelize.INTEGER, 
          allowNull: false,
          references: {
            model: 'Companies',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE' 
        } 
      },
      { 
        name: 'userId', 
        config: { 
          type: Sequelize.INTEGER, 
          allowNull: true,
          references: {
            model: 'Users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL' 
        } 
      }
    ];
    
    for (const column of requiredColumns) {
      if (!tableInfo[column.name]) {
        await queryInterface.addColumn('AttendantNodes', column.name, column.config);
        console.log(`Coluna ${column.name} adicionada à tabela AttendantNodes`);
      }
    }
    
    // Verificar se os índices existem e adicioná-los se necessário
    try {
      await queryInterface.addIndex('AttendantNodes', ['nodeId']);
      await queryInterface.addIndex('AttendantNodes', ['companyId']);
      await queryInterface.addIndex('AttendantNodes', ['queueId']);
      await queryInterface.addIndex('AttendantNodes', ['assignedUserId']);
    } catch (error) {
      console.log('Índices já existem ou ocorreu um erro ao adicioná-los:', error.message);
    }
    
    console.log('Migração da tabela AttendantNodes concluída com sucesso');
  },

  down: async (queryInterface, Sequelize) => {
    // Verificar se a tabela existe
    const tableExists = await queryInterface.sequelize.query(
      `SELECT to_regclass('public."AttendantNodes"')::TEXT as exists`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const exists = tableExists[0].exists !== null;
    
    if (exists) {
      // Remover tabela caso exista
      await queryInterface.dropTable('AttendantNodes');
      console.log('Tabela AttendantNodes removida com sucesso');
    }
  }
};