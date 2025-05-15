'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Obter a definição atual da tabela
    let tableDefinition = await queryInterface.describeTable('EmployerPasswords');

    // 1. Adicionar a coluna "companyId" se ela não existir
    if (!tableDefinition.hasOwnProperty('companyId')) {
      await queryInterface.addColumn('EmployerPasswords', 'companyId', {
        type: Sequelize.INTEGER,
        allowNull: true, // Permitindo null inicialmente para atualização dos dados
        references: {
          model: 'Companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
    }

    // Atualizar a definição da tabela após a possível adição da coluna
    tableDefinition = await queryInterface.describeTable('EmployerPasswords');

    // 2. Adicionar a coluna "createdBy" se ela não existir
    if (!tableDefinition.hasOwnProperty('createdBy')) {
      await queryInterface.addColumn('EmployerPasswords', 'createdBy', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }

    // Atualizar a definição da tabela novamente
    tableDefinition = await queryInterface.describeTable('EmployerPasswords');

    // 3. Copiar os dados da coluna "userId" para "createdBy", se "userId" existir
    if (tableDefinition.hasOwnProperty('userId')) {
      await queryInterface.sequelize.query(`
        UPDATE "EmployerPasswords" 
        SET "createdBy" = "userId"
      `);
    }

    // 4. Atualizar os registros definindo "companyId" com base na tabela "Users" através da coluna "createdBy"
    await queryInterface.sequelize.query(`
      UPDATE "EmployerPasswords" ep
      SET "companyId" = (
        SELECT "companyId"
        FROM "Users" u
        WHERE u.id = ep."createdBy"
      )
    `);

    // 5. Verificar se há registros com "companyId" nulo
    const [results] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) AS null_count
      FROM "EmployerPasswords"
      WHERE "companyId" IS NULL
    `);

    const nullCount = parseInt(results[0].null_count, 10);
    if (nullCount > 0) {
      throw new Error(`Existem ${nullCount} registros com companyId nulo. Corrija os dados antes de continuar.`);
    }

    // 6. Alterar a coluna "companyId" para não permitir null
    await queryInterface.changeColumn('EmployerPasswords', 'companyId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Companies',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // 7. Remover a coluna "userId" se ela existir
    tableDefinition = await queryInterface.describeTable('EmployerPasswords');
    if (tableDefinition.hasOwnProperty('userId')) {
      await queryInterface.removeColumn('EmployerPasswords', 'userId');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Obter a definição atual da tabela
    let tableDefinition = await queryInterface.describeTable('EmployerPasswords');

    // 1. Recriar a coluna "userId" se ela não existir
    if (!tableDefinition.hasOwnProperty('userId')) {
      await queryInterface.addColumn('EmployerPasswords', 'userId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
    }

    // Atualizar a definição da tabela após a possível adição
    tableDefinition = await queryInterface.describeTable('EmployerPasswords');

    // 2. Copiar os dados da coluna "createdBy" para "userId", se "createdBy" existir
    if (tableDefinition.hasOwnProperty('createdBy')) {
      await queryInterface.sequelize.query(`
        UPDATE "EmployerPasswords" 
        SET "userId" = "createdBy"
      `);
    }

    // 3. Remover a coluna "companyId" se ela existir
    if (tableDefinition.hasOwnProperty('companyId')) {
      await queryInterface.removeColumn('EmployerPasswords', 'companyId');
    }

    // Atualizar a definição da tabela após a remoção
    tableDefinition = await queryInterface.describeTable('EmployerPasswords');

    // 4. Remover a coluna "createdBy" se ela existir
    if (tableDefinition.hasOwnProperty('createdBy')) {
      await queryInterface.removeColumn('EmployerPasswords', 'createdBy');
    }
  }
};
