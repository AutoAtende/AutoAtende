import {DataTypes, QueryInterface} from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tags", "recurrentTime", {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: null
    })
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tags", "recurrentTime")
  }
};
