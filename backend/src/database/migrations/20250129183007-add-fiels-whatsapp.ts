module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Whatsapps', 'timeInactiveMessage', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Whatsapps', 'inactiveMessage', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Whatsapps', 'timeInactiveMessage');
    await queryInterface.removeColumn('Whatsapps', 'inactiveMessage');
  }
};