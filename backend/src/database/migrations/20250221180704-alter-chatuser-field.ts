module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // 1. Verificar e limpar colunas temporárias se existirem
      const tableInfo = await queryInterface.describeTable('ChatUsers');
      
      if (tableInfo.blockedUsers_new) {
        await queryInterface.removeColumn('ChatUsers', 'blockedUsers_new');
      }

      // 2. Criar coluna temporária
      await queryInterface.addColumn('ChatUsers', 'blockedUsers_new', {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: true
      });

      // 3. Copiar dados convertendo de JSON para ARRAY
      await queryInterface.sequelize.query(`
        UPDATE "ChatUsers" 
        SET "blockedUsers_new" = CASE 
          WHEN "blockedUsers" IS NULL THEN ARRAY[]::integer[]
          WHEN "blockedUsers"::text = '[]' THEN ARRAY[]::integer[]
          ELSE ARRAY(
            SELECT DISTINCT elem::integer 
            FROM jsonb_array_elements_text("blockedUsers"::jsonb) elem
          )
        END;
      `);

      // 4. Remover coluna antiga
      await queryInterface.removeColumn('ChatUsers', 'blockedUsers');

      // 5. Renomear coluna nova
      await queryInterface.renameColumn('ChatUsers', 'blockedUsers_new', 'blockedUsers');

      // 6. Definir valor padrão
      await queryInterface.changeColumn('ChatUsers', 'blockedUsers', {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: false,
        defaultValue: []
      });

    } catch (error) {
      console.error('Erro na migração:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // 1. Verificar e limpar colunas temporárias se existirem
      const tableInfo = await queryInterface.describeTable('ChatUsers');
      
      if (tableInfo.blockedUsers_old) {
        await queryInterface.removeColumn('ChatUsers', 'blockedUsers_old');
      }

      // 2. Criar coluna temporária JSON
      await queryInterface.addColumn('ChatUsers', 'blockedUsers_old', {
        type: Sequelize.JSON,
        allowNull: true
      });

      // 3. Copiar dados para JSON
      await queryInterface.sequelize.query(`
        UPDATE "ChatUsers" 
        SET "blockedUsers_old" = 
          COALESCE(
            (SELECT json_agg(x) FROM unnest("blockedUsers") AS x), 
            '[]'::json
          );
      `);

      // 4. Remover coluna array
      await queryInterface.removeColumn('ChatUsers', 'blockedUsers');

      // 5. Renomear coluna JSON
      await queryInterface.renameColumn('ChatUsers', 'blockedUsers_old', 'blockedUsers');

      // 6. Definir valor padrão
      await queryInterface.changeColumn('ChatUsers', 'blockedUsers', {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      });

    } catch (error) {
      console.error('Erro no rollback:', error);
      throw error;
    }
  }
};