// Migration para atualizar a tabela Groups
// Arquivo: XXXX-update-groups-table.js

"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verificar se as colunas já existem antes de adicioná-las
    const tableDescription = await queryInterface.describeTable("Groups");
    
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Adicionar coluna whatsappId se não existir
      if (!tableDescription.whatsappId) {
        await queryInterface.addColumn(
          "Groups",
          "whatsappId",
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: "Whatsapps",
              key: "id"
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL"
          },
          { transaction }
        );
      }

      // Adicionar coluna userRole se não existir
      if (!tableDescription.userRole) {
        await queryInterface.addColumn(
          "Groups",
          "userRole",
          {
            type: Sequelize.ENUM("admin", "participant", "unknown"),
            allowNull: true,
            defaultValue: "unknown"
          },
          { transaction }
        );
      }

      // Adicionar coluna isActive se não existir
      if (!tableDescription.isActive) {
        await queryInterface.addColumn(
          "Groups",
          "isActive",
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
          },
          { transaction }
        );
      }

      // Adicionar coluna lastSync se não existir
      if (!tableDescription.lastSync) {
        await queryInterface.addColumn(
          "Groups",
          "lastSync",
          {
            type: Sequelize.DATE,
            allowNull: true
          },
          { transaction }
        );
      }

      // Adicionar coluna syncStatus se não existir
      if (!tableDescription.syncStatus) {
        await queryInterface.addColumn(
          "Groups",
          "syncStatus",
          {
            type: Sequelize.ENUM("pending", "syncing", "synced", "error"),
            allowNull: true,
            defaultValue: "pending"
          },
          { transaction }
        );
      }

      // Adicionar índices para melhor performance
      await queryInterface.addIndex("Groups", ["companyId", "isActive"], {
        name: "groups_company_active_idx",
        transaction
      });

      await queryInterface.addIndex("Groups", ["whatsappId"], {
        name: "groups_whatsapp_idx",
        transaction
      });

      await queryInterface.addIndex("Groups", ["userRole"], {
        name: "groups_user_role_idx",
        transaction
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Remover índices
      await queryInterface.removeIndex("Groups", "groups_company_active_idx", { transaction });
      await queryInterface.removeIndex("Groups", "groups_whatsapp_idx", { transaction });
      await queryInterface.removeIndex("Groups", "groups_user_role_idx", { transaction });

      // Remover colunas
      await queryInterface.removeColumn("Groups", "whatsappId", { transaction });
      await queryInterface.removeColumn("Groups", "userRole", { transaction });
      await queryInterface.removeColumn("Groups", "isActive", { transaction });
      await queryInterface.removeColumn("Groups", "lastSync", { transaction });
      await queryInterface.removeColumn("Groups", "syncStatus", { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};