module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = "InvoiceLogs";

    // Verifica se a tabela "InvoiceLogs" já existe
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes(tableName));

    if (!tableExists) {
      // Se a tabela não existir, cria a tabela
      console.log(`A tabela "${tableName}" não existe. Criando a tabela...`);

      await queryInterface.createTable(tableName, {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        invoiceId: {
          type: Sequelize.INTEGER,
          references: { model: "Invoices", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE"
        },
        userId: {
          type: Sequelize.INTEGER,
          references: { model: "Users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL"
        },
        type: {
          type: Sequelize.STRING,
          allowNull: false
        },
        oldValue: {
          type: Sequelize.DATE,
          allowNull: true
        },
        newValue: {
          type: Sequelize.DATE,
          allowNull: true
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false
        }
      });

      // Cria os índices necessários
      await queryInterface.addIndex(tableName, ["invoiceId"]);
      await queryInterface.addIndex(tableName, ["userId"]);
      await queryInterface.addIndex(tableName, ["createdAt"]);

      console.log(`Tabela "${tableName}" criada com sucesso, incluindo índices.`);
    } else {
      // Se a tabela já existir, verifica se as colunas e índices estão de acordo com a estrutura desejada
      const tableInfo = await queryInterface.describeTable(tableName);

      const expectedColumns = [
        "id", "invoiceId", "userId", "type", "oldValue", "newValue", "createdAt"
      ];

      const currentColumns = Object.keys(tableInfo);

      // Verifica se as colunas da tabela estão corretas
      const missingColumns = expectedColumns.filter(column => !currentColumns.includes(column));
      const extraColumns = currentColumns.filter(column => !expectedColumns.includes(column));

      if (missingColumns.length || extraColumns.length) {
        console.log(`A estrutura da tabela "${tableName}" não está conforme o esperado.`);

        // Adiciona as colunas faltantes
        for (const column of missingColumns) {
          console.log(`Adicionando a coluna "${column}"...`);

          // Define a coluna de acordo com o esperado
          await queryInterface.addColumn(tableName, column, {
            type: Sequelize.STRING,  // Exemplo, ajuste conforme necessário
            allowNull: true
          });
        }

        // Remove as colunas extras
        for (const column of extraColumns) {
          console.log(`Removendo a coluna extra "${column}"...`);
          await queryInterface.removeColumn(tableName, column);
        }

        // Adiciona os índices, se necessário
        await queryInterface.addIndex(tableName, ["invoiceId"]);
        await queryInterface.addIndex(tableName, ["userId"]);
        await queryInterface.addIndex(tableName, ["createdAt"]);

        console.log(`Estrutura da tabela "${tableName}" atualizada com sucesso.`);
      } else {
        console.log(`A estrutura da tabela "${tableName}" já está conforme o esperado.`);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableName = "InvoiceLogs";

    // Verifica se a tabela existe antes de tentar removê-la
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes(tableName));

    if (tableExists) {
      // Remove a tabela caso ela exista
      console.log(`Removendo a tabela "${tableName}"...`);
      await queryInterface.dropTable(tableName);
    } else {
      console.log(`A tabela "${tableName}" não existe. Nenhuma ação foi realizada.`);
    }
  }
};
