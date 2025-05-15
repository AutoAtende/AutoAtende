'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS contacts_number_company_index'
      );
    } catch (error) {
      console.log('Índice anterior não existia, continuando...');
    }

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX contacts_number_company_index 
      ON "Contacts" (number, "companyId")
    `);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS contacts_number_company_index'
    );
  }
};