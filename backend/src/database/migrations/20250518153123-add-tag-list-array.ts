// Modificação na migração do Sequelize para Campaign (se necessário)
// Arquivo de migração (YYYY-MM-DD-HH-MM-add-tag-list-array.js)

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verificar se a coluna já existe para evitar erros
    const tableInfo = await queryInterface.describeTable('Campaigns');
    
    // Adicionar uma coluna para armazenar o array de tags original
    if (!tableInfo.originalTagListIds) {
      await queryInterface.addColumn('Campaigns', 'originalTagListIds', {
        type: Sequelize.DataTypes.JSON,
        allowNull: true,
      });
    }
    
    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Campaigns', 'originalTagListIds');
  }
};