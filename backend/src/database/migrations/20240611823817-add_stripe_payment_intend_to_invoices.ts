'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Invoices', 'stripePaymentIntentId', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'dueDate' // Especifica onde a coluna deve ser adicionada na tabela
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Invoices', 'stripePaymentIntentId');
  }
};
