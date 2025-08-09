// migrations/20250605124300-add-advanced-options-to-queue-options.ts
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Inicia uma única transação para todo o processo
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 2) Adicionar coluna 'targetQueueId' (FK para 'Queues')
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

      // 3) Adicionar coluna 'targetUserId' (FK para 'Users')
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

      // 4) Adicionar coluna 'targetWhatsappId' (FK para 'Whatsapps')
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

      // 5) Adicionar coluna 'contactId' (FK para 'Contacts')
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

      // 6) Adicionar coluna 'validationType' (cria automaticamente o ENUM 'enum_QueueOptions_validationType')
      await queryInterface.addColumn(
        'QueueOptions',
        'validationType',
        {
          type: Sequelize.ENUM('cpf', 'email', 'phone', 'custom'),
          allowNull: true,
        },
        { transaction }
      );

      // 7) Adicionar coluna 'validationRegex'
      await queryInterface.addColumn(
        'QueueOptions',
        'validationRegex',
        {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        { transaction }
      );

      // 8) Adicionar coluna 'validationErrorMessage'
      await queryInterface.addColumn(
        'QueueOptions',
        'validationErrorMessage',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );

      // 9) Adicionar coluna 'conditionalLogic'
      await queryInterface.addColumn(
        'QueueOptions',
        'conditionalLogic',
        {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        { transaction }
      );

      // 10) Adicionar coluna 'conditionalVariable'
      await queryInterface.addColumn(
        'QueueOptions',
        'conditionalVariable',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );

      // 11) Adicionar coluna 'orderPosition'
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
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Reverteção: remove todas as colunas e depois exclui os tipos ENUM
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
      await queryInterface.removeColumn('QueueOptions', 'optionType', { transaction });

      // 12) Excluir os tipos ENUM criados automaticamente pelo Sequelize
      //    - "enum_QueueOptions_optionType"
      //    - "enum_QueueOptions_validationType"
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
