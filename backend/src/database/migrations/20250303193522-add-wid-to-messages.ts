import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableName = 'Messages';
    
    // Verifica colunas antes de alterar
    const [columns] = await queryInterface.sequelize.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${tableName.toLowerCase()}'`);
    const columnMap = Object.fromEntries(columns.map((col: any) => [col.column_name, col.data_type]));

    // Adiciona a coluna wid primeiro, antes de tentar atualizar
    if (!columnMap['wid']) {
      await queryInterface.addColumn(tableName, 'wid', {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false
      });
      
      // Após adicionar a coluna, agora podemos atualizá-la
      await queryInterface.sequelize.query(`UPDATE "${tableName}" SET "wid" = "id"::text`);
    }

    // Verificar e corrigir foreign key de quotedMsgId
    if (columnMap['quotedMsgId'] && columnMap['quotedMsgId'] !== 'integer') {
      try {
        await queryInterface.removeConstraint(tableName, 'Messages_quotedMsgId_fkey');
      } catch (error) {
        console.log('Constraint Messages_quotedMsgId_fkey não existe ou não pode ser removida');
      }
      
      await queryInterface.removeColumn(tableName, 'quotedMsgId');
      await queryInterface.addColumn(tableName, 'quotedMsgId', {
        type: DataTypes.INTEGER,
        allowNull: true
      });
    }

    // Corrigir coluna ID se necessário
    if (columnMap['id'] && columnMap['id'] !== 'integer') {
      try {
        await queryInterface.removeConstraint(tableName, 'Messages_pkey');
      } catch (error) {
        console.log('Constraint Messages_pkey não existe ou não pode ser removida');
      }
      
      await queryInterface.removeColumn(tableName, 'id');
      await queryInterface.addColumn(tableName, 'id', {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        unique: true
      });
      await queryInterface.sequelize.query(`ALTER TABLE "${tableName}" ADD CONSTRAINT "Messages_pkey" PRIMARY KEY (id)`);
    }

    // Adicionar índice para a coluna wid
    const [indexes] = await queryInterface.sequelize.query(`SELECT indexname FROM pg_indexes WHERE tablename = '${tableName.toLowerCase()}'`);
    const indexExists = indexes.some((index: any) => index.indexname === 'idx_messages_wid');
    if (!indexExists) {
      await queryInterface.addIndex(tableName, ['wid'], { name: 'idx_messages_wid' });
    }

    // Recriar a constraint de quotedMsgId se necessário
    const hasQuotedConstraint = indexes.some((index: any) => index.indexname === 'Messages_quotedMsgId_fkey');
    if (columnMap['quotedMsgId'] && !hasQuotedConstraint) {
      try {
        await queryInterface.addConstraint(tableName, ['quotedMsgId'], {
          type: 'foreign key',
          name: 'Messages_quotedMsgId_fkey',
          references: {
            table: tableName,
            field: 'id'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        });
      } catch (error) {
        console.log('Não foi possível adicionar a constraint Messages_quotedMsgId_fkey');
      }
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const tableName = 'Messages';
    
    // Verificar índices antes de remover
    const [indexes] = await queryInterface.sequelize.query(`SELECT indexname FROM pg_indexes WHERE tablename = '${tableName.toLowerCase()}'`);
    if (indexes.some((index: any) => index.indexname === 'idx_messages_wid')) {
      await queryInterface.removeIndex(tableName, 'idx_messages_wid');
    }

    // Verificar e remover constraints
    try {
      await queryInterface.removeConstraint(tableName, 'Messages_quotedMsgId_fkey');
    } catch (error) {
      console.log('Constraint Messages_quotedMsgId_fkey não existe ou não pode ser removida');
    }
    
    try {
      await queryInterface.removeConstraint(tableName, 'Messages_pkey');
    } catch (error) {
      console.log('Constraint Messages_pkey não existe ou não pode ser removida');
    }
    
    // Verificar colunas antes de remover
    const [columns] = await queryInterface.sequelize.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${tableName.toLowerCase()}'`);
    const columnExists = (col: string) => columns.some((c: any) => c.column_name === col);
    
    if (columnExists('wid')) await queryInterface.removeColumn(tableName, 'wid');
    if (columnExists('quotedMsgId')) await queryInterface.removeColumn(tableName, 'quotedMsgId');
    if (columnExists('id')) await queryInterface.removeColumn(tableName, 'id');
    
    // Recriar coluna ID
    await queryInterface.addColumn(tableName, 'id', {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    });

    // Restaurar constraint
    try {
      await queryInterface.addConstraint(tableName, ['id'], {
        type: 'primary key',
        name: 'Messages_pkey'
      });
    } catch (error) {
      console.log('Não foi possível adicionar a constraint Messages_pkey');
    }
    
    // Adicionar quotedMsgId se necessário
    await queryInterface.addColumn(tableName, 'quotedMsgId', {
      type: DataTypes.INTEGER,
      allowNull: true
    });
    
    try {
      await queryInterface.addConstraint(tableName, ['quotedMsgId'], {
        type: 'foreign key',
        name: 'Messages_quotedMsgId_fkey',
        references: {
          table: tableName,
          field: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });
    } catch (error) {
      console.log('Não foi possível adicionar a constraint Messages_quotedMsgId_fkey');
    }
  }
};