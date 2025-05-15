import { QueryInterface, DataTypes } from 'sequelize';
import { logger } from "../../utils/logger";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Verifica se a tabela existe de forma mais segura
      const [results] = await queryInterface.sequelize
        .query(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name = 'Emails'
          );`
        ) as [{ exists: boolean }[], unknown];

      const tableExists = results[0]?.exists || false;

      if (!tableExists) {
        logger.info('Creating Emails table from scratch');
        
        await queryInterface.createTable('Emails', {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          sender: {
            type: DataTypes.STRING,
            allowNull: false
          },
          subject: {
            type: DataTypes.STRING,
            allowNull: false
          },
          message: {
            type: DataTypes.TEXT,
            allowNull: false
          },
          status: {
            type: DataTypes.ENUM('PENDING', 'PROCESSING', 'SENT', 'ERROR', 'CANCELLED'),
            defaultValue: 'PENDING',
            allowNull: false
          },
          scheduled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
          },
          sendAt: {
            type: DataTypes.DATE,
            allowNull: true
          },
          sentAt: {
            type: DataTypes.DATE,
            allowNull: true
          },
          messageId: {
            type: DataTypes.STRING,
            allowNull: true
          },
          error: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          hasAttachments: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
          },
          companyId: {
            type: DataTypes.INTEGER,
            references: { model: 'Companies', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          createdAt: {
            type: DataTypes.DATE,
            allowNull: false
          },
          updatedAt: {
            type: DataTypes.DATE,
            allowNull: false
          }
        }, { transaction });

        // Criar o tipo ENUM para status
        await queryInterface.sequelize.query(`
          DO $$ 
          BEGIN 
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_emails_status') THEN
              CREATE TYPE "enum_emails_status" AS ENUM (
                'PENDING', 'PROCESSING', 'SENT', 'ERROR', 'CANCELLED'
              );
            END IF;
          END $$;
        `, { transaction });

      } else {
        logger.info('Emails table exists, checking columns');
        
        // Get existing columns
        const existingColumns = await queryInterface.describeTable('Emails');

        // Helper function to add column if it doesn't exist
        const addColumnIfNotExists = async (columnName: string, definition: any) => {
          if (!existingColumns[columnName]) {
            logger.info(`Adding column ${columnName} to Emails table`);
            await queryInterface.addColumn('Emails', columnName, definition, { transaction });
          }
        };

        // Check and add each column
        await Promise.all([
          addColumnIfNotExists('sender', {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
          }),

          addColumnIfNotExists('subject', {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
          }),

          addColumnIfNotExists('message', {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: ''
          }),

          addColumnIfNotExists('status', {
            type: DataTypes.ENUM('PENDING', 'PROCESSING', 'SENT', 'ERROR', 'CANCELLED'),
            defaultValue: 'PENDING',
            allowNull: false
          }),

          addColumnIfNotExists('scheduled', {
            type: DataTypes.BOOLEAN,
            defaultValue: false
          }),

          addColumnIfNotExists('sendAt', {
            type: DataTypes.DATE,
            allowNull: true
          }),

          addColumnIfNotExists('sentAt', {
            type: DataTypes.DATE,
            allowNull: true
          }),

          addColumnIfNotExists('messageId', {
            type: DataTypes.STRING,
            allowNull: true
          }),

          addColumnIfNotExists('error', {
            type: DataTypes.TEXT,
            allowNull: true
          }),

          addColumnIfNotExists('hasAttachments', {
            type: DataTypes.BOOLEAN,
            defaultValue: false
          }),

          addColumnIfNotExists('companyId', {
            type: DataTypes.INTEGER,
            references: { model: 'Companies', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          })
        ]);
      }

      // Verificar e adicionar índices
      const addIndexIfNotExists = async (indexName: string, fields: string[]) => {
        const [[results]] = await queryInterface.sequelize.query(
          `SELECT COUNT(*) as count
           FROM pg_indexes 
           WHERE tablename = 'Emails' 
           AND indexname = '${indexName}'`
        ) as [[{ count: string }], unknown];

        if (Number(results.count) === 0) {
          logger.info(`Adding index ${indexName}`);
          await queryInterface.addIndex('Emails', fields, {
            name: indexName,
            transaction
          });
        }
      };

      await Promise.all([
        addIndexIfNotExists('emails_status_sendat_idx', ['status', 'sendAt']),
        addIndexIfNotExists('emails_companyid_status_idx', ['companyId', 'status']),
        addIndexIfNotExists('emails_scheduled_status_idx', ['scheduled', 'status'])
      ]);

      await transaction.commit();
      logger.info('Emails table migration completed successfully');

    } catch (error) {
      await transaction.rollback();
      logger.error('Error in Emails table migration:', error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface) => {
    try {
      // Remove indexes if they exist
      const removeIndexIfExists = async (indexName: string) => {
        try {
          await queryInterface.removeIndex('Emails', indexName);
        } catch (error) {
          logger.warn(`Index ${indexName} may not exist`);
        }
      };

      await Promise.all([
        removeIndexIfExists('emails_status_sendat_idx'),
        removeIndexIfExists('emails_companyid_status_idx'),
        removeIndexIfExists('emails_scheduled_status_idx')
      ]);

      // Drop enum type if exists
      await queryInterface.sequelize.query(`
        DROP TYPE IF EXISTS "enum_emails_status" CASCADE;
      `);

      // Drop table if exists
      await queryInterface.dropTable('Emails', { cascade: true });

      logger.info('Emails table and related objects removed successfully');
    } catch (error) {
      logger.error('Error in Emails table rollback:', error);
      throw error;
    }
  }
};