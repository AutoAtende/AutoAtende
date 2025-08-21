import { QueryInterface } from "sequelize";

export const up = (queryInterface: QueryInterface) => {
  return queryInterface.addConstraint("Tickets", {
    fields: ["contactId", "companyId", "whatsappId"],
    type: "unique",
    name: "contactid_companyid_unique"
  });
};

export const down = (queryInterface: QueryInterface) => {
  return queryInterface.removeConstraint(
    "Tickets",
    "contactid_companyid_unique"
  );
};
