module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn("TicketTraking", "lastInactivityCheckAt", {
        type: Sequelize.DATE,
        allowNull: true
      });
      
      await queryInterface.addColumn("TicketTraking", "inactivityWarningCount", {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      });
    },
    
    down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn("TicketTraking", "lastInactivityCheckAt");
      await queryInterface.removeColumn("TicketTraking", "inactivityWarningCount");
    }
  };