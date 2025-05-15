module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('Tickets');
      
      if (!tableInfo.fromAPI) {
        await queryInterface.addColumn('Tickets', 'fromAPI', {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false
        });
      }
      
      if (!tableInfo.iNotes) {
        await queryInterface.addColumn('Tickets', 'iNotes', {
          type: Sequelize.TEXT,
          allowNull: true
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar colunas em Tickets:', error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('Tickets');
      
      if (tableInfo.fromAPI) {
        await queryInterface.removeColumn('Tickets', 'fromAPI');
      }
      
      if (tableInfo.iNotes) {
        await queryInterface.removeColumn('Tickets', 'iNotes');
      }
    } catch (error) {
      console.error('Erro ao remover colunas em Tickets:', error);
    }
  }
};