'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adicionar campos de cobrança à tabela Tasks
    await queryInterface.addColumn('Tasks', 'hasCharge', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('Tasks', 'chargeValue', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null
    });

    await queryInterface.addColumn('Tasks', 'isPaid', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('Tasks', 'paymentDate', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null
    });

    await queryInterface.addColumn('Tasks', 'paymentNotes', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null
    });

    await queryInterface.addColumn('Tasks', 'paidBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('Tasks', 'chargeLink', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    });

    // Criar índices para melhorar a performance das consultas
    await queryInterface.addIndex('Tasks', ['hasCharge']);
    await queryInterface.addIndex('Tasks', ['isPaid']);
    await queryInterface.addIndex('Tasks', ['paymentDate']);
    await queryInterface.addIndex('Tasks', ['paidBy']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remover índices
    await queryInterface.removeIndex('Tasks', ['hasCharge']);
    await queryInterface.removeIndex('Tasks', ['isPaid']);
    await queryInterface.removeIndex('Tasks', ['paymentDate']);
    await queryInterface.removeIndex('Tasks', ['paidBy']);

    // Remover colunas
    await queryInterface.removeColumn('Tasks', 'hasCharge');
    await queryInterface.removeColumn('Tasks', 'chargeValue');
    await queryInterface.removeColumn('Tasks', 'isPaid');
    await queryInterface.removeColumn('Tasks', 'paymentDate');
    await queryInterface.removeColumn('Tasks', 'paymentNotes');
    await queryInterface.removeColumn('Tasks', 'paidBy');
    await queryInterface.removeColumn('Tasks', 'chargeLink');
  }
};