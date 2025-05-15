'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verificar se a tabela existe
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('Whatsapps'));
    
    if (!tableExists) {
      await queryInterface.createTable('Whatsapps', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        name: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        session: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        qrcode: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        status: {
          type: Sequelize.STRING,
          allowNull: true
        },
        battery: {
          type: Sequelize.STRING,
          allowNull: true
        },
        plugged: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        retries: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        number: {
          type: Sequelize.STRING,
          allowNull: true
        },
        greetingMessage: {
          type: Sequelize.TEXT,
          defaultValue: "",
          allowNull: true
        },
        greetingMediaAttachment: {
          type: Sequelize.STRING,
          allowNull: true
        },
        farewellMessage: {
          type: Sequelize.TEXT,
          defaultValue: "",
          allowNull: true
        },
        complationMessage: {
          type: Sequelize.TEXT,
          defaultValue: "",
          allowNull: true
        },
        outOfHoursMessage: {
          type: Sequelize.TEXT,
          defaultValue: "",
          allowNull: true
        },
        ratingMessage: {
          type: Sequelize.TEXT,
          defaultValue: "",
          allowNull: true
        },
        provider: {
          type: Sequelize.STRING,
          defaultValue: "stable",
          allowNull: true
        },
        isDefault: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: true
        },
        autoImportContacts: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: true
        },
        autoRejectCalls: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: true
        },
        allowGroup: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: true
        },
        companyId: {
          type: Sequelize.INTEGER,
          references: { model: 'Companies', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          allowNull: true
        },
        token: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        timeSendQueue: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: true
        },
        sendIdQueue: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        promptId: {
          type: Sequelize.INTEGER,
          references: { model: 'Prompts', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          allowNull: true
        },
        integrationId: {
          type: Sequelize.INTEGER,
          references: { model: 'QueueIntegrations', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          allowNull: true
        },
        maxUseBotQueues: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        timeUseBotQueues: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        expiresTicket: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        expiresInactiveMessage: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        timeInactiveMessage: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        inactiveMessage: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        collectiveVacationMessage: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        collectiveVacationStart: {
          type: Sequelize.DATE,
          allowNull: true
        },
        collectiveVacationEnd: {
          type: Sequelize.DATE,
          allowNull: true
        },
        color: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        isManualDisconnect: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        statusImportMessages: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        importOldMessages: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        importRecentMessages: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        closedTicketsPostImported: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        importOldMessagesGroups: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        sessionChecksum: {
          type: Sequelize.TEXT,
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
      });
      console.log('Tabela Whatsapps criada com sucesso');
      return;
    }

    // Obter informações sobre as colunas existentes na tabela
    const tableInfo = await queryInterface.describeTable('Whatsapps');
    
    // Lista de colunas que queremos verificar/adicionar
    const columns = [
      {
        name: 'name',
        type: Sequelize.TEXT,
        allowNull: true
      },
      {
        name: 'session',
        type: Sequelize.TEXT,
        allowNull: true
      },
      {
        name: 'qrcode',
        type: Sequelize.TEXT,
        allowNull: true
      },
      {
        name: 'status',
        type: Sequelize.STRING,
        allowNull: true
      },
      {
        name: 'battery',
        type: Sequelize.STRING,
        allowNull: true
      },
      {
        name: 'plugged',
        type: Sequelize.INTEGER,
        allowNull: true
      },
      {
        name: 'retries',
        type: Sequelize.INTEGER,
        allowNull: true
      },
      {
        name: 'number',
        type: Sequelize.STRING,
        allowNull: true
      },
      {
        name: 'greetingMessage',
        type: Sequelize.TEXT,
        defaultValue: "",
        allowNull: true
      },
      {
        name: 'greetingMediaAttachment',
        type: Sequelize.STRING,
        allowNull: true
      },
      {
        name: 'farewellMessage',
        type: Sequelize.TEXT,
        defaultValue: "",
        allowNull: true
      },
      {
        name: 'complationMessage',
        type: Sequelize.TEXT,
        defaultValue: "",
        allowNull: true
      },
      {
        name: 'outOfHoursMessage',
        type: Sequelize.TEXT,
        defaultValue: "",
        allowNull: true
      },
      {
        name: 'ratingMessage',
        type: Sequelize.TEXT,
        defaultValue: "",
        allowNull: true
      },
      {
        name: 'provider',
        type: Sequelize.STRING,
        defaultValue: "stable",
        allowNull: true
      },
      {
        name: 'isDefault',
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true
      },
      {
        name: 'autoImportContacts',
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true
      },
      {
        name: 'autoRejectCalls',
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true
      },
      {
        name: 'allowGroup',
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true
      },
      {
        name: 'companyId',
        type: Sequelize.INTEGER,
        references: { model: 'Companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true
      },
      {
        name: 'token',
        type: Sequelize.TEXT,
        allowNull: true
      },
      {
        name: 'timeSendQueue',
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true
      },
      {
        name: 'sendIdQueue',
        type: Sequelize.INTEGER,
        allowNull: true
      },
      {
        name: 'promptId',
        type: Sequelize.INTEGER,
        references: { model: 'Prompts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true
      },
      {
        name: 'integrationId',
        type: Sequelize.INTEGER,
        references: { model: 'QueueIntegrations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true
      },
      {
        name: 'maxUseBotQueues',
        type: Sequelize.INTEGER,
        allowNull: true
      },
      {
        name: 'timeUseBotQueues',
        type: Sequelize.TEXT,
        allowNull: true
      },
      {
        name: 'expiresTicket',
        type: Sequelize.INTEGER,
        allowNull: true
      },
      {
        name: 'expiresInactiveMessage',
        type: Sequelize.TEXT,
        allowNull: true
      },
      {
        name: 'timeInactiveMessage',
        type: Sequelize.TEXT,
        allowNull: true
      },
      {
        name: 'inactiveMessage',
        type: Sequelize.TEXT,
        allowNull: true
      },
      {
        name: 'collectiveVacationMessage',
        type: Sequelize.TEXT,
        allowNull: true
      },
      {
        name: 'collectiveVacationStart',
        type: Sequelize.DATE,
        allowNull: true
      },
      {
        name: 'collectiveVacationEnd',
        type: Sequelize.DATE,
        allowNull: true
      },
      {
        name: 'color',
        type: Sequelize.TEXT,
        allowNull: true
      },
      {
        name: 'isManualDisconnect',
        type: Sequelize.INTEGER,
        allowNull: true
      },
      {
        name: 'statusImportMessages',
        type: Sequelize.TEXT,
        allowNull: true
      },
      {
        name: 'importOldMessages',
        type: Sequelize.TEXT,
        allowNull: true
      },
      {
        name: 'importRecentMessages',
        type: Sequelize.TEXT,
        allowNull: true
      },
      {
        name: 'closedTicketsPostImported',
        type: Sequelize.INTEGER,
        allowNull: true
      },
      {
        name: 'importOldMessagesGroups',
        type: Sequelize.INTEGER,
        allowNull: true
      },
      {
        name: 'sessionChecksum',
        type: Sequelize.TEXT,
        allowNull: true
      }
    ];

    // Verificar e adicionar as colunas que não existem
    for (const column of columns) {
      if (!tableInfo[column.name]) {
        await queryInterface.addColumn('Whatsapps', column.name, {
          type: column.type,
          allowNull: column.allowNull,
          defaultValue: column.defaultValue,
          references: column.references
        });
        console.log(`Coluna ${column.name} adicionada à tabela Whatsapps`);
      } else {
        // Detectar tipo atual da coluna para lidar com conflitos
        const currentType = tableInfo[column.name].type.toLowerCase();
        
        // Se o tipo atual é boolean, mas queremos integer
        if ((currentType === 'boolean' || currentType === 'bool') && 
            (column.type.key === 'INTEGER')) {
          
          try {
            // Especificamos um valor padrão Boolean para evitar conflito de tipos
            // Para colunas que são boolean no banco mas queremos INTEGER
            await queryInterface.changeColumn('Whatsapps', column.name, {
              type: Sequelize.STRING,
              allowNull: true,
            });
            
            // Converter boolean para string representando números
            await queryInterface.sequelize.query(`
              UPDATE "Whatsapps" 
              SET "${column.name}" = CASE 
                WHEN "${column.name}" = TRUE THEN '1'
                WHEN "${column.name}" = FALSE THEN '0'
                ELSE NULL
              END
            `);
            
            // Agora converter para INTEGER
            await queryInterface.changeColumn('Whatsapps', column.name, {
              type: Sequelize.INTEGER,
              allowNull: column.allowNull,
              defaultValue: column.defaultValue
            });
            
            console.log(`Convertido ${column.name} de BOOLEAN para INTEGER`);
          } catch (error) {
            console.error(`Erro ao converter coluna ${column.name}: ${error.message}`);
          }
        }
        // Verificação normal para outros tipos
        else if (needsTypeChange1(tableInfo[column.name], column)) {
          try {
            await queryInterface.changeColumn('Whatsapps', column.name, {
              type: column.type,
              allowNull: column.allowNull,
              defaultValue: column.defaultValue
            });
            console.log(`Tipo da coluna ${column.name} modificado na tabela Whatsapps`);
          } catch (error) {
            console.error(`Erro ao modificar tipo da coluna ${column.name}: ${error.message}`);
          }
        }
      }
    }

    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    // Caso seja necessário reverter, não faremos nada aqui
    // já que estamos apenas atualizando a estrutura existente
    return Promise.resolve();
  }
};

function needsTypeChange1(existingColumn, newColumn) {
  const currentType = existingColumn.type.toLowerCase();
  
  // Verificar tipos específicos
  if (newColumn.type.key === 'TEXT' && currentType !== 'text') {
    return true;
  }
  
  if (newColumn.type.key === 'INTEGER' && !['integer', 'int'].includes(currentType)) {
    return true;
  }
  
  if (newColumn.type.key === 'STRING' && !['varchar', 'character varying'].includes(currentType)) {
    return true;
  }
  
  if (newColumn.type.key === 'DATE' && !['timestamp with time zone', 'timestamp without time zone', 'date'].includes(currentType)) {
    return true;
  }
  
  // Em caso de dúvidas sobre o tipo, retorna false para evitar conversões problemáticas
  return false;
}