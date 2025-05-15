import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn('QueueIntegrations', 'n8nApiKey', {
      type: DataTypes.STRING,
      allowNull: true, // ou false, dependendo da sua necessidade
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn('QueueIntegrations', 'n8nApiKey');
  },
};
