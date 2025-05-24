import { QueryInterface, DataTypes } from "sequelize";

// Interface para tipagem da descrição da tabela
interface ColumnDescription {
  type: string;
  allowNull: boolean;
  defaultValue: any;
  references?: {
    model: string;
    key: string;
  };
  [key: string]: any;
}

interface TableDescription {
  [columnName: string]: ColumnDescription;
}

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Verificar se a tabela existe
      const tables = await queryInterface.showAllTables();
      const tableExists = tables.includes('InactivityNodes');
      
      if (!tableExists) {
        console.log('Tabela InactivityNodes não existe. Execute primeiro a migração de criação.');
        await transaction.rollback();
        return;
      }
      
      // Obter descrição da tabela para verificar colunas existentes
      const tableDescription = await queryInterface.describeTable('InactivityNodes') as TableDescription;
      
      // Verificar e adicionar colunas faltantes com validação de tipo
      
      // 1. Verificar e corrigir tipos de dados das colunas existentes
      if (tableDescription['nodeId'] && tableDescription['nodeId'].type !== 'VARCHAR(255)') {
        await queryInterface.changeColumn('InactivityNodes', 'nodeId', {
          type: DataTypes.STRING,
          allowNull: false
        }, { transaction });
        console.log('Tipo da coluna nodeId corrigido para STRING');
      }
      
      if (tableDescription['label'] && tableDescription['label'].allowNull !== true) {
        await queryInterface.changeColumn('InactivityNodes', 'label', {
          type: DataTypes.STRING,
          allowNull: true
        }, { transaction });
        console.log('Coluna label configurada como nullable');
      }
      
      if (tableDescription['timeout'] && (tableDescription['timeout'].defaultValue !== '300' && tableDescription['timeout'].defaultValue !== 300)) {
        await queryInterface.changeColumn('InactivityNodes', 'timeout', {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 300
        }, { transaction });
        console.log('Valor padrão da coluna timeout corrigido');
      }
      
      if (tableDescription['action'] && (tableDescription['action'].defaultValue !== 'warning' && tableDescription['action'].defaultValue !== "'warning'")) {
        await queryInterface.changeColumn('InactivityNodes', 'action', {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'warning'
        }, { transaction });
        console.log('Valor padrão da coluna action corrigido');
      }
      
      if (tableDescription['maxWarnings'] && (tableDescription['maxWarnings'].defaultValue !== '2' && tableDescription['maxWarnings'].defaultValue !== 2)) {
        await queryInterface.changeColumn('InactivityNodes', 'maxWarnings', {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 2
        }, { transaction });
        console.log('Valor padrão da coluna maxWarnings corrigido');
      }
      
      if (tableDescription['warningInterval'] && (tableDescription['warningInterval'].defaultValue !== '60' && tableDescription['warningInterval'].defaultValue !== 60)) {
        await queryInterface.changeColumn('InactivityNodes', 'warningInterval', {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 60
        }, { transaction });
        console.log('Valor padrão da coluna warningInterval corrigido');
      }
      
      // 2. Verificar e corrigir chaves estrangeiras
      if (tableDescription['transferQueueId'] && !tableDescription['transferQueueId'].references) {
        await queryInterface.changeColumn('InactivityNodes', 'transferQueueId', {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'Queues',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        }, { transaction });
        console.log('Referência da coluna transferQueueId corrigida');
      }
      
      if (tableDescription['companyId'] && (!tableDescription['companyId'].references || tableDescription['companyId'].allowNull !== false)) {
        await queryInterface.changeColumn('InactivityNodes', 'companyId', {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Companies',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        }, { transaction });
        console.log('Referência da coluna companyId corrigida');
      }
      
      if (tableDescription['flowId'] && !tableDescription['flowId'].references) {
        await queryInterface.changeColumn('InactivityNodes', 'flowId', {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'FlowBuilders',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        }, { transaction });
        console.log('Referência da coluna flowId corrigida');
      }
      
      // 3. Verificar e criar índices se não existirem
      try {
        // Índice único para nodeId + companyId
        await queryInterface.addIndex('InactivityNodes', ['nodeId', 'companyId'], {
          name: 'idx_inactivity_nodes_node_company_unique',
          unique: true,
          transaction
        });
        console.log('Índice único nodeId + companyId criado');
      } catch (error: any) {
        if (!error.message.includes('already exists') && !error.message.includes('duplicate key')) {
          console.log('Erro ao criar índice único:', error.message);
        } else {
          console.log('Índice único já existe');
        }
      }
      
      try {
        // Índice para companyId
        await queryInterface.addIndex('InactivityNodes', ['companyId'], {
          name: 'idx_inactivity_nodes_company_id',
          transaction
        });
        console.log('Índice companyId criado');
      } catch (error: any) {
        if (!error.message.includes('already exists') && !error.message.includes('duplicate key')) {
          console.log('Erro ao criar índice companyId:', error.message);
        } else {
          console.log('Índice companyId já existe');
        }
      }
      
      try {
        // Índice para flowId
        await queryInterface.addIndex('InactivityNodes', ['flowId'], {
          name: 'idx_inactivity_nodes_flow_id',
          transaction
        });
        console.log('Índice flowId criado');
      } catch (error: any) {
        if (!error.message.includes('already exists') && !error.message.includes('duplicate key')) {
          console.log('Erro ao criar índice flowId:', error.message);
        } else {
          console.log('Índice flowId já existe');
        }
      }
      
      try {
        // Índice para createdAt
        await queryInterface.addIndex('InactivityNodes', ['createdAt'], {
          name: 'idx_inactivity_nodes_created_at',
          transaction
        });
        console.log('Índice createdAt criado');
      } catch (error: any) {
        if (!error.message.includes('already exists') && !error.message.includes('duplicate key')) {
          console.log('Erro ao criar índice createdAt:', error.message);
        } else {
          console.log('Índice createdAt já existe');
        }
      }
      
      try {
        // Índice para updatedAt
        await queryInterface.addIndex('InactivityNodes', ['updatedAt'], {
          name: 'idx_inactivity_nodes_updated_at',
          transaction
        });
        console.log('Índice updatedAt criado');
      } catch (error: any) {
        if (!error.message.includes('already exists') && !error.message.includes('duplicate key')) {
          console.log('Erro ao criar índice updatedAt:', error.message);
        } else {
          console.log('Índice updatedAt já existe');
        }
      }
      
      // 4. Atualizar dados existentes se necessário
      
      // Definir valores padrão para registros que possam ter valores nulos
      await queryInterface.sequelize.query(`
        UPDATE "InactivityNodes" 
        SET 
          "timeout" = COALESCE("timeout", 300),
          "action" = COALESCE("action", 'warning'),
          "maxWarnings" = COALESCE("maxWarnings", 2),
          "warningInterval" = COALESCE("warningInterval", 60),
          "label" = COALESCE("label", 'Configuração de Inatividade')
        WHERE "timeout" IS NULL 
           OR "action" IS NULL 
           OR "maxWarnings" IS NULL 
           OR "warningInterval" IS NULL 
           OR "label" IS NULL
      `, { transaction });
      
      console.log('Dados existentes atualizados com valores padrão');
      
      await transaction.commit();
      console.log('Migração da tabela InactivityNodes concluída com sucesso');
      
    } catch (error) {
      await transaction.rollback();
      console.error('Erro na migração da tabela InactivityNodes:', error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('Revertendo alterações da tabela InactivityNodes...');
      
      // Remover índices criados
      const indicesToRemove = [
        'idx_inactivity_nodes_node_company_unique',
        'idx_inactivity_nodes_company_id',
        'idx_inactivity_nodes_flow_id',
        'idx_inactivity_nodes_created_at',
        'idx_inactivity_nodes_updated_at'
      ];
      
      for (const indexName of indicesToRemove) {
        try {
          await queryInterface.removeIndex('InactivityNodes', indexName, { transaction });
          console.log(`Índice ${indexName} removido`);
        } catch (error: any) {
          console.log(`Índice ${indexName} não existe ou erro ao remover:`, error.message);
        }
      }
      
      // Reverter alterações nas colunas (opcional, pois podem quebrar dados existentes)
      console.log('Nota: Alterações nos tipos de dados e constraints não foram revertidas para preservar dados existentes');
      
      await transaction.commit();
      console.log('Rollback da migração InactivityNodes concluído');
      
    } catch (error) {
      await transaction.rollback();
      console.error('Erro no rollback da migração InactivityNodes:', error);
      throw error;
    }
  }
};