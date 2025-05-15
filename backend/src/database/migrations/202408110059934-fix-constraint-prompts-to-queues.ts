import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // First remove the existing constraint
      await queryInterface.removeConstraint("Prompts", "Prompts_queueId_fkey", { transaction });

      // Add the new constraint with CASCADE
      await queryInterface.changeColumn(
        "Prompts",
        "queueId",
        {
          type: DataTypes.INTEGER,
          references: {
            model: "Queues",
            key: "id"
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE"
        },
        { transaction }
      );
    });
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Revert back to the original constraint
      await queryInterface.removeConstraint("Prompts", "Prompts_queueId_fkey", { transaction });

      await queryInterface.changeColumn(
        "Prompts",
        "queueId",
        {
          type: DataTypes.INTEGER,
          references: {
            model: "Queues",
            key: "id"
          },
          onUpdate: "NO ACTION",
          onDelete: "NO ACTION"
        },
        { transaction }
      );
    });
  }
};