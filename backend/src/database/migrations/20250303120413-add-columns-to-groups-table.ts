// Migração para adicionar campos à tabela Groups
module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('Groups', 'inviteLink', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      });
  
      await queryInterface.addColumn('Groups', 'description', {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      });
  
      await queryInterface.addColumn('Groups', 'settings', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: null
      });
  
      await queryInterface.addColumn('Groups', 'adminParticipants', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: null
      });
      
      // Se a coluna já existir, não precisamos adicioná-la novamente
      try {
        await queryInterface.describeTable('Groups').then(tableDefinition => {
          if (!tableDefinition.profilePic) {
            return queryInterface.addColumn('Groups', 'profilePic', {
              type: Sequelize.STRING,
              allowNull: true,
              defaultValue: null
            });
          }
        });
      } catch (error) {
        console.log("Erro ao verificar/adicionar coluna profilePic:", error);
      }
      
      await queryInterface.addColumn('Groups', 'profilePicOriginal', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      });
    },
  
    down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('Groups', 'inviteLink');
      await queryInterface.removeColumn('Groups', 'description');
      await queryInterface.removeColumn('Groups', 'settings');
      await queryInterface.removeColumn('Groups', 'adminParticipants');
      await queryInterface.removeColumn('Groups', 'profilePicOriginal');
    }
  };