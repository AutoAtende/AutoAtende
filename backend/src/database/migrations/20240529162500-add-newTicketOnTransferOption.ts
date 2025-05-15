import {DataTypes, QueryInterface} from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Queues", "newTicketOnTransfer", {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    })
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Queues", "newTicketOnTransfer")
  }
};
