// Migration: Remove campo participants redundante da tabela Groups
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🗑️  Removendo campo "participants" redundante da tabela Groups...');
    
    // Remover o campo participants (TEXT) que é redundante
    await queryInterface.removeColumn('Groups', 'participants');
    
    console.log('✅ Campo "participants" removido com sucesso!');
    console.log('📝 Agora usando apenas "participantsJson" (JSONB) para melhor performance');
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔄 Revertendo: Adicionando campo "participants" de volta...');
    
    // Readicionar o campo participants caso precise reverter
    await queryInterface.addColumn('Groups', 'participants', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null
    });
    
    console.log('✅ Campo "participants" restaurado');
  }
};