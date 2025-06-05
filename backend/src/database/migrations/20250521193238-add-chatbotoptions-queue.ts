// migrations/20250605180000-add-advanced-options-to-queue-options.ts
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Iniciar uma transação única
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Descrever tabela para verificar colunas existentes
      const tableDescription = await queryInterface.describeTable('QueueOptions');

      //
      // 1) optionType (ENUM) + coluna
      //
      if (!tableDescription.optionType) {
        // 1.1) Verificar se o tipo ENUM 'enum_QueueOptions_optionType' já existe
        const [enumOptionExists]: any[] = await queryInterface.sequelize.query(
          `SELECT 1
           FROM pg_type
           WHERE typname = 'enum_QueueOptions_optionType'`,
          { transaction }
        );

        // 1.2) Criar o tipo ENUM caso não exista
        if (enumOptionExists.length === 0) {
          await queryInterface.sequelize.query(
            `CREATE TYPE "enum_QueueOptions_optionType" AS ENUM (
              'text',
              'audio',
              'video',
              'image',
              'document',
              'contact',
              'transfer_queue',
              'transfer_user',
              'transfer_whatsapp',
              'validation',
              'conditional'
            );`,
            { transaction }
          );
        }

        // 1.3) Adicionar a coluna usando SQL bruto, referenciando o ENUM existente
        //      Utilizamos "ADD COLUMN IF NOT EXISTS" para evitar erro se for executado duas vezes
        await queryInterface.sequelize.query(
          `ALTER TABLE "QueueOptions"
           ADD COLUMN IF NOT EXISTS "optionType" "enum_QueueOptions_optionType"
           NOT NULL DEFAULT 'text';`,
          { transaction }
        );
      }

      //
      // 2) targetQueueId (FK para Queues)
      //
      if (!tableDescription.targetQueueId) {
        await queryInterface.addColumn(
          'QueueOptions',
          'targetQueueId',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'Queues',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          { transaction }
        );
      }

      //
      // 3) targetUserId (FK para Users)
      //
      if (!tableDescription.targetUserId) {
        await queryInterface.addColumn(
          'QueueOptions',
          'targetUserId',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'Users',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          { transaction }
        );
      }

      //
      // 4) targetWhatsappId (FK para Whatsapps)
      //
      if (!tableDescription.targetWhatsappId) {
        await queryInterface.addColumn(
          'QueueOptions',
          'targetWhatsappId',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'Whatsapps',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          { transaction }
        );
      }

      //
      // 5) contactId (FK para Contacts)
      //
      if (!tableDescription.contactId) {
        await queryInterface.addColumn(
          'QueueOptions',
          'contactId',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'Contacts',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          { transaction }
        );
      }

      //
      // 6) validationType (ENUM) + coluna
      //
      if (!tableDescription.validationType) {
        // 6.1) Verificar se o tipo ENUM 'enum_QueueOptions_validationType' já existe
        const [enumValidationExists]: any[] = await queryInterface.sequelize.query(
          `SELECT 1
           FROM pg_type
           WHERE typname = 'enum_QueueOptions_validationType'`,
          { transaction }
        );

        // 6.2) Criar o tipo ENUM caso não exista
        if (enumValidationExists.length === 0) {
          await queryInterface.sequelize.query(
            `CREATE TYPE "enum_QueueOptions_validationType" AS ENUM (
              'cpf',
              'email',
              'phone',
              'custom'
            );`,
            { transaction }
          );
        }

        // 6.3) Adicionar a coluna usando SQL bruto, referenciando o ENUM
        await queryInterface.sequelize.query(
          `ALTER TABLE "QueueOptions"
           ADD COLUMN IF NOT EXISTS "validationType" "enum_QueueOptions_validationType"
           NULL;`,
          { transaction }
        );
      }

      //
      // 7) validationRegex (TEXT)
      //
      if (!tableDescription.validationRegex) {
        await queryInterface.addColumn(
          'QueueOptions',
          'validationRegex',
          {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          { transaction }
        );
      }

      //
      // 8) validationErrorMessage (STRING)
      //
      if (!tableDescription.validationErrorMessage) {
        await queryInterface.addColumn(
          'QueueOptions',
          'validationErrorMessage',
          {
            type: Sequelize.STRING,
            allowNull: true,
          },
          { transaction }
        );
      }

      //
      // 9) conditionalLogic (JSONB)
      //
      if (!tableDescription.conditionalLogic) {
        await queryInterface.addColumn(
          'QueueOptions',
          'conditionalLogic',
          {
            type: Sequelize.JSONB,
            allowNull: true,
          },
          { transaction }
        );
      }

      //
      // 10) conditionalVariable (STRING)
      //
      if (!tableDescription.conditionalVariable) {
        await queryInterface.addColumn(
          'QueueOptions',
          'conditionalVariable',
          {
            type: Sequelize.STRING,
            allowNull: true,
          },
          { transaction }
        );
      }

      //
      // 11) orderPosition (INTEGER)
      //
      if (!tableDescription.orderPosition) {
        await queryInterface.addColumn(
          'QueueOptions',
          'orderPosition',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          { transaction }
        );
      }

      // Se chegar até aqui sem erro, a transação é commitada automaticamente.
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Reversão: remover todas as colunas adicionadas e depois os tipos ENUM
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1) Remover coluna 'orderPosition'
      await queryInterface.removeColumn('QueueOptions', 'orderPosition', { transaction });

      // 2) Remover coluna 'conditionalVariable'
      await queryInterface.removeColumn('QueueOptions', 'conditionalVariable', { transaction });

      // 3) Remover coluna 'conditionalLogic'
      await queryInterface.removeColumn('QueueOptions', 'conditionalLogic', { transaction });

      // 4) Remover coluna 'validationErrorMessage'
      await queryInterface.removeColumn('QueueOptions', 'validationErrorMessage', { transaction });

      // 5) Remover coluna 'validationRegex'
      await queryInterface.removeColumn('QueueOptions', 'validationRegex', { transaction });

      // 6) Remover coluna 'validationType'
      await queryInterface.removeColumn('QueueOptions', 'validationType', { transaction });

      // 7) Remover coluna 'contactId'
      await queryInterface.removeColumn('QueueOptions', 'contactId', { transaction });

      // 8) Remover coluna 'targetWhatsappId'
      await queryInterface.removeColumn('QueueOptions', 'targetWhatsappId', { transaction });

      // 9) Remover coluna 'targetUserId'
      await queryInterface.removeColumn('QueueOptions', 'targetUserId', { transaction });

      // 10) Remover coluna 'targetQueueId'
      await queryInterface.removeColumn('QueueOptions', 'targetQueueId', { transaction });

      // 11) Remover coluna 'optionType'
      await queryInterface.sequelize.query(
        `ALTER TABLE "QueueOptions" DROP COLUMN IF EXISTS "optionType";`,
        { transaction }
      );

      // 12) Remover tipos ENUM, apenas se existirem
      await queryInterface.sequelize.query(
        `DROP TYPE IF EXISTS "enum_QueueOptions_optionType";`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `DROP TYPE IF EXISTS "enum_QueueOptions_validationType";`,
        { transaction }
      );
    });
  },
};
