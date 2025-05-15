'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Campaigns', 'userId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true
    });

    await queryInterface.addColumn('Campaigns', 'queueId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Queues',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true
    });

    await queryInterface.addColumn('Campaigns', 'statusTicket', {
      type: Sequelize.STRING,
      defaultValue: 'closed',
      allowNull: false
    });

    await queryInterface.addColumn('Campaigns', 'openTicket', {
      type: Sequelize.STRING,
      defaultValue: 'disabled',
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Campaigns', 'userId');
    await queryInterface.removeColumn('Campaigns', 'queueId');
    await queryInterface.removeColumn('Campaigns', 'statusTicket');
    await queryInterface.removeColumn('Campaigns', 'openTicket');
  }
};