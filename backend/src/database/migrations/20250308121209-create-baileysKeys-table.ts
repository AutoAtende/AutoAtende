module.exports = {
    up: async (queryInterface, Sequelize) => {
      const tableName = "BaileysKeys";
      
      // Verifica se a tabela existe
      const tableExists = await queryInterface.sequelize.query(
        `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '${tableName}');`,
        { type: Sequelize.QueryTypes.SELECT }
      );
      
      if (tableExists[0].exists) {
        // Exclui a tabela se existir
        await queryInterface.dropTable(tableName);
      }
  
      // Cria a nova tabela conforme o modelo
      await queryInterface.createTable(tableName, {
        whatsappId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: "Whatsapps",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        type: {
          type: Sequelize.TEXT,
          allowNull: false,
          primaryKey: true,
        },
        key: {
          type: Sequelize.TEXT,
          allowNull: false,
          primaryKey: true,
        },
        value: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
      });
    },
  
    down: async (queryInterface) => {
      await queryInterface.dropTable("BaileysKeys");
    },
  };
  