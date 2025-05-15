import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    try {
      await queryInterface.removeConstraint("Whatsapps", "Whatsapps_name_key");
    } catch (e) {
      // no operation
    }
    return queryInterface.addConstraint("Whatsapps", ["companyId", "name"], {
      type: "unique",
      name: "company_name_constraint"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    try {
      await queryInterface.addConstraint("Whatsapps", ["name"], {
        type: "unique",
        name: "Whatsapps_name_key"
      });
    } catch (e) {
      // no operation
    }

    return queryInterface.removeConstraint(
      "Whatsapps",
      "company_name_constraint"
    );
  }
};