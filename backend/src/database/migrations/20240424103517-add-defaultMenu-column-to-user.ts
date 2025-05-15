import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Users", "defaultMenu", {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "closed"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Users", "defaultMenu");
  }
};
