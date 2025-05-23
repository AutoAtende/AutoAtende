// migrations/YYYYMMDDHHMMSS-add-advanced-options-to-queue-options.ts
module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('QueueOptions', 'optionType', {
        type: Sequelize.ENUM(
          'text', 'audio', 'video', 'image', 'document', 'contact',
          'transfer_queue', 'transfer_user', 'transfer_whatsapp',
          'validation', 'conditional'
        ),
        defaultValue: 'text',
        allowNull: false
      });
  
      await queryInterface.addColumn('QueueOptions', 'targetQueueId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Queues', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
  
      await queryInterface.addColumn('QueueOptions', 'targetUserId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
  
      await queryInterface.addColumn('QueueOptions', 'targetWhatsappId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Whatsapps', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
  
      await queryInterface.addColumn('QueueOptions', 'contactId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Contacts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
  
      await queryInterface.addColumn('QueueOptions', 'validationType', {
        type: Sequelize.ENUM('cpf', 'email', 'phone', 'custom'),
        allowNull: true
      });
  
      await queryInterface.addColumn('QueueOptions', 'validationRegex', {
        type: Sequelize.TEXT,
        allowNull: true
      });
  
      await queryInterface.addColumn('QueueOptions', 'validationErrorMessage', {
        type: Sequelize.STRING,
        allowNull: true
      });
  
      await queryInterface.addColumn('QueueOptions', 'conditionalLogic', {
        type: Sequelize.JSONB,
        allowNull: true
      });
  
      await queryInterface.addColumn('QueueOptions', 'conditionalVariable', {
        type: Sequelize.STRING,
        allowNull: true
      });
  
      await queryInterface.addColumn('QueueOptions', 'orderPosition', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      });
    },
  
    down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('QueueOptions', 'optionType');
      await queryInterface.removeColumn('QueueOptions', 'targetQueueId');
      await queryInterface.removeColumn('QueueOptions', 'targetUserId');
      await queryInterface.removeColumn('QueueOptions', 'targetWhatsappId');
      await queryInterface.removeColumn('QueueOptions', 'contactId');
      await queryInterface.removeColumn('QueueOptions', 'validationType');
      await queryInterface.removeColumn('QueueOptions', 'validationRegex');
      await queryInterface.removeColumn('QueueOptions', 'validationErrorMessage');
      await queryInterface.removeColumn('QueueOptions', 'conditionalLogic');
      await queryInterface.removeColumn('QueueOptions', 'conditionalVariable');
      await queryInterface.removeColumn('QueueOptions', 'orderPosition');
  
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_QueueOptions_optionType";');
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_QueueOptions_validationType";');
    }
  };