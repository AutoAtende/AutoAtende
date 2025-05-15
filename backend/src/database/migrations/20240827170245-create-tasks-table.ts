'use strict';

interface ColumnDefinition {
  type: string;
  allowNull: boolean;
  defaultValue?: any;
  primaryKey?: boolean;
  autoIncrement?: boolean;
  references?: { model: string; key: string };
  onDelete?: string;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = 'Tasks';
    const tableDefinition: Record<string, ColumnDefinition> = {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      color: {
        type: Sequelize.STRING,
        allowNull: true
      },
      done: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Companies', key: 'id' },
        onDelete: 'CASCADE'
      },
      taskCategoryId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'TaskCategories', key: 'id' },
        onDelete: 'SET NULL'
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onDelete: 'SET NULL'
      },
      responsibleUserId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
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
    };

    try {
      const tableExists = await queryInterface.describeTable(tableName).then(() => true).catch(() => false);

      if (tableExists) {
        // Se a tabela existir, vamos atualizar as colunas existentes
        const existingColumns = await queryInterface.describeTable(tableName);
        
        for (const [columnName, columnDefinition] of Object.entries(tableDefinition)) {
          if (!existingColumns[columnName]) {
            // Adiciona apenas colunas que não existem
            await queryInterface.addColumn(tableName, columnName, columnDefinition);
          } else if (columnName !== 'id') {
            // Atualiza colunas existentes, exceto o ID
            await queryInterface.changeColumn(tableName, columnName, columnDefinition);
          }
        }
      } else {
        // Cria a tabela se não existir
        await queryInterface.createTable(tableName, tableDefinition);
      }
    } catch (error) {
      console.error('Erro na migração:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Tasks');
  }
};