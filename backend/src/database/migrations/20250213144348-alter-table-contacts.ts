module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Verifica se a coluna positionId já existe antes de adicioná-la
      const tableInfo = await queryInterface.describeTable('Contacts');
      if (!tableInfo.positionId) {
        await queryInterface.addColumn('Contacts', 'positionId', {
          type: Sequelize.INTEGER,
          references: {
            model: 'ContactPositions',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        });

        // Adiciona índice para melhor performance
        await queryInterface.addIndex('Contacts', ['positionId']);
      }

      // Remove a coluna position apenas se existir
      if (tableInfo.position) {
        await queryInterface.removeColumn('Contacts', 'position');
      }
    } catch (error) {
      console.error('Erro ao modificar a tabela Contacts:', error);
      // Continua para a próxima migração mesmo em caso de erro
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('Contacts');
      
      // Recria a coluna position apenas se não existir
      if (!tableInfo.position) {
        await queryInterface.addColumn('Contacts', 'position', {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: ""
        });
      }

      // Remove a coluna positionId apenas se existir
      if (tableInfo.positionId) {
        await queryInterface.removeColumn('Contacts', 'positionId');
      }
    } catch (error) {
      console.error('Erro ao reverter a modificação na tabela Contacts:', error);
      // Continua para a próxima migração mesmo em caso de erro
    }
  }
};
