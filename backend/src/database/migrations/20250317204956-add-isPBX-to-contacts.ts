// Nome do arquivo: migrations/YYYYMMDDHHMMSS-add-isPBX-to-contacts.js

module.exports = {
    up: async (queryInterface, Sequelize) => {
      // Adicionar a coluna isPBX à tabela Contacts
      await queryInterface.addColumn('Contacts', 'isPBX', {
        type: Sequelize.BOOLEAN,
        allowNull: true, // Inicialmente permitimos valores nulos para a migração
        defaultValue: false
      });
  
      // Atualizar todos os registros existentes para isPBX=false
      await queryInterface.sequelize.query(
        `UPDATE "Contacts" SET "isPBX" = false WHERE "isPBX" IS NULL`
      );
  
      // Alterar a coluna para não permitir valores nulos após a atualização
      await queryInterface.changeColumn('Contacts', 'isPBX', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    },
  
    down: async (queryInterface) => {
      await queryInterface.removeColumn('Contacts', 'isPBX');
    }
  };