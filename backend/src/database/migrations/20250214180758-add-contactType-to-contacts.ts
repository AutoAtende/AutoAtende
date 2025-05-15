// No arquivo da migration para alterar a tabela contacts
module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('Contacts', 'contactType', {
        type: Sequelize.ENUM('whatsapp', 'phone', 'email'),
        defaultValue: 'whatsapp',
        allowNull: false
      });
    },
    down: async (queryInterface) => {
      await queryInterface.removeColumn('Contacts', 'contactType');
    }
  };