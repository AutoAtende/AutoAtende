'use strict';

import {QueryInterface, DataTypes} from "sequelize";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("Tags", "mediaPath", {
      allowNull: true,
      type: DataTypes.TEXT
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Tags", "mediaPath")

  }
};
