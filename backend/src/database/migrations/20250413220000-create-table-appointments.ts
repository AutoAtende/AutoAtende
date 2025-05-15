module.exports = {
    up: (queryInterface, Sequelize) => {
      return queryInterface.createTable("Appointments", {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        uuid: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        scheduledAt: {
          type: Sequelize.DATE,
          allowNull: false
        },
        duration: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        status: {
          type: Sequelize.ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show'),
          defaultValue: 'pending',
          allowNull: false
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        cancellationReason: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        customerNotes: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        customerConfirmed: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false
        },
        reminderSent: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false
        },
        professionalId: {
          type: Sequelize.INTEGER,
          references: { model: "Professionals", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
          allowNull: true
        },
        serviceId: {
          type: Sequelize.INTEGER,
          references: { model: "Services", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
          allowNull: true
        },
        contactId: {
          type: Sequelize.INTEGER,
          references: { model: "Contacts", key: "id" },
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
        ticketId: {
          type: Sequelize.INTEGER,
          references: { model: "Tickets", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
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
    },
  
    down: (queryInterface) => {
      return queryInterface.dropTable("Appointments");
    }
  };