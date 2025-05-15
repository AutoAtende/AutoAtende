module.exports = {
    up: async (queryInterface, Sequelize) => {
      const tableName = 'TaskTimelines';
      const columnName = 'updatedAt';
      
      const tableDesc = await queryInterface.describeTable(tableName);
      if (!tableDesc[columnName]) {
        await queryInterface.addColumn(tableName, columnName, {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('NOW()')
        });
      }
    },
  
    down: async (queryInterface) => {
      await queryInterface.removeColumn('TaskTimelines', 'updatedAt');
    }
  };
  