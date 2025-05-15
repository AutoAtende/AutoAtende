'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const indexExists = async (tableName, indexName) => {
      const query = `
        SELECT 1
        FROM pg_indexes
        WHERE tablename = '${tableName.toLowerCase()}'
        AND indexname = '${indexName.toLowerCase()}'
      `;
      const [results] = await queryInterface.sequelize.query(query);
      return results.length > 0;
    };

    const safeAddIndex = async (tableName, attributes, options) => {
      if (!(await indexExists(tableName, options.name))) {
        try {
          await queryInterface.addIndex(tableName, attributes, options);
          console.log(`Index ${options.name} added successfully to ${tableName}`);
        } catch (error) {
          console.error(`Error adding index to ${tableName}:`, error.message);
        }
      } else {
        console.log(`Index ${options.name} already exists on ${tableName}`);
      }
    };

    await safeAddIndex('Tasks', ['companyId'], { name: 'idx_task_company_id' });
    await safeAddIndex('Tasks', ['companyId', 'createdAt'], { name: 'idx_task_company_created' });
    await safeAddIndex('Tasks', ['companyId', 'dueDate'], { name: 'idx_task_company_due' });
    await safeAddIndex('Tasks', ['done', 'companyId'], { name: 'idx_task_status_company' });
    await safeAddIndex('Tasks', ['dueDate'], { name: 'idx_task_due_date' });
    await safeAddIndex('Tasks', ['responsibleUserId'], { name: 'idx_task_responsible_user' });

    // Ticket table indexes
    await safeAddIndex('Tickets', ['status'], { name: 'idx_tickets_status' });
    await safeAddIndex('Tickets', ['whatsappId'], { name: 'idx_tickets_whatsapp_id' });
    await safeAddIndex('Tickets', ['companyId', 'status'], { name: 'idx_tickets_company_status' });
    await safeAddIndex('Tickets', ['contactId'], { name: 'idx_tickets_contact_id' });

    // Message table indexes
    await safeAddIndex('Messages', ['ticketId'], { name: 'idx_messages_ticket_id' });
    await safeAddIndex('Messages', ['companyId', 'createdAt'], { name: 'idx_messages_company_created_at' });
    await safeAddIndex('Messages', ['companyId', 'contactId'], { name: 'idx_messages_companyid_contactid' });  
    await safeAddIndex('Messages', ['ticketId', 'companyId'], { name: 'idx_messages_ticketid_companyid' });      
    await safeAddIndex('Messages', ['createdAt'], { name: 'idx_messages_timestamp' });

    // Contact table indexes
    await safeAddIndex('Contacts', ['number'], { name: 'idx_contacts_number' });
    await safeAddIndex('Contacts', ['companyId', 'createdAt'], { name: 'idx_contacts_company_created_at' });
    await safeAddIndex('Contacts', ['number', 'companyId'], { name: 'idx_contacts_number_company'});

    // User table indexes
    await safeAddIndex('Users', ['email'], { name: 'idx_users_email' });
    await safeAddIndex('Users', ['companyId', 'profile'], { name: 'idx_users_company_profile' });

    // Queue table indexes
    await safeAddIndex('Queues', ['companyId'], { name: 'idx_queues_company_id' });

    // Whatsapp table indexes
    await safeAddIndex('Whatsapps', ['companyId'], { name: 'idx_whatsapps_company_id' });
    await safeAddIndex('Whatsapps', ['status'], { name: 'idx_whatsapps_status' });

    // Tag table indexes
    await safeAddIndex('Tags', ['companyId', 'name'], { name: 'idx_tags_company_name' });

    // TicketTag table indexes
    await safeAddIndex('TicketTags', ['ticketId', 'tagId'], { name: 'idx_ticket_tags_ticket_tag' });

    // Campaign table indexes
    await safeAddIndex('Campaigns', ['companyId', 'status'], { name: 'idx_campaigns_company_status' });

    // CampaignShipping table indexes
    await safeAddIndex('CampaignShipping', ['campaignId'], { name: 'idx_campaign_shipping_campaign_id' });
    await safeAddIndex('CampaignShipping', ['status', 'campaignId'], { name: 'idx_campaign_shipping_status' });
    await safeAddIndex('CampaignShipping', ['contactId', 'campaignId'], { name: 'idx_campaign_shipping_contact' });
  },

  down: async (queryInterface, Sequelize) => {
    const safeRemoveIndex = async (tableName, indexName) => {
      try {
        await queryInterface.removeIndex(tableName, indexName);
        console.log(`Index ${indexName} removed successfully from ${tableName}`);
      } catch (error) {
        console.error(`Error removing index ${indexName} from ${tableName}:`, error.message);
      }
    };

    // Remove indexes
    await safeRemoveIndex('Tasks', 'idx_task_company_id');
    await safeRemoveIndex('Tasks', 'idx_task_due_date');
    await safeRemoveIndex('Tasks', 'idx_task_responsible_user');
    await safeRemoveIndex('Tickets', 'idx_tickets_status');
    await safeRemoveIndex('Tickets', 'idx_tickets_whatsapp_id');
    await safeRemoveIndex('Tickets', 'idx_tickets_company_status');
    await safeRemoveIndex('Tickets', 'idx_tickets_contact_id');
    await safeRemoveIndex('Messages', 'idx_messages_ticket_id');
    await safeRemoveIndex('Messages', 'idx_messages_company_created_at');
    await safeRemoveIndex('Messages', 'idx_messages_timestamp');
    await safeRemoveIndex('Messages', 'idx_messages_companyid_contactid');
    await safeRemoveIndex('Messages', 'idx_messages_ticketid_companyid'); 

    
    await safeRemoveIndex('Contacts', 'idx_contacts_number');
    await safeRemoveIndex('Contacts', 'idx_contacts_company_created_at');
    await safeRemoveIndex('Contacts', 'idx_contacts_number_company');
    await safeRemoveIndex('Users', 'idx_users_email');
    await safeRemoveIndex('Users', 'idx_users_company_profile');
    await safeRemoveIndex('Queues', 'idx_queues_company_id');
    await safeRemoveIndex('Whatsapps', 'idx_whatsapps_company_id');
    await safeRemoveIndex('Whatsapps', 'idx_whatsapps_status');
    await safeRemoveIndex('Tags', 'idx_tags_company_name');
    await safeRemoveIndex('TicketTags', 'idx_ticket_tags_ticket_tag');
    await safeRemoveIndex('Campaigns', 'idx_campaigns_company_status');
    await safeRemoveIndex('CampaignShipping', 'idx_campaign_shipping_campaign_id');
    await safeRemoveIndex('CampaignShipping', 'idx_campaign_shipping_status');
    await safeRemoveIndex('CampaignShipping', 'idx_campaign_shipping_contact');
  }
};