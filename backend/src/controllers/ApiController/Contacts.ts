import { Request, Response, NextFunction } from 'express';
import * as Yup from 'yup';
import { getIO } from '../../libs/optimizedSocket';
import ContactCustomField from '../../models/ContactCustomField';
import ListContactsService from '../../services/ContactServices/ListContactsService';
import ShowContactService from '../../services/ContactServices/ShowContactService';
import UpdateContactService from '../../services/ContactServices/UpdateContactService';
import DeleteContactService from '../../services/ContactServices/DeleteContactService';
import DeleteAllContactService from '../../services/ContactServices/DeleteAllContactService';
import GetContactService from '../../services/ContactServices/GetContactService';
import ToggleDisableBotService from '../../services/ContactServices/ToggleDisableBotService';
import { ImportXLSContactsService } from '../../services/ContactServices/ImportXLSContactsService';
import CheckContactNumber from '../../helpers/CheckContactNumber';
import { head } from '../../utils/helpers';
import { returnWhatsAppIdAndCompanyIdByParams } from '../../utils/returnWhatsAppIdAndCompanyIdByParams';
import Contact from '../../models/Contact';
import { clearSpecialCharactersAndLetters } from '../../helpers/clearSpecialCharactersAndLetters';
import CreateOrUpdateContactService from '@services/ContactServices/CreateOrUpdateContactService';

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

type IndexGetContactQuery = {
  name: string;
  number: string;
};

interface ExtraInfo extends ContactCustomField {
  name: string;
  value: string;
}

interface ContactData {
  name?: string;
  number?: string;
  email?: string;
  contactNumber?: string
  contactName?: string
  contactEmail?: string
  extraInfo?: ExtraInfo[];
}

interface GetContactParams {
  name: string;
  number: string;
  companyId: number;
}

export const apiListAllContacts = async (req: Request, res: Response): Promise<Response> => {
  const params = await returnWhatsAppIdAndCompanyIdByParams(req)
  const companyId = req.body?.companyId || params?.companyId;
  try {
    const contacts = await Contact.findAll({
      where: {
        companyId
      }
    })
    return res.json({ contacts });
  } catch (error) {
    return res.status(500).json({ error });
  }
}

export const apiListAllContactsBySearchParamAndPageNumber = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber, companyId } = req.body
  try {
    const { contacts, count, hasMore } = await ListContactsService({
      searchParam,
      pageNumber,
      companyId
    });

    return res.json({ contacts, count, hasMore });
  } catch (err) {
    return res.status(500).json({ error: 'Error listing contacts' });
  }
}

export const listAllContacts = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const nPageNumber = Number(pageNumber);

  const params = await returnWhatsAppIdAndCompanyIdByParams(req)

  const companyId = params?.companyId || req.user?.companyId;

  try {
    const { contacts, count, hasMore } = await ListContactsService({
      searchParam,
      pageNumber: nPageNumber,
      companyId
    });

    return res.json({ contacts, count, hasMore });
  } catch (err) {
    return res.status(500).json({ error: 'Error listing contacts' });
  }
};

