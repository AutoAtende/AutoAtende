import { Request, Response } from "express";
import { Op } from "sequelize";
import Contact from "../../models/Contact";
import { logger } from "../../utils/logger";

// Get contacts with mobile optimization
export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user!;
    const { 
      pageNumber = 1, 
      limit = 50, 
      searchParam = "",
      isGroup = false 
    } = req.query;

    let whereCondition: any = {
      companyId,
      isGroup: isGroup === 'true'
    };

    if (searchParam) {
      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchParam}%` } },
          { number: { [Op.iLike]: `%${searchParam}%` } },
          { email: { [Op.iLike]: `%${searchParam}%` } }
        ]
      };
    }

    const offset = (Number(pageNumber) - 1) * Number(limit);

    const { count, rows: contacts } = await Contact.findAndCountAll({
      where: whereCondition,
      attributes: [
        "id", "name", "number", "email", "profilePicUrl", 
        "isGroup", "createdAt", "updatedAt"
      ],
      limit: Number(limit),
      offset,
      order: [["name", "ASC"]]
    });

    const hasMore = offset + contacts.length < count;

    return res.json({
      success: true,
      data: {
        contacts,
        count,
        hasMore,
        currentPage: Number(pageNumber),
        totalPages: Math.ceil(count / Number(limit))
      }
    });

  } catch (error) {
    logger.error("Get contacts error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get single contact
export const show = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { contactId } = req.params;
    const { companyId } = req.user!;

    const contact = await Contact.findOne({
      where: {
        id: Number(contactId),
        companyId
      },
      attributes: [
        "id", "name", "number", "email", "profilePicUrl",
        "isGroup", "createdAt", "updatedAt"
      ]
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Contact not found"
      });
    }

    return res.json({
      success: true,
      data: { contact }
    });

  } catch (error) {
    logger.error("Get contact error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Create new contact
export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user!;
    const { name, number, email } = req.body;

    if (!name || !number) {
      return res.status(400).json({
        success: false,
        error: "Name and number are required"
      });
    }

    // Check if contact with same number already exists
    const existingContact = await Contact.findOne({
      where: {
        number,
        companyId
      }
    });

    if (existingContact) {
      return res.status(409).json({
        success: false,
        error: "Contact with this number already exists"
      });
    }

    const contact = await Contact.create({
      name: name.trim(),
      number: number.trim(),
      email: email ? email.trim() : null,
      companyId,
      isGroup: false
    });

    return res.status(201).json({
      success: true,
      data: { contact },
      message: "Contact created successfully"
    });

  } catch (error) {
    logger.error("Create contact error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Update contact
export const update = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { contactId } = req.params;
    const { companyId } = req.user!;
    const { name, email } = req.body;

    const contact = await Contact.findOne({
      where: {
        id: Number(contactId),
        companyId
      }
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Contact not found"
      });
    }

    await contact.update({
      name: name ? name.trim() : contact.name,
      email: email ? email.trim() : contact.email
    });

    return res.json({
      success: true,
      data: { contact },
      message: "Contact updated successfully"
    });

  } catch (error) {
    logger.error("Update contact error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Delete contact
export const remove = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { contactId } = req.params;
    const { companyId } = req.user!;

    const contact = await Contact.findOne({
      where: {
        id: Number(contactId),
        companyId
      }
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Contact not found"
      });
    }

    await contact.destroy();

    return res.json({
      success: true,
      message: "Contact deleted successfully"
    });

  } catch (error) {
    logger.error("Delete contact error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Search contacts
export const search = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user!;
    const { q: searchParam, limit = 20 } = req.query;

    if (!searchParam) {
      return res.status(400).json({
        success: false,
        error: "Search parameter is required"
      });
    }

    const contacts = await Contact.findAll({
      where: {
        companyId,
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchParam}%` } },
          { number: { [Op.iLike]: `%${searchParam}%` } }
        ]
      },
      attributes: ["id", "name", "number", "profilePicUrl"],
      limit: Number(limit),
      order: [["name", "ASC"]]
    });

    return res.json({
      success: true,
      data: { contacts }
    });

  } catch (error) {
    logger.error("Search contacts error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get tickets for a contact
export const getTickets = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { contactId } = req.params;
    const { companyId } = req.user!;
    const { limit = 20, offset = 0 } = req.query;

    // Verify contact exists and belongs to company
    const contact = await Contact.findOne({
      where: {
        id: Number(contactId),
        companyId
      }
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Contact not found"
      });
    }

    const Ticket = (await import("../../models/Ticket")).default;
    const Queue = (await import("../../models/Queue")).default;
    const User = (await import("../../models/User")).default;

    const tickets = await Ticket.findAll({
      where: {
        contactId: Number(contactId),
        companyId
      },
      include: [
        {
          model: Queue,
          as: "queue",
          attributes: ["id", "name", "color"]
        },
        {
          model: User,
          as: "user", 
          attributes: ["id", "name"]
        }
      ],
      attributes: [
        "id", "uuid", "status", "lastMessage", "lastMessageAt",
        "unreadMessages", "createdAt", "updatedAt"
      ],
      order: [["updatedAt", "DESC"]],
      limit: Number(limit),
      offset: Number(offset)
    });

    return res.json({
      success: true,
      data: {
        tickets,
        contact: {
          id: contact.id,
          name: contact.name,
          number: contact.number
        }
      }
    });

  } catch (error) {
    logger.error("Get contact tickets error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};