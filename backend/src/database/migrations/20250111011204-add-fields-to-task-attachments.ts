import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Verificar e adicionar a coluna 'original_name'
    const tableDescription = await queryInterface.describeTable("TaskAttachments");
    if (!tableDescription["originalName"]) {
      await queryInterface.addColumn("TaskAttachments", "originalName", {
        type: DataTypes.STRING,
        allowNull: true,
      });
    }

    // Verificar e adicionar a coluna 'mime_type'
    if (!tableDescription["mimeType"]) {
      await queryInterface.addColumn("TaskAttachments", "mimeType", {
        type: DataTypes.STRING,
        allowNull: true,
      });
    }

    // Verificar e adicionar a coluna 'size'
    if (!tableDescription["size"]) {
      await queryInterface.addColumn("TaskAttachments", "size", {
        type: DataTypes.INTEGER,
        allowNull: true,
      });
    }

    // Verificar e adicionar a coluna 'filepath'
    if (!tableDescription["filepath"]) {
      await queryInterface.addColumn("TaskAttachments", "filepath", {
        type: DataTypes.STRING,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    // Remover as colunas, se existirem
    const tableDescription = await queryInterface.describeTable("TaskAttachments");

    if (tableDescription["originalName"]) {
      await queryInterface.removeColumn("TaskAttachments", "originalName");
    }

    if (tableDescription["mimeType"]) {
      await queryInterface.removeColumn("TaskAttachments", "mimeType");
    }

    if (tableDescription["size"]) {
      await queryInterface.removeColumn("TaskAttachments", "size");
    }

    if (tableDescription["filepath"]) {
      await queryInterface.removeColumn("TaskAttachments", "filepath");
    }
  },
};
