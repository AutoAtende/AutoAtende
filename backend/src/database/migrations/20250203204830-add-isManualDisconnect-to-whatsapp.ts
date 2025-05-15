// Nova migration
module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('Whatsapps', 'isManualDisconnect', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    },
  
    down: async (queryInterface) => {
      await queryInterface.removeColumn('Whatsapps', 'isManualDisconnect');
    }
  };