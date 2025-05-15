module.exports = {
    up: (queryInterface, Sequelize) => {
      return queryInterface.addColumn('Contacts', 'active', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      });
    },
    down: (queryInterface) => {
      return queryInterface.removeColumn('Contacts', 'active');
    }
  };