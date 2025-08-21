import { QueryInterface, DataTypes } from "sequelize";

export const up = (queryInterface: QueryInterface) => {
  return Promise.all([
    queryInterface.sequelize.query('DELETE FROM "Settings"'),
    queryInterface.removeConstraint("Settings", "Settings_pkey"),
    queryInterface.addColumn("Settings", "id", {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    })
  ]);
};

export const down = (queryInterface: QueryInterface) => {
  return Promise.all([
    queryInterface.sequelize.query('DELETE FROM "Settings"'),
    queryInterface.removeColumn("Settings", "id"),
    queryInterface.addConstraint("Settings", {
      fields: ["key"],
      type: "primary key",
      name: "Settings_pkey"
    })
  ]);
};
