import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    // Função auxiliar para verificar se a coluna já existe em uma tabela
    const colunaExiste = async (
      nomeTabela: string,
      nomeColuna: string
    ): Promise<boolean> => {
      // describeTable retorna um objeto com as colunas já existentes
      const descricao = await queryInterface.describeTable(nomeTabela);
      return Object.prototype.hasOwnProperty.call(descricao, nomeColuna);
    };

    const tabelaGroups = "Groups";

    // 1) Adicionar colunas em "Groups" apenas se não existirem

    if (!(await colunaExiste(tabelaGroups, "isManaged"))) {
      await queryInterface.addColumn(tabelaGroups, "isManaged", {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: "Indica se o grupo faz parte de um gerenciamento automático",
      });
    }

    if (!(await colunaExiste(tabelaGroups, "groupSeries"))) {
      await queryInterface.addColumn(tabelaGroups, "groupSeries", {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Identificador da série de grupos (ex: 'landing-page-promocao')",
      });
    }

    if (!(await colunaExiste(tabelaGroups, "groupNumber"))) {
      await queryInterface.addColumn(tabelaGroups, "groupNumber", {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Número sequencial do grupo na série (1, 2, 3...)",
      });
    }

    if (!(await colunaExiste(tabelaGroups, "maxParticipants"))) {
      await queryInterface.addColumn(tabelaGroups, "maxParticipants", {
        type: DataTypes.INTEGER,
        defaultValue: 256,
        allowNull: false,
        comment: "Número máximo de participantes para este grupo",
      });
    }

    if (!(await colunaExiste(tabelaGroups, "isActive"))) {
      await queryInterface.addColumn(tabelaGroups, "isActive", {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: "Indica se o grupo está ativo para receber novos participantes",
      });
    }

    if (!(await colunaExiste(tabelaGroups, "baseGroupName"))) {
      await queryInterface.addColumn(tabelaGroups, "baseGroupName", {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Nome base para grupos da série (sem numeração)",
      });
    }

    if (!(await colunaExiste(tabelaGroups, "autoCreateNext"))) {
      await queryInterface.addColumn(tabelaGroups, "autoCreateNext", {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: "Se deve criar automaticamente o próximo grupo da série",
      });
    }

    if (!(await colunaExiste(tabelaGroups, "thresholdPercentage"))) {
      await queryInterface.addColumn(tabelaGroups, "thresholdPercentage", {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 95.0,
        allowNull: false,
        comment: "Porcentagem de ocupação que dispara a criação do próximo grupo",
      });
    }

    // 2) Criar tabela "GroupSeries" apenas se não existir

    // showAllTables() pode retornar string[] ou Array<{ tableName: string }>
    const tabelas = (await queryInterface.showAllTables()) as unknown;
    let listasTabelas: string[] = [];

    if (Array.isArray(tabelas)) {
      // Se for array de strings
      if (typeof tabelas[0] === "string") {
        listasTabelas = tabelas as string[];
      } else {
        // Se for array de objetos, extrair a propriedade tableName
        listasTabelas = (tabelas as Array<{ tableName: string }>).map(
          (t) => t.tableName
        );
      }
    }

    const tabelaGroupSeries = "GroupSeries";
    if (!listasTabelas.includes(tabelaGroupSeries)) {
      await queryInterface.createTable(tabelaGroupSeries, {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          comment: "Nome identificador da série (ex: 'landing-page-promocao')",
        },
        baseGroupName: {
          type: DataTypes.STRING,
          allowNull: false,
          comment: "Nome base para grupos da série",
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: "Descrição base para grupos da série",
        },
        maxParticipants: {
          type: DataTypes.INTEGER,
          defaultValue: 256,
          allowNull: false,
          comment: "Limite máximo de participantes por grupo",
        },
        thresholdPercentage: {
          type: DataTypes.DECIMAL(5, 2),
          defaultValue: 95.0,
          allowNull: false,
          comment: "Porcentagem que dispara criação do próximo grupo",
        },
        autoCreateEnabled: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
          comment: "Se a criação automática está habilitada",
        },
        currentActiveGroupId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "Groups",
            key: "id",
          },
          comment: "ID do grupo atualmente ativo para novos participantes",
        },
        nextGroupNumber: {
          type: DataTypes.INTEGER,
          defaultValue: 2,
          allowNull: false,
          comment: "Próximo número sequencial a ser usado",
        },
        companyId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "Companies",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        whatsappId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "Whatsapps",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        landingPageId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "LandingPages",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
          comment: "Landing page associada a esta série (opcional)",
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      });
    }

    // 3) Criar índices apenas se não existirem

    const criarIndiceSeNaoExistir = async (
      nomeTabela: string,
      nomeIndice: string,
      campos: string[]
    ) => {
      const indicesExistentes = await queryInterface.showIndex(nomeTabela);
      const nomes = Object.values(indicesExistentes).map((idx: any) => idx.name);
      if (!nomes.includes(nomeIndice)) {
        await queryInterface.addIndex(nomeTabela, campos, { name: nomeIndice });
      }
    };

    // Índices em "Groups"
    await criarIndiceSeNaoExistir(
      tabelaGroups,
      "idx_groups_series_company",
      ["groupSeries", "companyId"]
    );
    await criarIndiceSeNaoExistir(
      tabelaGroups,
      "idx_groups_managed_active_company",
      ["isManaged", "isActive", "companyId"]
    );

    // Índices em "GroupSeries" (caso a tabela tenha sido criada ou já existisse)
    if (listasTabelas.includes(tabelaGroupSeries)) {
      await criarIndiceSeNaoExistir(
        tabelaGroupSeries,
        "idx_group_series_company_auto",
        ["companyId", "autoCreateEnabled"]
      );
      await criarIndiceSeNaoExistir(
        tabelaGroupSeries,
        "idx_group_series_landing_page",
        ["landingPageId"]
      );
    }
  },

  down: async (queryInterface: QueryInterface) => {
    // 1) Remover índices somente se existirem

    const removerIndiceSeExistir = async (
      nomeTabela: string,
      nomeIndice: string
    ) => {
      const indicesExistentes = await queryInterface.showIndex(nomeTabela);
      const nomes = Object.values(indicesExistentes).map((idx: any) => idx.name);
      if (nomes.includes(nomeIndice)) {
        await queryInterface.removeIndex(nomeTabela, nomeIndice);
      }
    };

    // Remover índices de "Groups"
    await removerIndiceSeExistir("Groups", "idx_groups_series_company");
    await removerIndiceSeExistir("Groups", "idx_groups_managed_active_company");

    // Checar existência de tabelas
    const tabelas = (await queryInterface.showAllTables()) as unknown;
    let listasTabelas: string[] = [];
    if (Array.isArray(tabelas)) {
      if (typeof tabelas[0] === "string") {
        listasTabelas = tabelas as string[];
      } else {
        listasTabelas = (tabelas as Array<{ tableName: string }>).map(
          (t) => t.tableName
        );
      }
    }

    const tabelaGroupSeries = "GroupSeries";
    // Remover índices de "GroupSeries"
    if (listasTabelas.includes(tabelaGroupSeries)) {
      await removerIndiceSeExistir(
        tabelaGroupSeries,
        "idx_group_series_company_auto"
      );
      await removerIndiceSeExistir(
        tabelaGroupSeries,
        "idx_group_series_landing_page"
      );
    }

    // 2) Remover tabela "GroupSeries" apenas se existir
    if (listasTabelas.includes(tabelaGroupSeries)) {
      await queryInterface.dropTable(tabelaGroupSeries);
    }

    // 3) Remover colunas de "Groups" apenas se existirem
    const colunaExiste = async (
      nomeTabela: string,
      nomeColuna: string
    ): Promise<boolean> => {
      const descricao = await queryInterface.describeTable(nomeTabela);
      return Object.prototype.hasOwnProperty.call(descricao, nomeColuna);
    };

    const removerColunaSeExistir = async (
      nomeTabela: string,
      nomeColuna: string
    ) => {
      if (await colunaExiste(nomeTabela, nomeColuna)) {
        await queryInterface.removeColumn(nomeTabela, nomeColuna);
      }
    };

    // Ordem inversa da criação

    await removerColunaSeExistir("Groups", "thresholdPercentage");
    await removerColunaSeExistir("Groups", "autoCreateNext");
    await removerColunaSeExistir("Groups", "baseGroupName");
    await removerColunaSeExistir("Groups", "isActive");
    await removerColunaSeExistir("Groups", "maxParticipants");
    await removerColunaSeExistir("Groups", "groupNumber");
    await removerColunaSeExistir("Groups", "groupSeries");
    await removerColunaSeExistir("Groups", "isManaged");
  },
};
