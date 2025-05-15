'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('TicketTraking', 'reasonId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Reasons',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('TicketTraking', 'reasonId');
  }
};
