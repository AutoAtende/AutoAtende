// migrations/YYYYMMDDHHMMSS-add-advanced-options-to-queue-options.ts
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Verificar se as colunas já existem antes de adicionar
      const tableDescription = await queryInterface.describeTable('QueueOptions');
      
      // Verificar e criar ENUM optionType se não existir
      if (!tableDescription.optionType) {
        // Verificar se o tipo ENUM já existe
        const [enumExists] = await queryInterface.sequelize.query(
          `SELECT 1 FROM pg_type WHERE typname = 'enum_QueueOptions_optionType'`,
          { transaction }
        );
        
        if (enumExists.length === 0) {
          // Criar o tipo ENUM se não existir
          await queryInterface.sequelize.query(
            `CREATE TYPE "enum_QueueOptions_optionType" AS ENUM(
              'text', 'audio', 'video', 'image', 'document', 'contact',
              'transfer_queue', 'transfer_user', 'transfer_whatsapp',
              'validation', 'conditional'
            )`,
            { transaction }
          );
        }
        
        await queryInterface.addColumn('QueueOptions', 'optionType', {
          type: Sequelize.ENUM(
            'text', 'audio', 'video', 'image', 'document', 'contact',
            'transfer_queue', 'transfer_user', 'transfer_whatsapp',
            'validation', 'conditional'
          ),
          defaultValue: 'text',
          allowNull: false
        }, { transaction });
      }

      // Verificar e adicionar targetQueueId se não existir
      if (!tableDescription.targetQueueId) {
        // Verificar se a tabela Queues existe
        const [queuesTableExists] = await queryInterface.sequelize.query(
          `SELECT 1 FROM information_schema.tables WHERE table_name = 'Queues'`,
          { transaction }
        );
        
        await queryInterface.addColumn('QueueOptions', 'targetQueueId', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: queuesTableExists.length > 0 ? { 
            model: 'Queues', 
            key: 'id' 
          } : undefined,
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        }, { transaction });
      }

      // Verificar e adicionar targetUserId se não existir
      if (!tableDescription.targetUserId) {
        // Verificar se a tabela Users existe
        const [usersTableExists] = await queryInterface.sequelize.query(
          `SELECT 1 FROM information_schema.tables WHERE table_name = 'Users'`,
          { transaction }
        );
        
        await queryInterface.addColumn('QueueOptions', 'targetUserId', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: usersTableExists.length > 0 ? { 
            model: 'Users', 
            key: 'id' 
          } : undefined,
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        }, { transaction });
      }

      // Verificar e adicionar targetWhatsappId se não existir
      if (!tableDescription.targetWhatsappId) {
        // Verificar se a tabela Whatsapps existe
        const [whatsappsTableExists] = await queryInterface.sequelize.query(
          `SELECT 1 FROM information_schema.tables WHERE table_name = 'Whatsapps'`,
          { transaction }
        );
        
        await queryInterface.addColumn('QueueOptions', 'targetWhatsappId', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: whatsappsTableExists.length > 0 ? { 
            model: 'Whatsapps', 
            key: 'id' 
          } : undefined,
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        }, { transaction });
      }

      // Verificar e adicionar contactId se não existir
      if (!tableDescription.contactId) {
        // Verificar se a tabela Contacts existe
        const [contactsTableExists] = await queryInterface.sequelize.query(
          `SELECT 1 FROM information_schema.tables WHERE table_name = 'Contacts'`,
          { transaction }
        );
        
        await queryInterface.addColumn('QueueOptions', 'contactId', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: contactsTableExists.length > 0 ? { 
            model: 'Contacts', 
            key: 'id' 
          } : undefined,
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        }, { transaction });
      }

      // Verificar e criar ENUM validationType se não existir
      if (!tableDescription.validationType) {
        // Verificar se o tipo ENUM já existe
        const [validationEnumExists] = await queryInterface.sequelize.query(
          `SELECT 1 FROM pg_type WHERE typname = 'enum_QueueOptions_validationType'`,
          { transaction }
        );
        
        if (validationEnumExists.length === 0) {
          // Criar o tipo ENUM se não existir
          await queryInterface.sequelize.query(
            `CREATE TYPE "enum_QueueOptions_validationType" AS ENUM('cpf', 'email', 'phone', 'custom')`,
            { transaction }
          );
        }
        
        await queryInterface.addColumn('QueueOptions', 'validationType', {
          type: Sequelize.ENUM('cpf', 'email', 'phone', 'custom'),
          allowNull: true
        }, { transaction });
      }

      // Verificar e adicionar validationRegex se não existir
      if (!tableDescription.validationRegex) {
        await queryInterface.addColumn('QueueOptions', 'validationRegex', {
          type: Sequelize.TEXT,
          allowNull: true
        }, { transaction });
      }

      // Verificar e adicionar validationErrorMessage se não existir
      if (!tableDescription.validationErrorMessage) {
        await queryInterface.addColumn('QueueOptions', 'validationErrorMessage', {
          type: Sequelize.STRING,
          allowNull: true
        }, { transaction });
      }

      // Verificar e adicionar conditionalLogic se não existir
      if (!tableDescription.conditionalLogic) {
        await queryInterface.addColumn('QueueOptions', 'conditionalLogic', {
          type: Sequelize.JSONB,
          allowNull: true
        }, { transaction });
      }

      // Verificar e adicionar conditionalVariable se não existir
      if (!tableDescription.conditionalVariable) {
        await queryInterface.addColumn('QueueOptions', 'conditionalVariable', {
          type: Sequelize.STRING,
          allowNull: true
        }, { transaction });
      }

      // Verificar e adicionar orderPosition se não existir
      if (!tableDescription.orderPosition) {
        await queryInterface.addColumn('QueueOptions', 'orderPosition', {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: false
        }, { transaction });
      }

      await transaction.commit();
      console.log('✅ Migração executada com sucesso - Colunas avançadas adicionadas à QueueOptions');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro ao executar migração:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Verificar se as colunas existem antes de remover
      const tableDescription = await queryInterface.describeTable('QueueOptions');
      
      const columnsToRemove = [
        'optionType', 'targetQueueId', 'targetUserId', 'targetWhatsappId',
        'contactId', 'validationType', 'validationRegex', 'validationErrorMessage',
        'conditionalLogic', 'conditionalVariable', 'orderPosition'
      ];

      for (const column of columnsToRemove) {
        if (tableDescription[column]) {
          await queryInterface.removeColumn('QueueOptions', column, { transaction });
        }
      }

      // Remover ENUMs se existirem
      const enumsToCheck = [
        'enum_QueueOptions_optionType',
        'enum_QueueOptions_validationType'
      ];

      for (const enumName of enumsToCheck) {
        const [enumExists] = await queryInterface.sequelize.query(
          `SELECT 1 FROM pg_type WHERE typname = '${enumName}'`,
          { transaction }
        );
        
        if (enumExists.length > 0) {
          await queryInterface.sequelize.query(
            `DROP TYPE IF EXISTS "${enumName}" CASCADE`,
            { transaction }
          );
        }
      }

      await transaction.commit();
      console.log('✅ Rollback executado com sucesso - Colunas avançadas removidas da QueueOptions');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro ao executar rollback:', error.message);
      throw error;
    }
  }
};