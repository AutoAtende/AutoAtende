'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      const logger = (message) => console.log(`[Migração Tarefas] ${message}`);
      
      // Função auxiliar para verificar se uma tabela existe
      const tableExists = async (tableName) => {
        try {
          const result = await queryInterface.sequelize.query(
            `SELECT 1 FROM information_schema.tables WHERE table_name = '${tableName}';`,
            { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
          );
          return result.length > 0;
        } catch (error) {
          logger(`Erro ao verificar se tabela ${tableName} existe: ${error.message}`);
          return false;
        }
      };

      // Função para verificar se uma coluna existe em uma tabela
      const columnExists = async (tableName, columnName) => {
        try {
          const result = await queryInterface.sequelize.query(
            `SELECT column_name FROM information_schema.columns 
             WHERE table_name = '${tableName}' AND column_name = '${columnName}';`,
            { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
          );
          return result.length > 0;
        } catch (error) {
          logger(`Erro ao verificar coluna ${columnName} na tabela ${tableName}: ${error.message}`);
          return false;
        }
      };

      // Função para obter o tipo de dados de uma coluna
      const getColumnType = async (tableName, columnName) => {
        try {
          const result = await queryInterface.sequelize.query(
            `SELECT data_type, character_maximum_length, is_nullable 
             FROM information_schema.columns 
             WHERE table_name = '${tableName}' AND column_name = '${columnName}';`,
            { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
          );
          
          if (result.length > 0) {
            return {
              dataType: result[0].data_type,
              maxLength: result[0].character_maximum_length,
              isNullable: result[0].is_nullable === 'YES'
            };
          }
          return null;
        } catch (error) {
          logger(`Erro ao obter tipo da coluna ${columnName} na tabela ${tableName}: ${error.message}`);
          return null;
        }
      };

      // 1. Verificar/Criar a tabela Tasks
      if (!(await tableExists('Tasks'))) {
        logger('Criando tabela Tasks');
        await queryInterface.createTable('Tasks', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          title: {
            type: Sequelize.STRING,
            allowNull: false
          },
          text: {
            type: Sequelize.TEXT,
            allowNull: true
          },
          dueDate: {
            type: Sequelize.DATE,
            allowNull: true
          },
          color: {
            type: Sequelize.STRING,
            allowNull: true
          },
          done: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
          },
          companyId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'Companies',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          taskCategoryId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'TaskCategories',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
          },
          createdBy: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'Users',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
          },
          responsibleUserId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'Users',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
          },
          notifiedOverdue: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
          },
          lastNotificationSent: {
            type: Sequelize.DATE,
            allowNull: true
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false
          }
        }, { transaction });
        
        logger('Tabela Tasks criada com sucesso');
      } else {
        logger('Tabela Tasks já existe, verificando colunas');
        
        // Verificar se a coluna title existe
        const titleExists = await columnExists('Tasks', 'title');
        
        if (titleExists) {
          // Atualizar registros com title NULL
          logger('Atualizando registros com title NULL para "Tarefa Sem Título"');
          await queryInterface.sequelize.query(
            `UPDATE "Tasks" SET "title" = 'Tarefa Sem Título' WHERE "title" IS NULL;`,
            { transaction }
          );
          
          // Verificar se a coluna já é NOT NULL
          const titleInfo = await getColumnType('Tasks', 'title');
          if (titleInfo && titleInfo.isNullable) {
            logger('Alterando coluna title para NOT NULL');
            await queryInterface.sequelize.query(
              `ALTER TABLE "Tasks" ALTER COLUMN "title" SET NOT NULL;`,
              { transaction }
            );
          }
        } else {
          // Adicionar coluna title temporariamente como nullable
          logger('Adicionando coluna title como nullable primeiro');
          await queryInterface.addColumn('Tasks', 'title', {
            type: Sequelize.STRING,
            allowNull: true
          }, { transaction });
          
          // Atualizar registros existentes
          logger('Preenchendo valores padrão para a coluna title');
          await queryInterface.sequelize.query(
            `UPDATE "Tasks" SET "title" = 'Tarefa Sem Título' WHERE "title" IS NULL;`,
            { transaction }
          );
          
          // Alterar coluna para NOT NULL
          logger('Alterando coluna title para NOT NULL');
          await queryInterface.sequelize.query(
            `ALTER TABLE "Tasks" ALTER COLUMN "title" SET NOT NULL;`,
            { transaction }
          );
        }
        
        // Verificar e adicionar as demais colunas faltantes na tabela Tasks
        const requiredColumns = [
          { name: 'text', type: Sequelize.TEXT, allowNull: true, defaultValue: null },
          { name: 'dueDate', type: Sequelize.DATE, allowNull: true, defaultValue: null },
          { name: 'color', type: Sequelize.STRING, allowNull: true, defaultValue: null },
          { name: 'done', type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          { name: 'companyId', type: Sequelize.INTEGER, allowNull: false, defaultValue: null },
          { name: 'taskCategoryId', type: Sequelize.INTEGER, allowNull: true, defaultValue: null },
          { name: 'createdBy', type: Sequelize.INTEGER, allowNull: false, defaultValue: null },
          { name: 'responsibleUserId', type: Sequelize.INTEGER, allowNull: true, defaultValue: null },
          { name: 'notifiedOverdue', type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          { name: 'lastNotificationSent', type: Sequelize.DATE, allowNull: true, defaultValue: null },
          { name: 'createdAt', type: Sequelize.DATE, allowNull: false, defaultValue: null },
          { name: 'updatedAt', type: Sequelize.DATE, allowNull: false, defaultValue: null }
        ];
        
        for (const column of requiredColumns) {
          if (!(await columnExists('Tasks', column.name))) {
            logger(`Adicionando coluna ${column.name} à tabela Tasks`);
            
            // Para colunas NOT NULL, precisamos definir um valor padrão temporário
            const temporaryAllowNull = column.allowNull === false;
            
            if (temporaryAllowNull) {
              // Primeiro adicionar como nullable
              await queryInterface.addColumn('Tasks', column.name, {
                type: column.type,
                allowNull: true,
                defaultValue: column.defaultValue
              }, { transaction });
              
              // Preencher com valores padrão adequados
              let defaultValue;
              
              if (column.name === 'companyId') {
                // Identificar uma company_id válida
                const companies = await queryInterface.sequelize.query(
                  `SELECT MIN(id) as id FROM "Companies";`,
                  { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
                );
                defaultValue = companies.length > 0 && companies[0].id ? companies[0].id : 1;
              } else if (column.name === 'createdBy') {
                // Identificar um user_id válido
                const users = await queryInterface.sequelize.query(
                  `SELECT MIN(id) as id FROM "Users";`,
                  { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
                );
                defaultValue = users.length > 0 && users[0].id ? users[0].id : 1;
              } else if (column.name === 'done' || column.name === 'notifiedOverdue') {
                defaultValue = false;
              } else if (column.name === 'createdAt' || column.name === 'updatedAt') {
                defaultValue = new Date();
              }
              
              // Atualizar registros existentes
              if (defaultValue !== undefined) {
                let updateValue;
                if (typeof defaultValue === 'string') {
                  updateValue = `'${defaultValue}'`;
                } else if (defaultValue instanceof Date) {
                  updateValue = `'${defaultValue.toISOString()}'`;
                } else {
                  updateValue = defaultValue;
                }
                
                await queryInterface.sequelize.query(
                  `UPDATE "Tasks" SET "${column.name}" = ${updateValue} WHERE "${column.name}" IS NULL;`,
                  { transaction }
                );
              }
              
              // Depois alterar para NOT NULL
              await queryInterface.sequelize.query(
                `ALTER TABLE "Tasks" ALTER COLUMN "${column.name}" SET NOT NULL;`,
                { transaction }
              );
            } else {
              // Para colunas nullable, adicionar diretamente
              await queryInterface.addColumn('Tasks', column.name, {
                type: column.type,
                allowNull: column.allowNull,
                defaultValue: column.defaultValue
              }, { transaction });
            }
            
            logger(`Coluna ${column.name} adicionada com sucesso`);
          } else {
            // Verificar o tipo da coluna e ajustar se necessário
            const columnInfo = await getColumnType('Tasks', column.name);
            if (columnInfo) {
              // Lógica para verificar compatibilidade de tipos
              if (column.name === 'text' && columnInfo.dataType !== 'text') {
                logger(`Alterando tipo da coluna ${column.name} para TEXT`);
                await queryInterface.changeColumn('Tasks', column.name, {
                  type: Sequelize.TEXT,
                  allowNull: column.allowNull
                }, { transaction });
              }
            }
          }
        }
      }

      // 2. Verificar/Criar a tabela TaskCategories
      if (!(await tableExists('TaskCategories'))) {
        logger('Criando tabela TaskCategories');
        
        await queryInterface.createTable('TaskCategories', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          name: {
            type: Sequelize.STRING,
            allowNull: false
          },
          companyId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'Companies',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false
          }
        }, { transaction });
        
        logger('Tabela TaskCategories criada com sucesso');
      } else {
        logger('Tabela TaskCategories já existe, verificando colunas');
        
        // Verificar e adicionar colunas faltantes
        const requiredColumns = [
          { name: 'name', type: Sequelize.STRING, allowNull: false, defaultValue: null },
          { name: 'companyId', type: Sequelize.INTEGER, allowNull: false, defaultValue: null },
          { name: 'createdAt', type: Sequelize.DATE, allowNull: false, defaultValue: null },
          { name: 'updatedAt', type: Sequelize.DATE, allowNull: false, defaultValue: null }
        ];
        
        for (const column of requiredColumns) {
          if (!(await columnExists('TaskCategories', column.name))) {
            logger(`Adicionando coluna ${column.name} à tabela TaskCategories`);
            
            // Se for NOT NULL, primeiro adicionar como nullable e definir valores
            if (!column.allowNull) {
              await queryInterface.addColumn('TaskCategories', column.name, {
                type: column.type,
                allowNull: true,
                defaultValue: column.defaultValue
              }, { transaction });
              
              let defaultValue;
              if (column.name === 'name') {
                defaultValue = "'Categoria Padrão'";
              } else if (column.name === 'companyId') {
                const companies = await queryInterface.sequelize.query(
                  `SELECT MIN(id) as id FROM "Companies";`,
                  { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
                );
                defaultValue = companies.length > 0 && companies[0].id ? companies[0].id : 1;
              } else if (column.name === 'createdAt' || column.name === 'updatedAt') {
                defaultValue = `'${new Date().toISOString()}'`;
              }
              
              if (defaultValue !== undefined) {
                await queryInterface.sequelize.query(
                  `UPDATE "TaskCategories" SET "${column.name}" = ${defaultValue} WHERE "${column.name}" IS NULL;`,
                  { transaction }
                );
              }
              
              await queryInterface.sequelize.query(
                `ALTER TABLE "TaskCategories" ALTER COLUMN "${column.name}" SET NOT NULL;`,
                { transaction }
              );
            } else {
              await queryInterface.addColumn('TaskCategories', column.name, {
                type: column.type,
                allowNull: column.allowNull,
                defaultValue: column.defaultValue
              }, { transaction });
            }
            
            logger(`Coluna ${column.name} adicionada com sucesso`);
          }
        }
      }

      // 3. Verificar/Criar a tabela TaskUsers
      if (!(await tableExists('TaskUsers'))) {
        logger('Criando tabela TaskUsers');
        
        await queryInterface.createTable('TaskUsers', {
          taskId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
              model: 'Tasks',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          userId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
              model: 'Users',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false
          }
        }, { transaction });
        
        logger('Tabela TaskUsers criada com sucesso');
      } else {
        logger('Tabela TaskUsers já existe, verificando colunas');
        
        // Verificar e adicionar colunas faltantes
        const requiredColumns = [
          { name: 'taskId', type: Sequelize.INTEGER, allowNull: false, primaryKey: true, defaultValue: null },
          { name: 'userId', type: Sequelize.INTEGER, allowNull: false, primaryKey: true, defaultValue: null },
          { name: 'createdAt', type: Sequelize.DATE, allowNull: false, defaultValue: null },
          { name: 'updatedAt', type: Sequelize.DATE, allowNull: false, defaultValue: null }
        ];
        
        for (const column of requiredColumns) {
          if (!(await columnExists('TaskUsers', column.name))) {
            logger(`Adicionando coluna ${column.name} à tabela TaskUsers`);
            
            // Se for NOT NULL, é uma tabela de junção, pode ser mais complexo
            // Neste caso, podemos precisar remover registros inválidos
            await queryInterface.addColumn('TaskUsers', column.name, {
              type: column.type,
              allowNull: true,
              primaryKey: column.primaryKey || false,
              defaultValue: column.defaultValue
            }, { transaction });
            
            // Para TaskUsers, é melhor remover registros inválidos
            if (!column.allowNull) {
              await queryInterface.sequelize.query(
                `DELETE FROM "TaskUsers" WHERE "${column.name}" IS NULL;`,
                { transaction }
              );
              
              await queryInterface.sequelize.query(
                `ALTER TABLE "TaskUsers" ALTER COLUMN "${column.name}" SET NOT NULL;`,
                { transaction }
              );
            }
            
            logger(`Coluna ${column.name} adicionada com sucesso`);
          }
        }
      }

      // 4. Verificar/Criar a tabela TaskNotes
      if (!(await tableExists('TaskNotes'))) {
        logger('Criando tabela TaskNotes');
        
        await queryInterface.createTable('TaskNotes', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          content: {
            type: Sequelize.TEXT,
            allowNull: false
          },
          taskId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'Tasks',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'Users',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false
          }
        }, { transaction });
        
        logger('Tabela TaskNotes criada com sucesso');
      } else {
        logger('Tabela TaskNotes já existe, verificando colunas');
        
        // Verificar e adicionar colunas faltantes usando a mesma lógica das tabelas anteriores
        const requiredColumns = [
          { name: 'content', type: Sequelize.TEXT, allowNull: false, defaultValue: null },
          { name: 'taskId', type: Sequelize.INTEGER, allowNull: false, defaultValue: null },
          { name: 'userId', type: Sequelize.INTEGER, allowNull: false, defaultValue: null },
          { name: 'createdAt', type: Sequelize.DATE, allowNull: false, defaultValue: null },
          { name: 'updatedAt', type: Sequelize.DATE, allowNull: false, defaultValue: null }
        ];
        
        for (const column of requiredColumns) {
          if (!(await columnExists('TaskNotes', column.name))) {
            logger(`Adicionando coluna ${column.name} à tabela TaskNotes`);
            
            if (!column.allowNull) {
              await queryInterface.addColumn('TaskNotes', column.name, {
                type: column.type,
                allowNull: true,
                defaultValue: column.defaultValue
              }, { transaction });
              
              let defaultValue;
              if (column.name === 'content') {
                defaultValue = "'Sem conteúdo'";
              } else if (column.name === 'taskId' || column.name === 'userId') {
                // Para estas colunas, é melhor remover os registros inválidos
                await queryInterface.sequelize.query(
                  `DELETE FROM "TaskNotes" WHERE "${column.name}" IS NULL;`,
                  { transaction }
                );
              } else if (column.name === 'createdAt' || column.name === 'updatedAt') {
                defaultValue = `'${new Date().toISOString()}'`;
              }
              
              if (defaultValue !== undefined) {
                await queryInterface.sequelize.query(
                  `UPDATE "TaskNotes" SET "${column.name}" = ${defaultValue} WHERE "${column.name}" IS NULL;`,
                  { transaction }
                );
              }
              
              await queryInterface.sequelize.query(
                `ALTER TABLE "TaskNotes" ALTER COLUMN "${column.name}" SET NOT NULL;`,
                { transaction }
              );
            } else {
              await queryInterface.addColumn('TaskNotes', column.name, {
                type: column.type,
                allowNull: column.allowNull,
                defaultValue: column.defaultValue
              }, { transaction });
            }
            
            logger(`Coluna ${column.name} adicionada com sucesso`);
          }
        }
      }

      // 5. Verificar/Criar a tabela TaskAttachments
      if (!(await tableExists('TaskAttachments'))) {
        logger('Criando tabela TaskAttachments');
        
        await queryInterface.createTable('TaskAttachments', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          filename: {
            type: Sequelize.STRING,
            allowNull: false
          },
          originalName: {
            type: Sequelize.STRING,
            allowNull: false
          },
          filePath: {
            type: Sequelize.STRING,
            allowNull: false
          },
          mimeType: {
            type: Sequelize.STRING,
            allowNull: false
          },
          size: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          taskId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'Tasks',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          uploadedBy: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'Users',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false
          }
        }, { transaction });
        
        logger('Tabela TaskAttachments criada com sucesso');
      } else {
        logger('Tabela TaskAttachments já existe, verificando colunas');
        
        // Verificar e adicionar colunas faltantes
        const requiredColumns = [
          { name: 'filename', type: Sequelize.STRING, allowNull: false, defaultValue: null },
          { name: 'originalName', type: Sequelize.STRING, allowNull: false, defaultValue: null },
          { name: 'filePath', type: Sequelize.STRING, allowNull: false, defaultValue: null },
          { name: 'mimeType', type: Sequelize.STRING, allowNull: false, defaultValue: null },
          { name: 'size', type: Sequelize.INTEGER, allowNull: false, defaultValue: null },
          { name: 'taskId', type: Sequelize.INTEGER, allowNull: false, defaultValue: null },
          { name: 'uploadedBy', type: Sequelize.INTEGER, allowNull: false, defaultValue: null },
          { name: 'createdAt', type: Sequelize.DATE, allowNull: false, defaultValue: null }
        ];
        
        for (const column of requiredColumns) {
          if (!(await columnExists('TaskAttachments', column.name))) {
            logger(`Adicionando coluna ${column.name} à tabela TaskAttachments`);
            
            if (!column.allowNull) {
              await queryInterface.addColumn('TaskAttachments', column.name, {
                type: column.type,
                allowNull: true,
                defaultValue: column.defaultValue
              }, { transaction });
              
              // Para anexos, remover registros inválidos é a melhor opção
              await queryInterface.sequelize.query(
                `DELETE FROM "TaskAttachments" WHERE "${column.name}" IS NULL;`,
                { transaction }
              );
              
              await queryInterface.sequelize.query(
                `ALTER TABLE "TaskAttachments" ALTER COLUMN "${column.name}" SET NOT NULL;`,
                { transaction }
              );
            } else {
              await queryInterface.addColumn('TaskAttachments', column.name, {
                type: column.type,
                allowNull: column.allowNull,
                defaultValue: column.defaultValue
              }, { transaction });
            }
            
            logger(`Coluna ${column.name} adicionada com sucesso`);
          }
        }
      }

      // 6. Verificar/Criar a tabela TaskTimelines
      if (!(await tableExists('TaskTimelines'))) {
        logger('Criando tabela TaskTimelines');
        
        await queryInterface.createTable('TaskTimelines', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          action: {
            type: Sequelize.STRING,
            allowNull: false
          },
          details: {
            type: Sequelize.JSON,
            allowNull: true
          },
          taskId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'Tasks',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'Users',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false
          }
        }, { transaction });
        
        logger('Tabela TaskTimelines criada com sucesso');
      } else {
        logger('Tabela TaskTimelines já existe, verificando colunas');
        
        // Verificar e adicionar colunas faltantes
        const requiredColumns = [
          { name: 'action', type: Sequelize.STRING, allowNull: false, defaultValue: null },
          { name: 'details', type: Sequelize.JSON, allowNull: true, defaultValue: null },
          { name: 'taskId', type: Sequelize.INTEGER, allowNull: false, defaultValue: null },
          { name: 'userId', type: Sequelize.INTEGER, allowNull: false, defaultValue: null },
          { name: 'createdAt', type: Sequelize.DATE, allowNull: false, defaultValue: null },
          { name: 'updatedAt', type: Sequelize.DATE, allowNull: false, defaultValue: null }
        ];
        
        for (const column of requiredColumns) {
          if (!(await columnExists('TaskTimelines', column.name))) {
            logger(`Adicionando coluna ${column.name} à tabela TaskTimelines`);
            
            if (!column.allowNull) {
              await queryInterface.addColumn('TaskTimelines', column.name, {
                type: column.type,
                allowNull: true,
                defaultValue: column.defaultValue
              }, { transaction });
              
              let defaultValue;
              if (column.name === 'action') {
                defaultValue = "'system'";
              } else if (column.name === 'taskId' || column.name === 'userId') {
                // Para estas colunas, remover registros inválidos
                await queryInterface.sequelize.query(
                  `DELETE FROM "TaskTimelines" WHERE "${column.name}" IS NULL;`,
                  { transaction }
                );
              } else if (column.name === 'createdAt' || column.name === 'updatedAt') {
                defaultValue = `'${new Date().toISOString()}'`;
              }
              
              if (defaultValue !== undefined) {
                await queryInterface.sequelize.query(
                  `UPDATE "TaskTimelines" SET "${column.name}" = ${defaultValue} WHERE "${column.name}" IS NULL;`,
                  { transaction }
                );
              }
              
              await queryInterface.sequelize.query(
                `ALTER TABLE "TaskTimelines" ALTER COLUMN "${column.name}" SET NOT NULL;`,
                { transaction }
              );
            } else {
              await queryInterface.addColumn('TaskTimelines', column.name, {
                type: column.type,
                allowNull: column.allowNull,
                defaultValue: column.defaultValue
              }, { transaction });
            }
            
            logger(`Coluna ${column.name} adicionada com sucesso`);
          }
        }
      }

      logger('Migração completa executada com sucesso');
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Como esta é uma migração de verificação e reparação,
    // não faz sentido reverter as alterações. Porém, podemos
    // fornecer uma opção de reverter as tabelas se realmente necessário.
    return queryInterface.sequelize.transaction(async (transaction) => {
      console.log('Revertendo migração - ATENÇÃO: Isso pode resultar em perda de dados!');
      
      // Remover as tabelas na ordem inversa de dependência
      await queryInterface.dropTable('TaskTimelines', { cascade: true, transaction });
      await queryInterface.dropTable('TaskAttachments', { cascade: true, transaction });
      await queryInterface.dropTable('TaskNotes', { cascade: true, transaction });
      await queryInterface.dropTable('TaskUsers', { cascade: true, transaction });
      await queryInterface.dropTable('Tasks', { cascade: true, transaction });
      await queryInterface.dropTable('TaskCategories', { cascade: true, transaction });
      
      console.log('Migração revertida com sucesso');
    });
  }
};