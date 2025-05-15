"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Obtém a descrição da tabela "Users"
    const tableDescription = await queryInterface.describeTable("Users");

    // Verifica se a coluna "ramal" já existe
    if (!tableDescription.ramal) {
      // Se a coluna não existir, adiciona
      await queryInterface.addColumn("Users", "ramal", {
        type: Sequelize.STRING, // Define o tipo da coluna
        allowNull: true, // Permite valores nulos (ajuste conforme necessário)
      });
      console.log('Coluna "ramal" adicionada com sucesso.');
    } else {
      // Se a coluna já existir, verifica se está de acordo com o esperado
      const columnDefinition = tableDescription.ramal;

      if (
        columnDefinition.type !== "VARCHAR(255)" || // Verifica o tipo (STRING no Sequelize é VARCHAR(255) no banco)
        columnDefinition.allowNull !== true // Verifica se permite nulos
      ) {
        // Se não estiver de acordo, atualiza a coluna
        await queryInterface.changeColumn("Users", "ramal", {
          type: Sequelize.STRING,
          allowNull: true,
        });
        console.log('Coluna "ramal" atualizada com sucesso.');
      } else {
        console.log('Coluna "ramal" já existe e está de acordo com o esperado.');
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Obtém a descrição da tabela "Users"
    const tableDescription = await queryInterface.describeTable("Users");

    // Verifica se a coluna "ramal" existe antes de tentar removê-la
    if (tableDescription.ramal) {
      await queryInterface.removeColumn("Users", "ramal");
      console.log('Coluna "ramal" removida com sucesso.');
    } else {
      console.log('Coluna "ramal" não existe, nada a fazer.');
    }
  },
};