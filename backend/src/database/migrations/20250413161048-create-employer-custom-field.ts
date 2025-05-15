module.exports = {
    up: (queryInterface, Sequelize) => {
      return queryInterface.createTable("EmployerCustomFields", {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        value: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        employerId: {
          type: Sequelize.INTEGER,
          references: { model: "ContactEmployers", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE"
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
  
    down: queryInterface => {
      return queryInterface.dropTable("EmployerCustomFields");
    }
  };