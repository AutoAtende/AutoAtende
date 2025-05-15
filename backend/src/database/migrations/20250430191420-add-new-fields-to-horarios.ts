// migrations/YYYYMMDDHHMMSS-add-new-fields-to-horarios.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Adicionar campo type
      await queryInterface.addColumn(
        'Horarios',
        'type',
        {
          type: Sequelize.ENUM('day', 'weekdays', 'annual', 'specific'),
          allowNull: false,
          defaultValue: 'day'
        },
        { transaction }
      );

      // Adicionar campo weekdays
      await queryInterface.addColumn(
        'Horarios',
        'weekdays',
        {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: []
        },
        { transaction }
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Remover campo weekdays
      await queryInterface.removeColumn('Horarios', 'weekdays', { transaction });
      
      // Remover campo type
      await queryInterface.removeColumn('Horarios', 'type', { transaction });
      
      // Remover ENUM type
      await queryInterface.sequelize.query(`DROP TYPE "enum_Horarios_type";`, { transaction });
    });
  }
};