module.exports = {
    up: async (queryInterface, Sequelize) => {
      // Adicionar nova coluna employerId
      await queryInterface.addColumn('Tasks', 'employerId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ContactEmployers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
  
      // Migrar dados (opcional): Copiar o employerId do Contact correspondente para a nova coluna
      // Isso depende da sua estrutura de dados atual
      const [tasks] = await queryInterface.sequelize.query('SELECT id, "contactId" FROM "Tasks" WHERE "contactId" IS NOT NULL');
      
      for (const task of tasks) {
        if (task.contactId) {
          const [contact] = await queryInterface.sequelize.query(
            'SELECT "employerId" FROM "Contacts" WHERE id = :contactId', 
            { replacements: { contactId: task.contactId } }
          );
          
          if (contact && contact.length > 0 && contact[0].employerId) {
            await queryInterface.sequelize.query(
              'UPDATE "Tasks" SET "employerId" = :employerId WHERE id = :taskId',
              { 
                replacements: { 
                  employerId: contact[0].employerId, 
                  taskId: task.id 
                } 
              }
            );
          }
        }
      }
    },
  
    down: async (queryInterface, Sequelize) => {
      // Remover a coluna employerId caso precise reverter
      await queryInterface.removeColumn('Tasks', 'employerId');
    }
  };