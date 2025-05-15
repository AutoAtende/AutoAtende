'use strict';

import {DataTypes, QueryInterface} from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn('Whatsapps', 'allowGroup', {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }).then(() => {
      return queryInterface.addColumn('Whatsapps', 'statusImportMessages', {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true
      });
    }).then(() => {
      return queryInterface.addColumn('Whatsapps', 'importOldMessages', {
        type: DataTypes.TEXT,
        allowNull: true
      });
    }).then(() => {
      return queryInterface.addColumn('Whatsapps', 'importRecentMessages', {
        type: DataTypes.TEXT,
        allowNull: true
      });
    }).then(() => {
      return queryInterface.addColumn('Whatsapps', 'closedTicketsPostImported', {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true
      });
    }).then(() => {
      return queryInterface.addColumn('Whatsapps', 'importOldMessagesGroups', {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true
      });
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Whatsapps', 'allowGroup').then(() => {
      return queryInterface.removeColumn('Whatsapps', 'statusImportMessages');
    }).then(() => {
      return queryInterface.removeColumn('Whatsapps', 'importOldMessages');
    }).then(() => {
      return queryInterface.removeColumn('Whatsapps', 'importRecentMessages');
    }).then(() => {
      return queryInterface.removeColumn('Whatsapps', 'closedTicketsPostImported');
    }).then(() => {
      return queryInterface.removeColumn('Whatsapps', 'importOldMessagesGroups');
    });
  }
};
