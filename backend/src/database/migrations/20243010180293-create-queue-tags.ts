module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Cria a tabela QueueTag
    await queryInterface.createTable('QueueTags', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      queueId: {
        type: Sequelize.INTEGER,
        references: { model: 'Queues', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
      },
      tagId: {
        type: Sequelize.INTEGER,
        references: { model: 'Tags', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Adiciona índice único para evitar duplicatas entre queueId e tagId
    await queryInterface.addIndex('QueueTags', ['queueId', 'tagId'], {
      unique: true,
      name: 'unique_queue_tag_pair',
    });
  },

  down: async (queryInterface) => {
    // Remove a tabela QueueTags
    await queryInterface.dropTable('QueueTags');
  },
};
