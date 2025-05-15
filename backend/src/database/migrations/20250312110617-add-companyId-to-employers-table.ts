'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1. Criar tabelas de backup
      await queryInterface.sequelize.query(`
        CREATE TABLE "ContactEmployers_backup" AS SELECT * FROM "ContactEmployers";
        CREATE TABLE "ContactPositions_backup" AS SELECT * FROM "ContactPositions";
        CREATE TABLE "EmployerPositions_backup" AS SELECT * FROM "EmployerPositions";
      `, { transaction });

      console.log('Tabelas de backup criadas');

      // 2. Adicionar coluna companyId nas três tabelas
      await queryInterface.addColumn('ContactEmployers', 'companyId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'Companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      }, { transaction });

      await queryInterface.addColumn('ContactPositions', 'companyId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'Companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      }, { transaction });

      await queryInterface.addColumn('EmployerPositions', 'companyId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'Companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      }, { transaction });

      console.log('Colunas companyId adicionadas');

      // 3. Atualizar companyId nas tabelas principais com base nos relacionamentos existentes
      
      // 3.1 Atualizar ContactEmployers com base nos contatos associados
      await queryInterface.sequelize.query(`
        UPDATE "ContactEmployers" CE
        SET "companyId" = (
          SELECT C."companyId" 
          FROM "Contacts" C 
          WHERE C."employerId" = CE.id 
          LIMIT 1
        )
        WHERE EXISTS (
          SELECT 1 
          FROM "Contacts" C 
          WHERE C."employerId" = CE.id
        );
      `, { transaction });

      // 3.2 Atualizar ContactPositions com base nos contatos associados
      await queryInterface.sequelize.query(`
        UPDATE "ContactPositions" CP
        SET "companyId" = (
          SELECT C."companyId" 
          FROM "Contacts" C 
          WHERE C."positionId" = CP.id 
          LIMIT 1
        )
        WHERE EXISTS (
          SELECT 1 
          FROM "Contacts" C 
          WHERE C."positionId" = CP.id
        );
      `, { transaction });

      // 3.3 Atualizar EmployerPositions com base no companyId do employer
      await queryInterface.sequelize.query(`
        UPDATE "EmployerPositions" EP
        SET "companyId" = (
          SELECT CE."companyId"
          FROM "ContactEmployers" CE
          WHERE CE.id = EP."employerId"
        );
      `, { transaction });

      console.log('Dados de companyId atualizados com base nos relacionamentos');

      // 4. Tratar registros que não foram associados a nenhuma companyId
      // Atribuir à companyId = 1 por padrão
      await queryInterface.sequelize.query(`
        UPDATE "ContactEmployers" SET "companyId" = 1 WHERE "companyId" IS NULL;
        UPDATE "ContactPositions" SET "companyId" = 1 WHERE "companyId" IS NULL;
        UPDATE "EmployerPositions" SET "companyId" = 1 WHERE "companyId" IS NULL;
      `, { transaction });

      console.log('Registros sem companyId definido foram atribuídos à companyId 1');

      // 5. Duplicar entidades que pertencem a múltiplas empresas
      await queryInterface.sequelize.query(`
        -- Função para duplicar entidades quando necessário
        CREATE OR REPLACE FUNCTION duplicate_multi_company_entities() RETURNS void AS $$
        DECLARE
            employer_row RECORD;
            position_row RECORD;
            new_id INTEGER;
        BEGIN
            -- Duplicar ContactEmployers
            FOR employer_row IN 
                SELECT 
                    CE.id, CE.name, C."companyId"
                FROM 
                    "ContactEmployers" CE
                JOIN 
                    "Contacts" C ON C."employerId" = CE.id
                WHERE 
                    C."companyId" <> CE."companyId"
                GROUP BY 
                    CE.id, CE.name, C."companyId"
            LOOP
                -- Inserir o duplicado
                INSERT INTO "ContactEmployers" (name, "companyId", "createdAt", "updatedAt")
                VALUES (employer_row.name, employer_row."companyId", NOW(), NOW())
                RETURNING id INTO new_id;
                
                -- Atualizar os contatos para apontar para o novo registro
                UPDATE "Contacts"
                SET "employerId" = new_id
                WHERE "employerId" = employer_row.id
                AND "companyId" = employer_row."companyId";
            END LOOP;
            
            -- Duplicar ContactPositions
            FOR position_row IN 
                SELECT 
                    CP.id, CP.name, C."companyId"
                FROM 
                    "ContactPositions" CP
                JOIN 
                    "Contacts" C ON C."positionId" = CP.id
                WHERE 
                    C."companyId" <> CP."companyId"
                GROUP BY 
                    CP.id, CP.name, C."companyId"
            LOOP
                -- Inserir o duplicado
                INSERT INTO "ContactPositions" (name, "companyId", "createdAt", "updatedAt")
                VALUES (position_row.name, position_row."companyId", NOW(), NOW())
                RETURNING id INTO new_id;
                
                -- Atualizar os contatos para apontar para o novo registro
                UPDATE "Contacts"
                SET "positionId" = new_id
                WHERE "positionId" = position_row.id
                AND "companyId" = position_row."companyId";
            END LOOP;
        END;
        $$ LANGUAGE plpgsql;

        -- Executar a função
        SELECT duplicate_multi_company_entities();

        -- Remover a função após uso
        DROP FUNCTION duplicate_multi_company_entities();
      `, { transaction });

      console.log('Entidades que pertencem a múltiplas empresas foram duplicadas');

      // 6. Modificar as colunas para NOT NULL
      await queryInterface.sequelize.query(`
        ALTER TABLE "ContactEmployers" ALTER COLUMN "companyId" SET NOT NULL;
        ALTER TABLE "ContactPositions" ALTER COLUMN "companyId" SET NOT NULL;
        ALTER TABLE "EmployerPositions" ALTER COLUMN "companyId" SET NOT NULL;
      `, { transaction });

      console.log('Colunas companyId definidas como NOT NULL');

      // 7. Adicionar índices para melhor performance
      await queryInterface.addIndex('ContactEmployers', ['companyId'], { transaction });
      await queryInterface.addIndex('ContactPositions', ['companyId'], { transaction });
      await queryInterface.addIndex('EmployerPositions', ['companyId'], { transaction });

      console.log('Índices adicionados nas colunas companyId');

      // Commit da transação
      await transaction.commit();
      return Promise.resolve();
    } catch (error) {
      // Rollback em caso de erro
      await transaction.rollback();
      console.error('Erro durante a migration:', error);
      return Promise.reject(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1. Remover índices
      await queryInterface.removeIndex('ContactEmployers', ['companyId'], { transaction });
      await queryInterface.removeIndex('ContactPositions', ['companyId'], { transaction });
      await queryInterface.removeIndex('EmployerPositions', ['companyId'], { transaction });

      // 2. Remover colunas
      await queryInterface.removeColumn('ContactEmployers', 'companyId', { transaction });
      await queryInterface.removeColumn('ContactPositions', 'companyId', { transaction });
      await queryInterface.removeColumn('EmployerPositions', 'companyId', { transaction });

      // 3. Restaurar dados dos backups (opcional)
      await queryInterface.sequelize.query(`
        TRUNCATE TABLE "ContactEmployers";
        INSERT INTO "ContactEmployers" SELECT * FROM "ContactEmployers_backup";
        
        TRUNCATE TABLE "ContactPositions";
        INSERT INTO "ContactPositions" SELECT * FROM "ContactPositions_backup";
        
        TRUNCATE TABLE "EmployerPositions";
        INSERT INTO "EmployerPositions" SELECT * FROM "EmployerPositions_backup";
      `, { transaction });

      // 4. Remover tabelas de backup
      await queryInterface.sequelize.query(`
        DROP TABLE "ContactEmployers_backup";
        DROP TABLE "ContactPositions_backup";
        DROP TABLE "EmployerPositions_backup";
      `, { transaction });

      // Commit da transação
      await transaction.commit();
      return Promise.resolve();
    } catch (error) {
      // Rollback em caso de erro
      await transaction.rollback();
      console.error('Erro durante o rollback da migration:', error);
      return Promise.reject(error);
    }
  }
};