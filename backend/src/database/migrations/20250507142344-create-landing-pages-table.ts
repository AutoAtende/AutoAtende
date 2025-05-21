import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('LandingPages', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      appearance: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {
          textColor: '#000000',
          backgroundColor: '#ffffff'
        }
      },
      formConfig: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {
          showForm: true,
          position: 'right',
          title: 'Formulário de Cadastro',
          buttonText: 'Enviar',
          limitSubmissions: false
        }
      },
      eventConfig: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {
          isEvent: false
        }
      },
      notificationConfig: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {
          enableWhatsApp: false
        }
      },
      advancedConfig: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {
          whatsAppChatButton: {
            enabled: false
          }
        }
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.addIndex('LandingPages', ['slug']);
    await queryInterface.addIndex('LandingPages', ['companyId']);
    await queryInterface.addIndex('LandingPages', ['active']);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('LandingPages');
  }
};