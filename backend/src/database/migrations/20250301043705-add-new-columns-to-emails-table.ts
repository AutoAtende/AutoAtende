'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = 'Emails';
    const columns = await queryInterface.describeTable(tableName); // Obtém a descrição das colunas da tabela

    // Função para verificar se uma coluna existe e está no formato esperado
    const checkColumn = async (columnName, expectedType, options = {}) => {
      if (!columns[columnName]) {
        // Se a coluna não existe, cria
        await queryInterface.addColumn(tableName, columnName, {
          type: expectedType,
          ...options,
        });
        console.log(`Coluna ${columnName} criada.`);
      } else if (columns[columnName].type !== expectedType.key) {
        // Se a coluna existe, mas o tipo não é o esperado, ajusta
        await queryInterface.changeColumn(tableName, columnName, {
          type: expectedType,
          ...options,
        });
        console.log(`Coluna ${columnName} ajustada.`);
      } else {
        console.log(`Coluna ${columnName} já existe e está no formato correto.`);
      }
    };

    // Verificar e adicionar/ajustar colunas
    await checkColumn('deliveredAt', Sequelize.DATE, { allowNull: true });
    await checkColumn('openedAt', Sequelize.DATE, { allowNull: true });
    await checkColumn('openCount', Sequelize.INTEGER, { defaultValue: 0, allowNull: false });
    await checkColumn('deliveryStatus', Sequelize.STRING(20), { allowNull: true });
    await checkColumn('retriedAt', Sequelize.DATE, { allowNull: true });
    await checkColumn('retriedEmailId', Sequelize.INTEGER, {
      allowNull: true,
      references: { model: 'Emails', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await checkColumn('relatedEmailId', Sequelize.INTEGER, {
      allowNull: true,
      references: { model: 'Emails', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await checkColumn('status', Sequelize.STRING(20), { allowNull: true });

    // Adicionar a coluna messageId se não existir
    await checkColumn('messageId', Sequelize.STRING, { allowNull: true });

    // Adicionar índices (verifica se já existem antes de criar)
    const addIndexIfNotExists = async (indexName, fields) => {
      const indexes = await queryInterface.showIndex(tableName);
      const indexExists = indexes.some(
        (index) => index.name === indexName || index.fields.some((field) => fields.includes(field.name))
      );

      if (!indexExists) {
        await queryInterface.addIndex(tableName, fields);
        console.log(`Índice para ${fields.join(', ')} criado.`);
      } else {
        console.log(`Índice para ${fields.join(', ')} já existe.`);
      }
    };

    await addIndexIfNotExists('emails_status_index', ['status']);
    await addIndexIfNotExists('emails_scheduled_index', ['scheduled']);
    await addIndexIfNotExists('emails_messageId_index', ['messageId']);
    await addIndexIfNotExists('emails_companyId_scheduled_status_index', ['companyId', 'scheduled', 'status']);
    await addIndexIfNotExists('emails_sendAt_index', ['sendAt']);
  },

  down: async (queryInterface, Sequelize) => {
    const tableName = 'Emails';

    // Remover índices
    await queryInterface.removeIndex(tableName, ['status']);
    await queryInterface.removeIndex(tableName, ['scheduled']);
    await queryInterface.removeIndex(tableName, ['messageId']);
    await queryInterface.removeIndex(tableName, ['companyId', 'scheduled', 'status']);
    await queryInterface.removeIndex(tableName, ['sendAt']);

    // Remover colunas (se existirem)
    const columns = await queryInterface.describeTable(tableName);
    const removeColumnIfExists = async (columnName) => {
      if (columns[columnName]) {
        await queryInterface.removeColumn(tableName, columnName);
        console.log(`Coluna ${columnName} removida.`);
      } else {
        console.log(`Coluna ${columnName} não existe.`);
      }
    };

    await removeColumnIfExists('relatedEmailId');
    await removeColumnIfExists('retriedEmailId');
    await removeColumnIfExists('retriedAt');
    await removeColumnIfExists('deliveryStatus');
    await removeColumnIfExists('openCount');
    await removeColumnIfExists('openedAt');
    await removeColumnIfExists('deliveredAt');
    await removeColumnIfExists('status');
    await removeColumnIfExists('messageId');
  },
};