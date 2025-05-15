import {DataTypes, QueryInterface} from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tickets", "imported", {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    })
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tickets", "imported")
  }
};
