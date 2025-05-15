import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.addColumn("Invoices", "txId", {
          type: DataTypes.STRING,
        }, { transaction }),
        queryInterface.addColumn("Invoices", "payGw", {
          type: DataTypes.STRING,
        }, { transaction }),
        queryInterface.addColumn("Invoices", "payGwData", {
          type: DataTypes.TEXT,
        }, { transaction }),
        queryInterface.addIndex("Invoices", ["txId"], {
          name: "idx_txid",
          unique: false,
          transaction
        })
      ]);
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.removeColumn("Invoices", "txId", { transaction }),
        queryInterface.removeColumn("Invoices", "payGw", { transaction }),
        queryInterface.removeColumn("Invoices", "payGwData", { transaction })
      ]);
    });
  }
};
