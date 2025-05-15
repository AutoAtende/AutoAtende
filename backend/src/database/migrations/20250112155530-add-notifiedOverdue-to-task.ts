module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('Tasks', 'notifiedOverdue', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    },
  
    down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('Tasks', 'notifiedOverdue');
    }
  };