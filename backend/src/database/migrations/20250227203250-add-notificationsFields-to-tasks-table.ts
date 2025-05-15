'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Verificar se a coluna notifiedOverdue existe
      const columns = await queryInterface.describeTable('Tasks', { transaction });
      
      if (!columns.notifiedOverdue) {
        await queryInterface.addColumn('Tasks', 'notifiedOverdue', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        }, { transaction });
        
        console.log('Coluna notifiedOverdue adicionada com sucesso');
      }
      
      if (!columns.lastNotificationSent) {
        await queryInterface.addColumn('Tasks', 'lastNotificationSent', {
          type: Sequelize.DATE,
          allowNull: true
        }, { transaction });
        
        console.log('Coluna lastNotificationSent adicionada com sucesso');
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('Tasks', 'notifiedOverdue', { transaction });
      await queryInterface.removeColumn('Tasks', 'lastNotificationSent', { transaction });
    });
  }
};