export const apiListContactById = async (req: Request, res: Response): Promise<Response> => {
  const contactId = req?.body?.contactId
  const companyId = req?.body?.companyId;

  try {
    const contact = await Contact.findOne({
      where: {
        companyId,
        id: contactId
      }
    })
    return res.status(200).json(contact);
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export const listOneContact = async (req: Request, res: Response): Promise<Response> => {
  const { name, number } = req.body as IndexGetContactQuery;
  const params = await returnWhatsAppIdAndCompanyIdByParams(req)

  const companyId = params?.companyId || req.user?.companyId;

  try {
    const contact = await GetContactService({
      name,
      number,
      companyId
    });

    return res.status(200).json(contact);
  } catch (err) {
    return res.status(500).json({ error: 'Error retrieving contact' });
  }
};

export const apiFindOrCreateContacts = async (req: Request, res: Response): Promise<Response> => {
  const { contactName, contactNumber } = req.body;
  const params = await returnWhatsAppIdAndCompanyIdByParams(req)

  const companyId = params?.companyId
  const _number = clearSpecialCharactersAndLetters(contactNumber)

  const validNumber = await CheckContactNumber(
    clearSpecialCharactersAndLetters(_number),
    companyId
  );


  try {
    const contact = await GetContactService({
      name: contactName,
      number: clearSpecialCharactersAndLetters(validNumber?.jid),
      companyId
    });

    return res.status(200).json(contact);
  } catch (error) {
    return res.status(500).json({ error });
  }
};



export const findOrCreateContacts = async (req: Request, res: Response): Promise<Response> => {
  const { name, number } = req.body as IndexGetContactQuery;
  const params = await returnWhatsAppIdAndCompanyIdByParams(req)

  const companyId = params?.companyId || req.user?.companyId;

  const _number = clearSpecialCharactersAndLetters(number);

  try {
    // Criamos um objeto que corresponde à interface esperada
    const contactParams: GetContactParams = {
      name: name || '',  // Garantimos que não será undefined
      number: _number,
      companyId
    };

    const contact = await GetContactService(contactParams);

    return res.status(200).json(contact);
  } catch (err) {
    return res.status(500).json({ error: 'Error finding or creating contact' });
  }
};

export const saveContact = async (req: Request, res: Response): Promise<Response> => {
  const params = await returnWhatsAppIdAndCompanyIdByParams(req)
  const companyId = params?.companyId || req.user?.companyId;
  
  const newContact: ContactData = req.body;
  newContact.number = newContact.number.replace("-", "").replace(" ", "");

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    number: Yup.string()
      .required()
      .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
  });

  try {
    await schema.validate(newContact);
    const validNumber = await CheckContactNumber(newContact.number, companyId);
    const number = validNumber.jid.replace(/\D/g, "");

    const contactRequest = {
      name: newContact.name,
      number: number,
      email: newContact.email,
      companyId,
      extraInfo: newContact.extraInfo || [],
      disableBot: false,
      employerId: null,
      positionId: null,
      isGroup: false,
      remoteJid: validNumber.jid
    };

    const contact = await CreateOrUpdateContactService(contactRequest);

    const io = getIO();
    io.emit(`company-${companyId}-contact`, {
      action: "create",
      contact
    });

    return res.status(200).json(contact);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const apiUpdateContact = async (req: Request, res: Response): Promise<Response> => {
  const contactData: ContactData = req.body;
  const params = await returnWhatsAppIdAndCompanyIdByParams(req)

  const companyId = req.body?.companyId || req.user?.companyId || params?.companyId
  
  const contactId = req.body?.contactId || req.params?.contactId;

  const schema = Yup.object().shape({
    contactName: Yup.string().required(),
    contactId: Yup.string().required(),
    companyId: Yup.string().required(),
  });

  try {
    await schema.validate(contactData);

    console.log({
      contactData,
      contactId,
      companyId
    })

    const contactToUpdate = await Contact.findByPk(contactId)

    await contactToUpdate.update({
      name: contactData.contactName,
      email: contactData.contactEmail,
    });

    const io = getIO();
    io.emit(`company-${companyId}-contact`, {
      action: "update",
      contact: contactToUpdate
    });

    return res.status(200).json(contactToUpdate);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

export const updateContact = async (req: Request, res: Response): Promise<Response> => {
  const contactData: ContactData = req.body;
  const params = await returnWhatsAppIdAndCompanyIdByParams(req)

  const companyId = params?.companyId || req.user?.companyId;
  
  const { contactId } = req.params;

  const schema = Yup.object().shape({
    name: Yup.string(),
    number: Yup.string().matches(
      /^\d+$/,
      "Invalid number format. Only numbers is allowed."
    )
  });

  try {
    await schema.validate(contactData);
    const validNumber = await CheckContactNumber(contactData.number, companyId);
    const number = validNumber.jid.replace(/\D/g, "");
    contactData.number = number;

    const contact = await UpdateContactService({
      contactData,
      contactId,
      companyId
    });

    const io = getIO();
    io.emit(`company-${companyId}-contact`, {
      action: "update",
      contact
    });

    return res.status(200).json(contact);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const removeContact = async (req: Request, res: Response): Promise<Response> => {
  const contactId = req.params?.contactId || req.body?.contactId;
  
  const params = await returnWhatsAppIdAndCompanyIdByParams(req)

  const companyId = params?.companyId || req.user?.companyId;

  try {
    await ShowContactService(contactId, companyId);
    await DeleteContactService(contactId, companyId);

    const io = getIO();
    io.emit(`company-${companyId}-contact`, {
      action: "delete",
      contactId
    });

    return res.status(200).json({ message: "Contact deleted" });
  } catch (err) {
    return res.status(500).json({ error: 'Error deleting contact' });
  }
};

export const removeAllContacts = async (req: Request, res: Response): Promise<Response> => {
  const params = await returnWhatsAppIdAndCompanyIdByParams(req)

  const companyId = req.body?.companyId || params?.companyId || req.user?.companyId;

  try {
    await DeleteAllContactService(companyId);
    return res.send();
  } catch (err) {
    return res.status(500).json({ error: 'Error deleting all contacts' });
  }
};

export const uploadContacts = async (req: Request, res: Response): Promise<Response> => {
  const files = req.files as Express.Multer.File[];
  const firstFile = head(files); 
  const params = await returnWhatsAppIdAndCompanyIdByParams(req)

  const companyId = params?.companyId || req.user?.companyId;

  try {
    const importedContacts = await ImportXLSContactsService(companyId, firstFile);

    const socket = getIO();
    const message = {
      action: "reload",
      records: importedContacts
    };

    socket
      .to(`company-${companyId}-mainchannel`)
      .emit(`company-${companyId}-contact`, message);

    return res.status(200).json(importedContacts);
  } catch (err) {
    return res.status(500).json({ error: 'Error uploading contacts' });
  }
};

export const toggleDisableBotContacts = async (req: Request, res: Response): Promise<Response> => {
  const contactId = req.params?.contactId || req.body?.contactId;
  
  const params = await returnWhatsAppIdAndCompanyIdByParams(req)

  const companyId = params?.companyId || req.user?.companyId;

  const updatedContact = await ToggleDisableBotService(contactId, companyId);

  const io = getIO();
  io.emit(`company-${companyId}-contact`, {
    action: "update",
    contact: updatedContact
  });

  return res.status(200).json(updatedContact);
};