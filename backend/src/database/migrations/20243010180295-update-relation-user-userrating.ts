module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = 'UserRatings'; // Nome correto da tabela conforme o modelo

    // Verifica se a coluna "userId" já existe na tabela "UserRatings"
    const columns = await queryInterface.describeTable(tableName);

    if (!columns['userId']) {
      console.log(`Coluna "userId" não encontrada na tabela "${tableName}". Criando...`);
      await queryInterface.addColumn(tableName, 'userId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Nome da tabela relacionada
          key: 'id',     // Chave na tabela relacionada
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
      console.log('Coluna "userId" adicionada com sucesso.');
    } else {
      console.log(`Coluna "userId" já existe na tabela "${tableName}". Verificando configurações...`);

      // Verifica se a configuração atual da coluna "userId" está correta
      if (
        columns['userId'].allowNull === false &&
        columns['userId'].type.includes('INTEGER')
      ) {
        console.log('Configurações da coluna "userId" estão corretas.');
      } else {
        console.log('Configurações da coluna "userId" estão incorretas. Atualizando...');
        await queryInterface.changeColumn(tableName, 'userId', {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Users', // Nome da tabela relacionada
            key: 'id',     // Chave na tabela relacionada
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        });
        console.log('Configurações da coluna "userId" atualizadas com sucesso.');
      }
    }
  },

  down: async (queryInterface) => {
    const tableName = 'UserRatings';

    // Remove a coluna "userId" caso exista
    const columns = await queryInterface.describeTable(tableName);

    if (columns['userId']) {
      console.log(`Removendo a coluna "userId" da tabela "${tableName}"...`);
      await queryInterface.removeColumn(tableName, 'userId');
      console.log('Coluna "userId" removida com sucesso.');
    } else {
      console.log(`Coluna "userId" não encontrada na tabela "${tableName}". Nenhuma alteração necessária.`);
    }
  },
};
