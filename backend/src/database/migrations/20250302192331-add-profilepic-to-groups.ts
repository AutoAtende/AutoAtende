module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn("Groups", "profilePic", {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      });
    },
  
    down: async (queryInterface) => {
      await queryInterface.removeColumn("Groups", "profilePic");
    }
  };