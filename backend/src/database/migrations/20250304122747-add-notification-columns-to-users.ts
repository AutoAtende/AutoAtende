// Arquivo: migrations/YYYYMMDDHHMMSS-add-notification-columns-to-users.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'notifyNewTicket', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
    
    await queryInterface.addColumn('Users', 'notifyTask', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'notifyNewTicket');
    await queryInterface.removeColumn('Users', 'notifyTask');
  }
};