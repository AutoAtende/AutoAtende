import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableDefinition = await queryInterface.describeTable("QueueIntegrations");

    if (!tableDefinition["generatedViaParameters"]) {
      await queryInterface.addColumn("QueueIntegrations", "generatedViaParameters", {
        type: DataTypes.STRING(255),
        allowNull: true,
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const tableDefinition = await queryInterface.describeTable("QueueIntegrations");

    if (tableDefinition["generatedViaParameters"]) {
      await queryInterface.removeColumn("QueueIntegrations", "generatedViaParameters");
    }
  },
};
