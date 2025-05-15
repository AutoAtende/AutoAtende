module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('AttendantNodes', 'userId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    },
  
    down: async (queryInterface) => {
      await queryInterface.removeColumn('AttendantNodes', 'userId');
    }
  };