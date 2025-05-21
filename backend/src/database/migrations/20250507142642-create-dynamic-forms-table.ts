import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('DynamicForms', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      fields: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      landingPageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'LandingPages',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // Adicionar índices
    await queryInterface.addIndex('DynamicForms', ['landingPageId']);
    await queryInterface.addIndex('DynamicForms', ['companyId']);
    await queryInterface.addIndex('DynamicForms', ['active']);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('DynamicForms');
  }
};