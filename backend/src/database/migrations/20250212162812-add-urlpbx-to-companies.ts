module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Verifica se a coluna já existe antes de adicioná-la
      const tableInfo = await queryInterface.describeTable('Companies');
      if (!tableInfo.urlPBX) {
        await queryInterface.addColumn('Companies', 'urlPBX', {
          type: Sequelize.STRING,
          allowNull: true
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar a coluna urlPBX:', error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('Companies');
      if (tableInfo.urlPBX) {
        await queryInterface.removeColumn('Companies', 'urlPBX');
      }
    } catch (error) {
      console.error('Erro ao remover a coluna urlPBX:', error);
    }
  }
};
