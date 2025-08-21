import { QueryInterface } from "sequelize";

export const up = async (queryInterface: QueryInterface) => {
  return queryInterface.addConstraint("Contacts", {
    fields: ["number", "companyId"],
    type: "unique",
    name: "number_companyid_unique"
  });
};

export const down = async (queryInterface: QueryInterface) => {
  return queryInterface.removeConstraint(
    "Contacts",
    "number_companyid_unique"
  );
};
