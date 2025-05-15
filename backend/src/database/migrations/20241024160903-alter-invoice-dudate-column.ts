'use strict';

import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Primeiro, vamos garantir que os dados existentes sejam convertidos corretamente
    await queryInterface.sequelize.query(`
      UPDATE "Invoices" 
      SET "dueDate" = NULL 
      WHERE "dueDate" IS NOT NULL AND "dueDate" NOT SIMILAR TO '[0-9]{4}-[0-9]{2}-[0-9]{2}%'
    `);

    // Agora vamos alterar temporariamente para string
    await queryInterface.changeColumn("Invoices", "dueDate", {
      type: DataTypes.STRING,
      allowNull: true
    });

    // Converter para timestamp
    await queryInterface.sequelize.query(`
      ALTER TABLE "Invoices"
      ALTER COLUMN "dueDate" TYPE TIMESTAMP
      USING CASE 
        WHEN "dueDate" IS NOT NULL AND "dueDate" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' 
        THEN "dueDate"::timestamp 
        ELSE NULL 
      END
    `);

    // Finalmente, definir o tipo final como DATE
    await queryInterface.changeColumn("Invoices", "dueDate", {
      type: DataTypes.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.changeColumn("Invoices", "dueDate", {
      type: DataTypes.STRING,
      allowNull: true
    });
  }
};