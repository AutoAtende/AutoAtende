import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn("Prompts", "queueId", {
      type: DataTypes.INTEGER,
      references: {
        model: "Queues",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn("Prompts", "queueId", {
      type: DataTypes.INTEGER,
      references: {
        model: "Queues",
        key: "id"
      },
      onUpdate: "NO ACTION",
      onDelete: "NO ACTION"
    });
  }
};