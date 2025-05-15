'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Criar tabela TaskSubjects
    await queryInterface.createTable('TaskSubjects', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
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
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Adicionar campos à tabela Tasks
    return Promise.all([
      queryInterface.addColumn('Tasks', 'contactId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Contacts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }),
      queryInterface.addColumn('Tasks', 'subjectId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'TaskSubjects',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }),
      queryInterface.addColumn('Tasks', 'requesterName', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('Tasks', 'requesterEmail', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('Tasks', 'isPrivate', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      })
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remover campos da tabela Tasks
    await Promise.all([
      queryInterface.removeColumn('Tasks', 'contactId'),
      queryInterface.removeColumn('Tasks', 'subjectId'),
      queryInterface.removeColumn('Tasks', 'requesterName'),
      queryInterface.removeColumn('Tasks', 'requesterEmail'),
      queryInterface.removeColumn('Tasks', 'isPrivate')
    ]);

    // Remover tabela TaskSubjects
    return queryInterface.dropTable('TaskSubjects');
  }
};