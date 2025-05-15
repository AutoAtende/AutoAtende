module.exports = {
    up: async (queryInterface, Sequelize) => {
      // Verifica se a tabela existe através de uma query direta
      try {
        await queryInterface.describeTable('TaskAttachments');
      } catch (error) {
        // Se a tabela não existe, cria ela
        await queryInterface.createTable('TaskAttachments', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
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
            references: { model: 'Tasks', key: 'id' },
            onDelete: 'CASCADE'
          },
          uploadedBy: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'Users', key: 'id' },
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
        });
        return;
      }
  
      // A partir daqui sabemos que a tabela existe
      // Verifica e adiciona as colunas necessárias
      const columns = await queryInterface.describeTable('TaskAttachments');
      
      const columnUpdates = [];
  
      if (!columns.filename) {
        columnUpdates.push(queryInterface.addColumn('TaskAttachments', 'filename', {
          type: Sequelize.STRING,
          allowNull: false
        }));
      }
  
      if (!columns.originalName) {
        columnUpdates.push(queryInterface.addColumn('TaskAttachments', 'originalName', {
          type: Sequelize.STRING,
          allowNull: false
        }));
      }
  
      if (!columns.filePath) {
        columnUpdates.push(queryInterface.addColumn('TaskAttachments', 'filePath', {
          type: Sequelize.STRING,
          allowNull: false
        }));
      }
  
      if (!columns.mimeType) {
        columnUpdates.push(queryInterface.addColumn('TaskAttachments', 'mimeType', {
          type: Sequelize.STRING,
          allowNull: false
        }));
      }
  
      if (!columns.size) {
        columnUpdates.push(queryInterface.addColumn('TaskAttachments', 'size', {
          type: Sequelize.INTEGER,
          allowNull: false
        }));
      }
  
      if (!columns.taskId) {
        columnUpdates.push(queryInterface.addColumn('TaskAttachments', 'taskId', {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'Tasks', key: 'id' },
          onDelete: 'CASCADE'
        }));
      }
  
      if (!columns.uploadedBy) {
        columnUpdates.push(queryInterface.addColumn('TaskAttachments', 'uploadedBy', {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'Users', key: 'id' },
          onDelete: 'SET NULL'
        }));
      }
  
      // Se existirem colunas antigas com nomes diferentes
      if (columns.userId) {
        // Copia os dados da coluna antiga para a nova
        await queryInterface.sequelize.query(`
          UPDATE "TaskAttachments" 
          SET "uploadedBy" = "userId" 
          WHERE "uploadedBy" IS NULL AND "userId" IS NOT NULL;
        `);
        
        columnUpdates.push(queryInterface.removeColumn('TaskAttachments', 'userId'));
      }
  
      if (columns.filepath) {
        // Copia os dados da coluna antiga para a nova
        await queryInterface.sequelize.query(`
          UPDATE "TaskAttachments" 
          SET "filePath" = "filepath" 
          WHERE "filePath" IS NULL AND "filepath" IS NOT NULL;
        `);
        
        columnUpdates.push(queryInterface.removeColumn('TaskAttachments', 'filepath'));
      }
  
      return Promise.all(columnUpdates);
    },
  
    down: async (queryInterface, Sequelize) => {
      // Em caso de rollback, restaura as colunas antigas se necessário
      const columns = await queryInterface.describeTable('TaskAttachments');
      
      const columnUpdates = [];
  
      if (columns.uploadedBy) {
        columnUpdates.push(queryInterface.removeColumn('TaskAttachments', 'uploadedBy'));
      }
  
      if (columns.filePath) {
        columnUpdates.push(queryInterface.renameColumn('TaskAttachments', 'filePath', 'filepath'));
      }
  
      return Promise.all(columnUpdates);
    }
  };