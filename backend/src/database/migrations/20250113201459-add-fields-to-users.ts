module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = "Users";

    // Função auxiliar para verificar a existência de uma coluna
    const columnExists = async (tableName, columnName) => {
      const tableInfo = await queryInterface.describeTable(tableName);
      return !!tableInfo[columnName];
    };

    // Verifica e adiciona a coluna 'color'
    if (!(await columnExists(tableName, "color"))) {
      await queryInterface.addColumn(tableName, "color", {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "#7367F0",
      });
    }

    // Verifica e adiciona a coluna 'number'
    if (!(await columnExists(tableName, "number"))) {
      await queryInterface.addColumn(tableName, "number", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    // Verifica e adiciona a coluna 'profilePic'
    if (!(await columnExists(tableName, "profilePic"))) {
      await queryInterface.addColumn(tableName, "profilePic", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableName = "Users";

    // Remove a coluna 'color' se existir
    await queryInterface.removeColumn(tableName, "color");

    // Remove a coluna 'number' se existir
    await queryInterface.removeColumn(tableName, "number");

    // Remove a coluna 'profilePic' se existir
    await queryInterface.removeColumn(tableName, "profilePic");
  },
};
