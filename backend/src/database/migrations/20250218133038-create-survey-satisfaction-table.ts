module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SatisfactionSurveys', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      companyId: {
        type: Sequelize.INTEGER,
        references: { model: 'Companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      answers: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      overallSatisfaction: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      atendimentoScore: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      gerenciamentoScore: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      whatsappScore: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      tarefasScore: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      recursosScore: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      suporteScore: {
        type: Sequelize.FLOAT,
        allowNull: true
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

    await queryInterface.addIndex('SatisfactionSurveys', ['userId']);
    await queryInterface.addIndex('SatisfactionSurveys', ['companyId']);
    await queryInterface.addIndex('SatisfactionSurveys', ['createdAt']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('SatisfactionSurveys');
  }
};