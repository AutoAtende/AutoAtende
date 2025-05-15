import { QueryInterface, DataTypes } from 'sequelize';

export default {
    up: (queryInterface: QueryInterface) => {
        return queryInterface.addColumn("Users", "limitAttendance", {
            defaultValue: null,
            type: DataTypes.INTEGER
        });
    },
    down: (queryInterface: QueryInterface) => {
        return queryInterface.removeColumn("Users", "limitAttendance");
    }
};