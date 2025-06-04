import { QueryInterface, DataTypes } from "sequelize";

// Funções auxiliares para verificar existência
const columnExists = async (queryInterface: QueryInterface, table: string, column: string) => {
  const tableDescription = await queryInterface.describeTable(table);
  return !!tableDescription[column];
};

const tableExists = async (queryInterface: QueryInterface, table: string) => {
  const [tables] = await queryInterface.sequelize.query(
    `SELECT table_name FROM information_schema.tables 
     WHERE table_name = '${table}' AND table_schema = 'public'`
  );
  return tables.length > 0;
};

const indexExists = async (queryInterface: QueryInterface, table: string, index: string) => {
  const [indexes] = await queryInterface.sequelize.query(
    `SELECT indexname FROM pg_indexes 
     WHERE tablename = '${table}' AND indexname = '${index}'`
  );
  return indexes.length > 0;
};

export default {
  up: async (queryInterface: QueryInterface) => {
    // Adicionar colunas com verificações
    const columnsToAdd = [
      { name: "isManaged", options: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false } },
      { name: "groupSeries", options: { type: DataTypes.STRING, allowNull: true } },
      { name: "groupNumber", options: { type: DataTypes.INTEGER, allowNull: true } },
      { name: "maxParticipants", options: { type: DataTypes.INTEGER, defaultValue: 256, allowNull: false } },
      { name: "isActive", options: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false } },
      { name: "baseGroupName", options: { type: DataTypes.STRING, allowNull: true } },
      { name: "autoCreateNext", options: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false } },
      { name: "thresholdPercentage", options: { type: DataTypes.DECIMAL(5, 2), defaultValue: 95.0, allowNull: false } }
    ];

    for (const { name, options } of columnsToAdd) {
      if (!(await columnExists(queryInterface, "Groups", name))) {
        await queryInterface.addColumn("Groups", name, options);
      }
    }

    // Criar nova tabela com verificação
    if (!(await tableExists(queryInterface, "GroupSeries"))) {
      await queryInterface.createTable("GroupSeries", {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        // ... (demais campos permanecem iguais)
      });
    }

    // Adicionar índices com verificações
    const indexesToCreate = [
      { table: "Groups", name: "idx_groups_series_company", fields: ["groupSeries", "companyId"] },
      { table: "Groups", name: "idx_groups_managed_active_company", fields: ["isManaged", "isActive", "companyId"] },
      { table: "GroupSeries", name: "idx_group_series_company_auto", fields: ["companyId", "autoCreateEnabled"] },
      { table: "GroupSeries", name: "idx_group_series_landing_page", fields: ["landingPageId"] }
    ];

    for (const { table, name, fields } of indexesToCreate) {
      if (!(await indexExists(queryInterface, table, name))) {
        await queryInterface.addIndex(table, fields, { name });
      }
    }
  },

  down: async (queryInterface: QueryInterface) => {
    // Remover índices com verificação
    const indexesToRemove = [
      { table: "Groups", index: "idx_groups_series_company" },
      { table: "Groups", index: "idx_groups_managed_active_company" },
      { table: "GroupSeries", index: "idx_group_series_company_auto" },
      { table: "GroupSeries", index: "idx_group_series_landing_page" }
    ];

    for (const { table, index } of indexesToRemove) {
      if (await indexExists(queryInterface, table, index)) {
        await queryInterface.removeIndex(table, index);
      }
    }

    // Remover tabela com verificação
    if (await tableExists(queryInterface, "GroupSeries")) {
      await queryInterface.dropTable("GroupSeries");
    }

    // Remover colunas com verificação
    const columnsToRemove = [
      "thresholdPercentage",
      "autoCreateNext",
      "baseGroupName",
      "isActive",
      "maxParticipants",
      "groupNumber",
      "groupSeries",
      "isManaged"
    ];

    for (const column of columnsToRemove) {
      if (await columnExists(queryInterface, "Groups", column)) {
        await queryInterface.removeColumn("Groups", column);
      }
    }
  }
};