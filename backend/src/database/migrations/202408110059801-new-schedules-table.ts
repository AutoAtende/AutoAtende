'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = 'Schedules';

    // Verifica se a tabela já existe
    const tableDefinition = await queryInterface.describeTable(tableName);

    // Adiciona ou ajusta colunas conforme necessário
    const updates = [];

    if (!tableDefinition.id) {
      updates.push(queryInterface.addColumn(tableName, 'id', {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      }));
    }

    if (!tableDefinition.body) {
      updates.push(queryInterface.addColumn(tableName, 'body', {
        type: Sequelize.TEXT,
        allowNull: false
      }));
    }

    if (!tableDefinition.sendAt) {
      updates.push(queryInterface.addColumn(tableName, 'sendAt', {
        type: Sequelize.DATE,
        allowNull: false
      }));
    }

    if (!tableDefinition.sentAt) {
      updates.push(queryInterface.addColumn(tableName, 'sentAt', {
        type: Sequelize.DATE,
        allowNull: true
      }));
    }

    if (!tableDefinition.recurrenceType) {
      updates.push(queryInterface.addColumn(tableName, 'recurrenceType', {
        type: Sequelize.ENUM(
          'none',
          'daily',
          'weekly',
          'biweekly',
          'monthly',
          'quarterly',
          'semiannually',
          'yearly'
        ),
        defaultValue: 'none',
        allowNull: false
      }));
    }

    if (!tableDefinition.recurrenceEndDate) {
      updates.push(queryInterface.addColumn(tableName, 'recurrenceEndDate', {
        type: Sequelize.DATE,
        allowNull: true
      }));
    }

    if (!tableDefinition.contactId) {
      updates.push(queryInterface.addColumn(tableName, 'contactId', {
        type: Sequelize.INTEGER,
        references: { model: 'Contacts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }));
    }

    if (!tableDefinition.ticketId) {
      updates.push(queryInterface.addColumn(tableName, 'ticketId', {
        type: Sequelize.INTEGER,
        references: { model: 'Tickets', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }));
    }

    if (!tableDefinition.userId) {
      updates.push(queryInterface.addColumn(tableName, 'userId', {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }));
    }

    if (!tableDefinition.companyId) {
      updates.push(queryInterface.addColumn(tableName, 'companyId', {
        type: Sequelize.INTEGER,
        references: { model: 'Companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }));
    }

    if (!tableDefinition.status) {
      updates.push(queryInterface.addColumn(tableName, 'status', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'PENDENTE'
      }));
    }

    if (!tableDefinition.mediaPath) {
      updates.push(queryInterface.addColumn(tableName, 'mediaPath', {
        type: Sequelize.STRING,
        allowNull: true
      }));
    }

    if (!tableDefinition.mediaName) {
      updates.push(queryInterface.addColumn(tableName, 'mediaName', {
        type: Sequelize.STRING,
        allowNull: true
      }));
    }

    if (!tableDefinition.daysR) {
      updates.push(queryInterface.addColumn(tableName, 'daysR', {
        type: Sequelize.INTEGER,
        allowNull: true
      }));
    }

    if (!tableDefinition.campId) {
      updates.push(queryInterface.addColumn(tableName, 'campId', {
        type: Sequelize.INTEGER,
        allowNull: true
      }));
    }

    if (!tableDefinition.createdAt) {
      updates.push(queryInterface.addColumn(tableName, 'createdAt', {
        type: Sequelize.DATE,
        allowNull: false
      }));
    }

    if (!tableDefinition.updatedAt) {
      updates.push(queryInterface.addColumn(tableName, 'updatedAt', {
        type: Sequelize.DATE,
        allowNull: false
      }));
    }

    // Aguarda todas as alterações serem aplicadas
    await Promise.all(updates);

    // Adiciona índices se não existirem
    const indexes = [
      ['contactId'],
      ['ticketId'],
      ['userId'],
      ['companyId'],
      ['status'],
      ['sendAt']
    ];

    for (const index of indexes) {
      try {
        await queryInterface.addIndex(tableName, index);
      } catch (error) {
        // Ignora erro de índice duplicado
        if (error.message.includes('already exists')) {
          console.log(`Índice ${index} já existe. Ignorando...`);
        } else {
          throw error;
        }
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableName = 'Schedules';

    const removeIndexSafely = async (index) => {
      try {
        await queryInterface.removeIndex(tableName, index);
      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.log(`Índice ${index} não existe. Ignorando...`);
        } else {
          throw error;
        }
      }
    };

    // Remover índices com verificação
    const indexes = [
      ['contactId'],
      ['ticketId'],
      ['userId'],
      ['companyId'],
      ['status'],
      ['sendAt']
    ];

    for (const index of indexes) {
      await removeIndexSafely(index);
    }

    // Remover colunas
    await queryInterface.removeColumn(tableName, 'id');
    await queryInterface.removeColumn(tableName, 'body');
    await queryInterface.removeColumn(tableName, 'sendAt');
    await queryInterface.removeColumn(tableName, 'sentAt');
    await queryInterface.removeColumn(tableName, 'recurrenceType');
    await queryInterface.removeColumn(tableName, 'recurrenceEndDate');
    await queryInterface.removeColumn(tableName, 'contactId');
    await queryInterface.removeColumn(tableName, 'ticketId');
    await queryInterface.removeColumn(tableName, 'userId');
    await queryInterface.removeColumn(tableName, 'companyId');
    await queryInterface.removeColumn(tableName, 'status');
    await queryInterface.removeColumn(tableName, 'mediaPath');
    await queryInterface.removeColumn(tableName, 'mediaName');
    await queryInterface.removeColumn(tableName, 'daysR');
    await queryInterface.removeColumn(tableName, 'campId');
    await queryInterface.removeColumn(tableName, 'createdAt');
    await queryInterface.removeColumn(tableName, 'updatedAt');
  }
};
