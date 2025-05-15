module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = "Whatsapps";
    const columnName = "color";

    // Obtém informações da estrutura da tabela
    const tableDesc = await queryInterface.describeTable(tableName);

    // Verifica se a coluna já existe
    if (!tableDesc[columnName]) {
      await queryInterface.addColumn(tableName, columnName, {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "#7367F0", // cor padrão
      });
    } else if (tableDesc[columnName].type !== "VARCHAR") {
      // Ajusta o tipo da coluna se for diferente
      await queryInterface.changeColumn(tableName, columnName, {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "#7367F0",
      });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("Whatsapps", "color");
  },
};
