module.exports = {
    up: (queryInterface, Sequelize) => {
      return queryInterface.createTable("ScheduleSettings", {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        scheduleEnabled: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: false
        },
        minScheduleHoursAhead: {
          type: Sequelize.INTEGER,
          defaultValue: 1,
          allowNull: false
        },
        maxScheduleDaysAhead: {
          type: Sequelize.INTEGER,
          defaultValue: 30,
          allowNull: false
        },
        reminderHours: {
          type: Sequelize.INTEGER,
          defaultValue: 24,
          allowNull: false
        },
        welcomeMessage: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        confirmationMessage: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        reminderMessage: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        cancelMessage: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        noSlotsMessage: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        companyId: {
          type: Sequelize.INTEGER,
          references: { model: "Companies", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
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
  
    down: (queryInterface) => {
      return queryInterface.dropTable("ScheduleSettings");
    }
  };