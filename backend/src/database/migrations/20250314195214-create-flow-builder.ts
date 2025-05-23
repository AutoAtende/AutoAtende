'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verifica se a tabela FlowBuilders já existe
    const tableDefinition = await queryInterface.describeTable('FlowBuilders').catch(() => null);

    if (!tableDefinition) {
      // Se não existir, cria a tabela
      await queryInterface.createTable('FlowBuilders', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT
        },
        nodes: {
          type: Sequelize.JSONB,
          defaultValue: []
        },
        edges: {
          type: Sequelize.JSONB,
          defaultValue: []
        },
        active: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        companyId: {
          type: Sequelize.INTEGER,
          references: { model: 'Companies', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          allowNull: false
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      });
    } else {
      // Se a tabela existir, verifica e ajusta cada coluna
      const columnsToAddOrUpdate = [
        { name: 'name', type: Sequelize.STRING, allowNull: false },
        { name: 'description', type: Sequelize.TEXT },
        { name: 'nodes', type: Sequelize.JSONB, defaultValue: [] },
        { name: 'edges', type: Sequelize.JSONB, defaultValue: [] },
        { name: 'active', type: Sequelize.BOOLEAN, defaultValue: false },
        { name: 'companyId', type: Sequelize.INTEGER, references: { model: 'Companies', key: 'id' }, allowNull: false },
        { name: 'createdAt', type: Sequelize.DATE, allowNull: false },
        { name: 'updatedAt', type: Sequelize.DATE, allowNull: false }
      ];

      for (const column of columnsToAddOrUpdate) {
        if (!tableDefinition[column.name]) {
          await queryInterface.addColumn('FlowBuilders', column.name, column);
        } else {
          // Atualizar o tipo da coluna se necessário
          await queryInterface.changeColumn('FlowBuilders', column.name, column);
        }
      }
    }

    // Adicionar índices para melhorar a performance
    await queryInterface.addIndex('FlowBuilders', ['companyId']);
    await queryInterface.addIndex('FlowBuilders', ['active']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('FlowBuilders');
  }
};