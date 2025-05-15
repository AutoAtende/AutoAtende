// migrations/YYYYMMDDHHMMSS-add-horario-group-id-to-horarios.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Horarios', 'horarioGroupId', {
      type: Sequelize.INTEGER,
      references: { model: 'HorarioGroups', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true
    });

    // Índice para melhorar a performance
    await queryInterface.addIndex('Horarios', ['horarioGroupId']);
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Horarios', 'horarioGroupId');
  }
};