import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('FormSubmissions', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      data: {
        type: DataTypes.JSONB,
        allowNull: false
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
      },
      userAgent: {
        type: DataTypes.STRING,
        allowNull: true
      },
      metaData: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      processed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
      formId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'DynamicForms',
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
    await queryInterface.addIndex('FormSubmissions', ['landingPageId']);
    await queryInterface.addIndex('FormSubmissions', ['formId']);
    await queryInterface.addIndex('FormSubmissions', ['companyId']);
    await queryInterface.addIndex('FormSubmissions', ['createdAt']);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('FormSubmissions');
  }
};