module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('LandingPageMedia', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        originalName: {
          type: Sequelize.STRING
        },
        path: {
          type: Sequelize.STRING,
          allowNull: false
        },
        url: {
          type: Sequelize.STRING,
          allowNull: false
        },
        mimeType: {
          type: Sequelize.STRING
        },
        size: {
          type: Sequelize.INTEGER
        },
        landingPageId: {
          type: Sequelize.INTEGER,
          references: { model: 'LandingPages', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        companyId: {
          type: Sequelize.INTEGER,
          references: { model: 'Companies', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          allowNull: false
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
    },
  
    down: async (queryInterface) => {
      await queryInterface.dropTable('LandingPageMedia');
    }
  };