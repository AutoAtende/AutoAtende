'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Tickets');
    if (table.reasonId) {
      await queryInterface.removeColumn('Tickets', 'reasonId');
    } else {
      console.log('Column reasonId does not exist in Tickets table. Skipping removal.');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Tickets');
    if (!table.reasonId) {
      await queryInterface.addColumn('Tickets', 'reasonId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Reasons',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    } else {
      console.log('Column reasonId already exists in Tickets table. Skipping addition.');
    }
  }
};
