'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = 'Emails';

    // Obter a definição atual da tabela
    const tableDefinition = await queryInterface.describeTable(tableName);

    // Verifica e ajusta a coluna 'scheduled'
    if (!tableDefinition.scheduled) {
      await queryInterface.addColumn(tableName, 'scheduled', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      });
    } else {
      // Verifica se 'scheduled' está conforme o esperado
      if (tableDefinition.scheduled.type !== 'BOOLEAN') {
        await queryInterface.changeColumn(tableName, 'scheduled', {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        });
      }
    }

    // Verifica e ajusta a coluna 'sendAt'
    if (!tableDefinition.sendAt) {
      await queryInterface.addColumn(tableName, 'sendAt', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    } else {
      // Verifica se 'sendAt' está conforme o esperado
      if (tableDefinition.sendAt.type !== 'DATETIME') {
        await queryInterface.changeColumn(tableName, 'sendAt', {
          type: Sequelize.DATE,
          allowNull: true,
        });
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableName = 'Emails';

    const tableDefinition = await queryInterface.describeTable(tableName);

    // Remove a coluna 'scheduled' se existir
    if (tableDefinition.scheduled) {
      await queryInterface.removeColumn(tableName, 'scheduled');
    }

    // Remove a coluna 'sendAt' se existir
    if (tableDefinition.sendAt) {
      await queryInterface.removeColumn(tableName, 'sendAt');
    }
  },
};
