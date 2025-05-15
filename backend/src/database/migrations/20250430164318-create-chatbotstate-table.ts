import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('ChatbotStates', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ticketId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Tickets',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Companies',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      state: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      step: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      selectedServiceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      selectedProfessionalId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      selectedDate: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      selectedTime: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      appointmentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      availableServices: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      availableProfessionals: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      availableDates: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      availableTimeSlots: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      upcomingAppointments: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      lastInteractionAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      flowExecutionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'FlowBuilderExecutions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      isInFlow: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('ChatbotStates');
  },
};