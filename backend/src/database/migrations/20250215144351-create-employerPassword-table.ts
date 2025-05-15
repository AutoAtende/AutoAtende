'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop tabela se existir
    try {
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS "EmployerPasswords" CASCADE');
    } catch (error) {
      console.log('Erro ao tentar dropar tabela:', error);
    }

    // Verificar tipos das colunas nas tabelas de referência
    try {
      const users = await queryInterface.describeTable('Users');
      const employers = await queryInterface.describeTable('ContactEmployers');
      console.log('Estrutura das tabelas:', { 
        usersIdType: users.id.type, 
        employersIdType: employers.id.type 
      });
    } catch (error) {
      console.error('Erro ao verificar tabelas de referência:', error);
      throw new Error('Tabelas de referência não encontradas');
    }

    // Criar tabela
    await queryInterface.createTable('EmployerPasswords', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      employerId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER, // Alterado para INTEGER para corresponder ao tipo na tabela Users
        allowNull: false
      },
      application: {
        type: Sequelize.STRING,
        allowNull: false
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      _password: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      tag: {
        type: Sequelize.INTEGER,
        allowNull: false
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

    // Criar índices
    await queryInterface.addIndex('EmployerPasswords', ['employerId']);
    await queryInterface.addIndex('EmployerPasswords', ['userId']);
    await queryInterface.addIndex('EmployerPasswords', ['tag']);

    // Adicionar foreign keys separadamente
    try {
      await queryInterface.addConstraint('EmployerPasswords', {
        fields: ['userId'],
        type: 'foreign key',
        name: 'EmployerPasswords_userId_fkey',
        references: { 
          table: 'Users',
          field: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      await queryInterface.addConstraint('EmployerPasswords', {
        fields: ['employerId'],
        type: 'foreign key',
        name: 'EmployerPasswords_employerId_fkey',
        references: { 
          table: 'ContactEmployers',
          field: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    } catch (error) {
      console.error('Erro ao adicionar foreign keys:', error);
      await queryInterface.dropTable('EmployerPasswords');
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.dropTable('EmployerPasswords');
    } catch (error) {
      console.error('Erro ao remover tabela:', error);
      throw error;
    }
  }
};