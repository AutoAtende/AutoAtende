module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable("ContactTags", {
        contactId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Contacts", // Nome da tabela referenciada
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          primaryKey: true, // Chave composta
        },
        tagId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Tags", // Nome da tabela referenciada
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          primaryKey: true, // Chave composta
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
      await queryInterface.dropTable("ContactTags");
    },
  };
  