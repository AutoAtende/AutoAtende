module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('Tasks', 'lastNotificationSent', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    },
  
    down: async (queryInterface) => {
      await queryInterface.removeColumn('Tasks', 'lastNotificationSent');
    }
  };