module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('Whatsapps', 'collectiveVacationMessage', {
        type: Sequelize.TEXT,
        allowNull: true
      });
      await queryInterface.addColumn('Whatsapps', 'collectiveVacationStart', {
        type: Sequelize.DATE,
        allowNull: true
      });
      await queryInterface.addColumn('Whatsapps', 'collectiveVacationEnd', {
        type: Sequelize.DATE,
        allowNull: true
      });
    },
  
    down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('Whatsapps', 'collectiveVacationMessage');
      await queryInterface.removeColumn('Whatsapps', 'collectiveVacationStart');
      await queryInterface.removeColumn('Whatsapps', 'collectiveVacationEnd');
    }
  };