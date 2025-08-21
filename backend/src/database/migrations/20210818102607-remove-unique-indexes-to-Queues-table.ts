import { QueryInterface } from "sequelize";

export const up = (queryInterface: QueryInterface) => {
  return Promise.all([
    queryInterface.removeConstraint("Queues", "Queues_color_key"),
    queryInterface.removeConstraint("Queues", "Queues_name_key"),
    queryInterface.removeIndex("Queues", "Queues_color_key"),
    queryInterface.removeIndex("Queues", "Queues_name_key"),
  ]);
};

export const down = (queryInterface: QueryInterface) => {
  return Promise.all([
    queryInterface.addConstraint("Queues", {
      fields: ["color"],
      type: "unique",
      name: "Queues_color_key"
    }),
    queryInterface.addConstraint("Queues", {
      fields: ["name"],
      type: "unique",
      name: "Queues_name_key"
    }),
  ]);
};
