import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    // Adicionar colunas para gerenciamento automático de grupos na tabela Groups
    await queryInterface.addColumn("Groups", "isManaged", {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: "Indica se o grupo faz parte de um gerenciamento automático"
    });

    await queryInterface.addColumn("Groups", "groupSeries", {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Identificador da série de grupos (ex: 'landing-page-promocao')"
    });

    await queryInterface.addColumn("Groups", "groupNumber", {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Número sequencial do grupo na série (1, 2, 3...)"
    });

    await queryInterface.addColumn("Groups", "maxParticipants", {
      type: DataTypes.INTEGER,
      defaultValue: 256,
      allowNull: false,
      comment: "Número máximo de participantes para este grupo"
    });

    await queryInterface.addColumn("Groups", "isActive", {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment: "Indica se o grupo está ativo para receber novos participantes"
    });

    await queryInterface.addColumn("Groups", "baseGroupName", {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Nome base para grupos da série (sem numeração)"
    });

    await queryInterface.addColumn("Groups", "autoCreateNext", {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: "Se deve criar automaticamente o próximo grupo da série"
    });

    await queryInterface.addColumn("Groups", "thresholdPercentage", {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 95.0,
      allowNull: false,
      comment: "Porcentagem de ocupação que dispara a criação do próximo grupo"
    });

    // Criar tabela para gerenciamento de séries de grupos
    await queryInterface.createTable("GroupSeries", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Nome identificador da série (ex: 'landing-page-promocao')"
      },
      baseGroupName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Nome base para grupos da série"
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Descrição base para grupos da série"
      },
      maxParticipants: {
        type: DataTypes.INTEGER,
        defaultValue: 256,
        allowNull: false,
        comment: "Limite máximo de participantes por grupo"
      },
      thresholdPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 95.0,
        allowNull: false,
        comment: "Porcentagem que dispara criação do próximo grupo"
      },
      autoCreateEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: "Se a criação automática está habilitada"
      },
      currentActiveGroupId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Groups",
          key: "id"
        },
        comment: "ID do grupo atualmente ativo para novos participantes"
      },
      nextGroupNumber: {
        type: DataTypes.INTEGER,
        defaultValue: 2,
        allowNull: false,
        comment: "Próximo número sequencial a ser usado"
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Companies",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      whatsappId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Whatsapps",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      landingPageId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "LandingPages",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        comment: "Landing page associada a esta série (opcional)"
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

    // Criar índices para otimização
    await queryInterface.addIndex("Groups", ["groupSeries", "companyId"], {
      name: "idx_groups_series_company"
    });

    await queryInterface.addIndex("Groups", ["isManaged", "isActive", "companyId"], {
      name: "idx_groups_managed_active_company"
    });

    await queryInterface.addIndex("GroupSeries", ["companyId", "autoCreateEnabled"], {
      name: "idx_group_series_company_auto"
    });

    await queryInterface.addIndex("GroupSeries", ["landingPageId"], {
      name: "idx_group_series_landing_page"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    // Remover índices
    await queryInterface.removeIndex("Groups", "idx_groups_series_company");
    await queryInterface.removeIndex("Groups", "idx_groups_managed_active_company");
    await queryInterface.removeIndex("GroupSeries", "idx_group_series_company_auto");
    await queryInterface.removeIndex("GroupSeries", "idx_group_series_landing_page");

    // Remover tabela GroupSeries
    await queryInterface.dropTable("GroupSeries");

    // Remover colunas da tabela Groups
    await queryInterface.removeColumn("Groups", "thresholdPercentage");
    await queryInterface.removeColumn("Groups", "autoCreateNext");
    await queryInterface.removeColumn("Groups", "baseGroupName");
    await queryInterface.removeColumn("Groups", "isActive");
    await queryInterface.removeColumn("Groups", "maxParticipants");
    await queryInterface.removeColumn("Groups", "groupNumber");
    await queryInterface.removeColumn("Groups", "groupSeries");
    await queryInterface.removeColumn("Groups", "isManaged");
  }
};