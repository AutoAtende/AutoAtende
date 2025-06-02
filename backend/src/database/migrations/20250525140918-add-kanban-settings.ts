import { QueryInterface, DataTypes, QueryTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    try {
      console.log('Iniciando migração: Configurações Kanban');

      // Buscar todas as empresas existentes
      const companies: any[] = await queryInterface.sequelize.query(
        'SELECT id FROM "Companies" WHERE "status" = true',
        { type: QueryTypes.SELECT }
      );

      console.log(`Encontradas ${companies.length} empresas ativas`);

      if (companies.length === 0) {
        console.log('Nenhuma empresa encontrada. Pulando criação de configurações.');
        return;
      }

      // Configurações padrão do Kanban
      const defaultSettings = [
        {
          key: 'kanbanAutoCreateCards',
          value: 'disabled'
        },
        {
          key: 'kanbanAutoSyncStatus', 
          value: 'enabled'
        },
        {
          key: 'kanbanDefaultBoardId',
          value: ''
        },
        {
          key: 'kanbanLaneStatusMapping',
          value: JSON.stringify({
            'Pendente': 'pending',
            'Novo': 'pending',
            'Em Atendimento': 'open',
            'Em Progresso': 'open',
            'Aberto': 'open',
            'Aguardando Cliente': 'pending',
            'Aguardando Resposta': 'pending',
            'Resolvido': 'closed',
            'Finalizado': 'closed',
            'Concluído': 'closed',
            'Fechado': 'closed'
          })
        },
        {
          key: 'kanbanAutoArchiveClosed',
          value: 'enabled'
        }
      ];

      // Preparar dados para inserção em lote
      const settingsToInsert = [];
      const now = new Date();

      for (const company of companies) {
        for (const setting of defaultSettings) {
          // Verificar se a configuração já existe para evitar duplicatas
          const existingSetting: any[] = await queryInterface.sequelize.query(
            'SELECT id FROM "Settings" WHERE "companyId" = ? AND "key" = ?',
            {
              replacements: [company.id, setting.key],
              type: QueryTypes.SELECT
            }
          );

          // Só adicionar se não existir
          if (existingSetting.length === 0) {
            settingsToInsert.push({
              companyId: company.id,
              key: setting.key,
              value: setting.value,
              createdAt: now,
              updatedAt: now
            });
          }
        }
      }

      if (settingsToInsert.length > 0) {
        // Inserir configurações em lotes para melhor performance
        const batchSize = 100;
        for (let i = 0; i < settingsToInsert.length; i += batchSize) {
          const batch = settingsToInsert.slice(i, i + batchSize);
          await queryInterface.bulkInsert('Settings', batch);
        }

        console.log(`✅ ${settingsToInsert.length} configurações Kanban inseridas com sucesso`);
      } else {
        console.log('ℹ️ Todas as configurações Kanban já existem');
      }

      console.log('Migração concluída com sucesso');

    } catch (error) {
      console.error('❌ Erro na migração:', error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface) => {
    try {
      console.log('Iniciando rollback: Removendo configurações Kanban');

      // Listar configurações que serão removidas
      const kanbanKeys = [
        'kanbanAutoCreateCards',
        'kanbanAutoSyncStatus', 
        'kanbanDefaultBoardId',
        'kanbanLaneStatusMapping',
        'kanbanAutoArchiveClosed'
      ];

      // Contar configurações existentes
      const existingCount: any[] = await queryInterface.sequelize.query(
        `SELECT COUNT(*) as count FROM "Settings" WHERE "key" IN (${kanbanKeys.map(() => '?').join(', ')})`,
        {
          replacements: kanbanKeys,
          type: QueryTypes.SELECT
        }
      );

      console.log(`Encontradas ${existingCount[0]?.count || 0} configurações para remover`);

      // Remover configurações do Kanban usando WHERE IN com placeholders
      await queryInterface.sequelize.query(
        `DELETE FROM "Settings" WHERE "key" IN (${kanbanKeys.map(() => '?').join(', ')})`,
        {
          replacements: kanbanKeys,
          type: QueryTypes.DELETE
        }
      );

      console.log(`✅ Configurações Kanban removidas com sucesso`);

    } catch (error) {
      console.error('❌ Erro no rollback:', error);
      throw error;
    }
  }
};