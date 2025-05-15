'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Tasks', 'isRecurrent', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('Tasks', 'recurrenceType', {
      type: Sequelize.ENUM('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semiannual', 'annual'),
      allowNull: true
    });

    await queryInterface.addColumn('Tasks', 'recurrenceEndDate', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('Tasks', 'recurrenceCount', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('Tasks', 'parentTaskId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Tasks',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('Tasks', 'nextOccurrenceDate', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Criar índices para melhorar a performance
    await queryInterface.addIndex('Tasks', ['isRecurrent']);
    await queryInterface.addIndex('Tasks', ['parentTaskId']);
    await queryInterface.addIndex('Tasks', ['nextOccurrenceDate']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Tasks', ['isRecurrent']);
    await queryInterface.removeIndex('Tasks', ['parentTaskId']);
    await queryInterface.removeIndex('Tasks', ['nextOccurrenceDate']);

    await queryInterface.removeColumn('Tasks', 'isRecurrent');
    await queryInterface.removeColumn('Tasks', 'recurrenceType');
    await queryInterface.removeColumn('Tasks', 'recurrenceEndDate');
    await queryInterface.removeColumn('Tasks', 'recurrenceCount');
    await queryInterface.removeColumn('Tasks', 'parentTaskId');
    await queryInterface.removeColumn('Tasks', 'nextOccurrenceDate');
  }
};