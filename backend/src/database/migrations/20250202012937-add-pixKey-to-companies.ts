module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn("Companies", "pixKey", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    },
  
    down: async (queryInterface) => {
      await queryInterface.removeColumn("Companies", "pixKey");
    },
  };
  