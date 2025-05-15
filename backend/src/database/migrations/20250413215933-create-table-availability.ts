module.exports = {
    up: (queryInterface, Sequelize) => {
      return queryInterface.createTable("Availabilities", {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        weekday: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        weekdayLabel: {
          type: Sequelize.STRING,
          allowNull: false
        },
        startTime: {
          type: Sequelize.STRING,
          allowNull: false
        },
        endTime: {
          type: Sequelize.STRING,
          allowNull: false
        },
        startLunchTime: {
          type: Sequelize.STRING,
          allowNull: true
        },
        endLunchTime: {
            type: Sequelize.STRING,
            allowNull: true
          },
          slotDuration: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false
          },
          professionalId: {
            type: Sequelize.INTEGER,
            references: { model: "Professionals", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            allowNull: false
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
        return queryInterface.dropTable("Availabilities");
      }
    };