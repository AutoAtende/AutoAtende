import { QueryInterface, DataTypes, QueryTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log("[Migration] Iniciando correção de campos JSONB dos grupos...");

      // ✅ ETAPA 1: Corrigir registros com participantsJson NULL
      await queryInterface.sequelize.query(`
        UPDATE "Groups" 
        SET "participantsJson" = '[]'::jsonb 
        WHERE "participantsJson" IS NULL
      `, { transaction });

      console.log("[Migration] Corrigidos registros com participantsJson NULL");

      // ✅ ETAPA 2: Corrigir registros com adminParticipants NULL
      await queryInterface.sequelize.query(`
        UPDATE "Groups" 
        SET "adminParticipants" = '[]'::jsonb 
        WHERE "adminParticipants" IS NULL
      `, { transaction });

      console.log("[Migration] Corrigidos registros com adminParticipants NULL");

      // ✅ ETAPA 3: Corrigir registros com settings NULL
      await queryInterface.sequelize.query(`
        UPDATE "Groups" 
        SET "settings" = '[]'::jsonb 
        WHERE "settings" IS NULL
      `, { transaction });

      console.log("[Migration] Corrigidos registros com settings NULL");

      // ✅ ETAPA 4: Validar e corrigir dados JSON inválidos
      const invalidJsonGroups = await queryInterface.sequelize.query(`
        SELECT id, jid, "participantsJson", "adminParticipants" 
        FROM "Groups" 
        WHERE 
          (jsonb_typeof("participantsJson") != 'array') OR
          (jsonb_typeof("adminParticipants") != 'array')
      `, { 
        type: QueryTypes.SELECT,
        transaction 
      });

      console.log(`[Migration] Encontrados ${invalidJsonGroups.length} grupos com dados JSON inválidos`);

      // Corrigir cada grupo com dados inválidos
      for (const group of invalidJsonGroups as any[]) {
        try {
          await queryInterface.sequelize.query(`
            UPDATE "Groups" 
            SET 
              "participantsJson" = '[]'::jsonb,
              "adminParticipants" = '[]'::jsonb,
              "syncStatus" = 'corrected'
            WHERE id = :groupId
          `, {
            replacements: { groupId: group.id },
            transaction
          });

          console.log(`[Migration] Corrigido grupo ID ${group.id} (${group.jid})`);
        } catch (error) {
          console.error(`[Migration] Erro ao corrigir grupo ID ${group.id}:`, error.message);
        }
      }

      // ✅ ETAPA 5: Verificar integridade final
      const finalCheck = await queryInterface.sequelize.query(`
        SELECT COUNT(*) as total,
               COUNT(CASE WHEN "participantsJson" IS NULL THEN 1 END) as null_participants,
               COUNT(CASE WHEN "adminParticipants" IS NULL THEN 1 END) as null_admins,
               COUNT(CASE WHEN "settings" IS NULL THEN 1 END) as null_settings
        FROM "Groups"
      `, { 
        type: QueryTypes.SELECT,
        transaction
      });

      const stats = finalCheck[0] as any;
      console.log(`[Migration] Verificação final:`, {
        total: stats.total,
        nullParticipants: stats.null_participants,
        nullAdmins: stats.null_admins,
        nullSettings: stats.null_settings
      });

      // ✅ ETAPA 6: Adicionar índices para performance se não existirem
      try {
        await queryInterface.addIndex('Groups', ['companyId', 'isActive'], {
          name: 'groups_company_active_idx',
          transaction
        });
        console.log("[Migration] Índice groups_company_active_idx criado");
      } catch (error) {
        console.log("[Migration] Índice groups_company_active_idx já existe");
      }

      try {
        await queryInterface.addIndex('Groups', ['jid', 'companyId'], {
          name: 'groups_jid_company_idx',
          unique: true,
          transaction
        });
        console.log("[Migration] Índice único groups_jid_company_idx criado");
      } catch (error) {
        console.log("[Migration] Índice groups_jid_company_idx já existe");
      }

      await transaction.commit();
      console.log("[Migration] Correção de campos JSONB concluída com sucesso!");

    } catch (error) {
      await transaction.rollback();
      console.error("[Migration] Erro na correção de campos JSONB:", error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log("[Migration] Revertendo correção de campos JSONB...");

      // Remover índices criados
      try {
        await queryInterface.removeIndex('Groups', 'groups_company_active_idx', { transaction });
        console.log("[Migration] Índice groups_company_active_idx removido");
      } catch (error) {
        console.log("[Migration] Índice groups_company_active_idx não encontrado");
      }

      try {
        await queryInterface.removeIndex('Groups', 'groups_jid_company_idx', { transaction });
        console.log("[Migration] Índice groups_jid_company_idx removido");
      } catch (error) {
        console.log("[Migration] Índice groups_jid_company_idx não encontrado");
      }

      // Reverter status de grupos corrigidos
      await queryInterface.sequelize.query(`
        UPDATE "Groups" 
        SET "syncStatus" = 'pending' 
        WHERE "syncStatus" = 'corrected'
      `, { transaction });

      await transaction.commit();
      console.log("[Migration] Reversão concluída!");

    } catch (error) {
      await transaction.rollback();
      console.error("[Migration] Erro na reversão:", error);
      throw error;
    }
  }
};