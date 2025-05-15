'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Primeiro remover a restrição de foreign key
    await queryInterface.removeConstraint('Tasks', 'Tasks_contactId_fkey');
    
    // Depois remover a coluna
    return queryInterface.removeColumn('Tasks', 'contactId');
  },

  down: async (queryInterface, Sequelize) => {
    // Adicionar a coluna novamente
    await queryInterface.addColumn('Tasks', 'contactId', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    
    // Adicionar restrição de foreign key
    return queryInterface.addConstraint('Tasks', {
      fields: ['contactId'],
      type: 'foreign key',
      name: 'Tasks_contactId_fkey',
      references: {
        table: 'Contacts',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  }
};