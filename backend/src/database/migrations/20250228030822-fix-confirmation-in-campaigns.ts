'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verificar o tipo atual da coluna
    const tableInfo = await queryInterface.describeTable('Campaigns');
    
    // Somente atualizar se o tipo for diferente de BOOLEAN
    if (tableInfo.confirmation && tableInfo.confirmation.type.toLowerCase() !== 'boolean') {
      // Modificar o tipo da coluna para BOOLEAN
      await queryInterface.changeColumn('Campaigns', 'confirmation', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    } else if (!tableInfo.confirmation) {
      // Adicionar a coluna se ela não existir
      await queryInterface.addColumn('Campaigns', 'confirmation', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Você pode revertê-la para o tipo original se necessário
    // Exemplo: se era STRING antes
    /*
    await queryInterface.changeColumn('Campaigns', 'confirmation', {
      type: Sequelize.STRING,
      allowNull: true
    });
    */
    // Ou simplesmente não fazer nada no down, já que estamos apenas modificando o tipo
  }
};