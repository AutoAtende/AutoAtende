'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.describeTable('ContactPositions').catch(() => null);

    if (!tableExists) {
      await queryInterface.createTable('ContactPositions', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        employerId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'ContactEmployers',
            key: 'id'
          },
          onUpdate: 'CASCADE',
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
    } else {
      const tableDefinition = await queryInterface.describeTable('ContactPositions');
      if (!tableDefinition.employerId) {
        await queryInterface.addColumn('ContactPositions', 'employerId', {
          type: Sequelize.INTEGER,
          references: {
            model: 'ContactEmployers',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        });
      }
    }

    const indexes = await queryInterface.showIndex('ContactPositions');
    const hasEmployerIdIndex = indexes.some(index => index.fields.includes('employerId'));

    if (!hasEmployerIdIndex) {
      await queryInterface.addIndex('ContactPositions', ['employerId']);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.describeTable('ContactPositions').catch(() => null);
    if (tableExists) {
      await queryInterface.dropTable('ContactPositions');
    }
  }
};
