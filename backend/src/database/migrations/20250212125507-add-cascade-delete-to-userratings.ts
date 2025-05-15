module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Primeiro, vamos limpar registros órfãos
      await queryInterface.sequelize.query(`
        DELETE FROM "UserQueues"
        WHERE "userId" NOT IN (SELECT id FROM "Users");
      `);

      await queryInterface.sequelize.query(`
        DELETE FROM "UserRatings"
        WHERE "userId" NOT IN (SELECT id FROM "Users");
      `);

      // Agora podemos atualizar as constraints com segurança
      const constraints = await queryInterface.sequelize.query(`
        SELECT conname FROM pg_constraint WHERE conname IN (
          'UserRatings_userId_fkey', 'UserQueues_userId_fkey'
        );
      `, { type: Sequelize.QueryTypes.SELECT });

      if (constraints.some(c => c.conname === 'UserRatings_userId_fkey')) {
        await queryInterface.sequelize.query(`
          ALTER TABLE "UserRatings" 
          DROP CONSTRAINT "UserRatings_userId_fkey";
        `);
      }

      await queryInterface.sequelize.query(`
        ALTER TABLE "UserRatings" 
        ADD CONSTRAINT "UserRatings_userId_fkey" 
        FOREIGN KEY ("userId") 
        REFERENCES "Users" (id) 
        ON DELETE CASCADE;
      `);

      if (constraints.some(c => c.conname === 'UserQueues_userId_fkey')) {
        await queryInterface.sequelize.query(`
          ALTER TABLE "UserQueues" 
          DROP CONSTRAINT "UserQueues_userId_fkey";
        `);
      }

      await queryInterface.sequelize.query(`
        ALTER TABLE "UserQueues" 
        ADD CONSTRAINT "UserQueues_userId_fkey" 
        FOREIGN KEY ("userId") 
        REFERENCES "Users" (id) 
        ON DELETE CASCADE;
      `);
    } catch (error) {
      console.error('Erro durante a migração:', error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const constraints = await queryInterface.sequelize.query(`
        SELECT conname FROM pg_constraint WHERE conname IN (
          'UserRatings_userId_fkey', 'UserQueues_userId_fkey'
        );
      `, { type: Sequelize.QueryTypes.SELECT });

      if (constraints.some(c => c.conname === 'UserRatings_userId_fkey')) {
        await queryInterface.sequelize.query(`
          ALTER TABLE "UserRatings" 
          DROP CONSTRAINT "UserRatings_userId_fkey";
        `);
      }

      await queryInterface.sequelize.query(`
        ALTER TABLE "UserRatings" 
        ADD CONSTRAINT "UserRatings_userId_fkey" 
        FOREIGN KEY ("userId") 
        REFERENCES "Users" (id);
      `);

      if (constraints.some(c => c.conname === 'UserQueues_userId_fkey')) {
        await queryInterface.sequelize.query(`
          ALTER TABLE "UserQueues" 
          DROP CONSTRAINT "UserQueues_userId_fkey";
        `);
      }

      await queryInterface.sequelize.query(`
        ALTER TABLE "UserQueues" 
        ADD CONSTRAINT "UserQueues_userId_fkey" 
        FOREIGN KEY ("userId") 
        REFERENCES "Users" (id);
      `);
    } catch (error) {
      console.error('Erro durante o rollback:', error);
    }
  }
};
