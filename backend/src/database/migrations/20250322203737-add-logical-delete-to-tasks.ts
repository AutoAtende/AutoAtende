// Nova migração: add-logical-delete-to-tasks.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Tasks', 'deleted', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('Tasks', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('Tasks', 'deletedBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    });

    // Adicionar índice para melhorar performance de consultas
    await queryInterface.addIndex('Tasks', ['deleted']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Tasks', ['deleted']);
    await queryInterface.removeColumn('Tasks', 'deletedBy');
    await queryInterface.removeColumn('Tasks', 'deletedAt');
    await queryInterface.removeColumn('Tasks', 'deleted');
  }
};