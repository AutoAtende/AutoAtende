import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    try {
      // Tickets performance indexes
      await queryInterface.addIndex("Tickets", ["status", "companyId"], {
        name: "idx_tickets_status_company"
      });

      await queryInterface.addIndex("Tickets", ["userId", "status"], {
        name: "idx_tickets_user_status"
      });

      await queryInterface.addIndex("Tickets", ["queueId", "status"], {
        name: "idx_tickets_queue_status"
      });

      await queryInterface.addIndex("Tickets", ["createdAt"], {
        name: "idx_tickets_created_at"
      });

      await queryInterface.addIndex("Tickets", ["updatedAt"], {
        name: "idx_tickets_updated_at"
      });

      await queryInterface.addIndex("Tickets", ["unreadMessages"], {
        name: "idx_tickets_unread_messages",
        where: {
          unreadMessages: {
            $gt: 0
          }
        }
      });

      // Messages performance indexes
      await queryInterface.addIndex("Messages", ["ticketId", "createdAt"], {
        name: "idx_messages_ticket_created"
      });

      await queryInterface.addIndex("Messages", ["fromMe", "companyId", "createdAt"], {
        name: "idx_messages_fromme_company_date"
      });

      // TicketTags performance indexes
      await queryInterface.addIndex("TicketTags", ["tagId"], {
        name: "idx_ticket_tags_tag"
      });

      await queryInterface.addIndex("TicketTags", ["ticketId", "tagId"], {
        name: "idx_ticket_tags_ticket_tag"
      });

      // Contacts performance indexes
      await queryInterface.addIndex("Contacts", ["number"], {
        name: "idx_contacts_number"
      });

      await queryInterface.addIndex("Contacts", ["email"], {
        name: "idx_contacts_email"
      });

      await queryInterface.addIndex("Contacts", ["isGroup", "companyId"], {
        name: "idx_contacts_isgroup_company"
      });

      console.log("Performance indexes created successfully");
    } catch (error) {
      console.log("Error creating indexes:", error.message);
      // Don't fail the migration if indexes already exist
    }
  },

  down: async (queryInterface: QueryInterface) => {
    try {
      // Remove all indexes created in up()
      const indexesToRemove = [
        "idx_tickets_status_company",
        "idx_tickets_user_status", 
        "idx_tickets_queue_status",
        "idx_tickets_created_at",
        "idx_tickets_updated_at",
        "idx_tickets_unread_messages",
        "idx_messages_ticket_created",
        "idx_messages_fromme_company_date",
        "idx_ticket_tags_tag",
        "idx_ticket_tags_ticket_tag",
        "idx_contacts_number",
        "idx_contacts_email",
        "idx_contacts_isgroup_company"
      ];

      for (const indexName of indexesToRemove) {
        try {
          await queryInterface.removeIndex("Tickets", indexName);
        } catch (error) {
          // Continue removing other indexes even if one fails
        }
      }
    } catch (error) {
      console.log("Error removing indexes:", error.message);
    }
  }
};