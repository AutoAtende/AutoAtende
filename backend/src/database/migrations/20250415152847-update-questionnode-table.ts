'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      // Adicionar campo validationType para controlar o tipo de validação
      await queryInterface.addColumn(
        'QuestionNodes',
        'validationType',
        {
          type: Sequelize.STRING,
          allowNull: true,
          transaction
        }
      );

      // Adicionar campo useValidationErrorOutput para roteamento em caso de erro
      await queryInterface.addColumn(
        'QuestionNodes',
        'useValidationErrorOutput',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: true,
          transaction
        }
      );

      // Adicionar campos para configuração de mídia
      await queryInterface.addColumn(
        'QuestionNodes',
        'mediaType',
        {
          type: Sequelize.STRING,
          allowNull: true,
          transaction
        }
      );

      await queryInterface.addColumn(
        'QuestionNodes',
        'allowedFormats',
        {
          type: Sequelize.JSONB,
          allowNull: true,
          transaction
        }
      );

      await queryInterface.addColumn(
        'QuestionNodes',
        'maxFileSize',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          transaction
        }
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeColumn('QuestionNodes', 'validationType', { transaction });
      await queryInterface.removeColumn('QuestionNodes', 'useValidationErrorOutput', { transaction });
      await queryInterface.removeColumn('QuestionNodes', 'mediaType', { transaction });
      await queryInterface.removeColumn('QuestionNodes', 'allowedFormats', { transaction });
      await queryInterface.removeColumn('QuestionNodes', 'maxFileSize', { transaction });
    });
  }
};