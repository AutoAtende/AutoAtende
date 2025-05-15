import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Users", "glpiUser", {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    }),
    queryInterface.addColumn("Users", "glpiPass", {
      type: DataTypes.STRING,
      defaultValue: "",
      allowNull: true
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Users", "glpiUser"),
           queryInterface.removeColumn("Users", "glpiPass");
  }
};
