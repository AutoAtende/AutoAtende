'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Horarios', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            date: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            startTime: {
                type: Sequelize.TIME,
                allowNull: false
            },
            endTime: {
                type: Sequelize.TIME,
                allowNull: false
            },
            isHoliday: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            isWeekday: {
                type: Sequelize.BOOLEAN,
                allowNull: false
            },
            workedDay: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            description: {
                type: Sequelize.TEXT,
            },
            companyId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'Companies',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
        // Adiciona índice para melhorar a performance das consultas
        await queryInterface.addIndex('Horarios', ['companyId']);
        await queryInterface.addIndex('Horarios', ['date']);
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Horarios');
    }
};