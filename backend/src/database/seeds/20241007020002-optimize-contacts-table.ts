
module.exports = {
    up: async (queryInterface, Sequelize) => {
      // Adiciona índice otimizado
      await queryInterface.sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_contacts_number_company 
        ON "Contacts" (number, "companyId");
      `);
  
      // Configura a tabela para manter estatísticas precisas
      await queryInterface.sequelize.query(`
        ALTER TABLE "Contacts" ALTER COLUMN number SET STATISTICS 1000;
        ALTER TABLE "Contacts" ALTER COLUMN "companyId" SET STATISTICS 1000;
        ALTER TABLE "Contacts" SET (
          autovacuum_vacuum_scale_factor = 0.05,
          autovacuum_analyze_scale_factor = 0.02
        );
      `);
    },
  
    down: async (queryInterface, Sequelize) => {
      await queryInterface.sequelize.query(`
        DROP INDEX IF EXISTS idx_contacts_number_company;
      `);
    }
  };