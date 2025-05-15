module.exports = {
    up: (queryInterface, Sequelize) => {
      return queryInterface.createTable("DatabaseNodes", {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        nodeId: {
          type: Sequelize.STRING,
          allowNull: false
        },
        companyId: {
          type: Sequelize.INTEGER,
          references: { model: "Companies", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          allowNull: false
        },
        databaseType: {
          type: Sequelize.STRING,
          allowNull: false
        },
        operation: {
          type: Sequelize.STRING,
          allowNull: false
        },
        collection: {
          type: Sequelize.STRING
        },
        document: {
          type: Sequelize.STRING
        },
        whereConditions: {
          type: Sequelize.JSON
        },
        orderBy: {
          type: Sequelize.JSON
        },
        limit: {
          type: Sequelize.INTEGER,
          defaultValue: 10
        },
        responseVariable: {
          type: Sequelize.STRING,
          allowNull: false
        },
        credentials: {
          type: Sequelize.TEXT
        },
        dataToWrite: {
          type: Sequelize.TEXT
        },
        useVariableForData: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        dataVariable: {
          type: Sequelize.STRING
        },
        host: {
          type: Sequelize.STRING
        },
        port: {
          type: Sequelize.STRING
        },
        database: {
          type: Sequelize.STRING
        },
        username: {
          type: Sequelize.STRING
        },
        password: {
          type: Sequelize.STRING
        },
        sqlQuery: {
          type: Sequelize.TEXT
        },
        sqlParams: {
          type: Sequelize.JSON
        },
        storeErrorResponse: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        statusVariable: {
          type: Sequelize.STRING
        },
        timeout: {
          type: Sequelize.INTEGER,
          defaultValue: 30000
        },
        retries: {
          type: Sequelize.INTEGER,
          defaultValue: 1
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
      return queryInterface.dropTable("DatabaseNodes");
    }
  };