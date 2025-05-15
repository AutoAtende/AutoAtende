module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable("Reports", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        chatId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "Chats", // Nome da tabela referenciada
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "Users", // Nome da tabela referenciada
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        reportedBy: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "Users", // Nome da tabela referenciada
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        reason: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        status: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },
      });
    },
  
    down: async (queryInterface, Sequelize) => {
      await queryInterface.dropTable("Reports");
    },
  };
  