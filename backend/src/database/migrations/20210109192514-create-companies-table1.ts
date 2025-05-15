import { type } from "os";
import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async(queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Companies", "cnpj", {
      type: DataTypes.STRING,
      allowNull: true
    });
    await queryInterface.addColumn("Companies", "razaosocial", {
      type: DataTypes.STRING,
      allowNull: true
    });
    await queryInterface.addColumn("Companies", "cep", {
      type: DataTypes.STRING,
      allowNull: true
    });
    await queryInterface.addColumn("Companies", "estado", {
      type: DataTypes.STRING,
      allowNull: true
    });
    await queryInterface.addColumn("Companies", "cidade", {
      type: DataTypes.STRING,
      allowNull: true
    });
    await queryInterface.addColumn("Companies", "bairro", {
      type: DataTypes.STRING,
      allowNull: true
    });
    await queryInterface.addColumn("Companies", "logradouro", {
      type: DataTypes.STRING,
      allowNull: true
    });
    await queryInterface.addColumn("Companies", "numero", {
      type: DataTypes.STRING,
      allowNull: true
    });
    await queryInterface.addColumn("Companies", "diaVencimento", {
      type: DataTypes.STRING,
      allowNull: true
    });
  },

  down: async(queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Companies", "cnpj");
    await queryInterface.removeColumn("Companies", "razaosocial");
    await queryInterface.removeColumn("Companies", "cep");
    await queryInterface.removeColumn("Companies", "estado");
    await queryInterface.removeColumn("Companies", "cidade");
    await queryInterface.removeColumn("Companies", "bairro");
    await queryInterface.removeColumn("Companies", "logradouro");
    await queryInterface.removeColumn("Companies", "numero");
    await queryInterface.removeColumn("Companies", "diaVendimento");
  }
};
