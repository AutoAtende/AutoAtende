module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('KanbanBoards', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      queueId: {
        type: Sequelize.INTEGER,
        references: { model: 'Queues', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      ticketId: {
        type: Sequelize.INTEGER,
        references: { model: 'Tickets', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      lane: {
        type: Sequelize.STRING,
        allowNull: false
      },
      companyId: {
        type: Sequelize.INTEGER,
        references: { model: 'Companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('KanbanBoards', ['queueId']);
    await queryInterface.addIndex('KanbanBoards', ['ticketId']);
    await queryInterface.addIndex('KanbanBoards', ['companyId']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('KanbanBoards');
  }
};