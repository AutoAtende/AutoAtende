import * as Yup from "yup";
import AppError from "../../errors/AppError";
import TicketNote from "../../models/TicketNote";

export interface TicketNoteData {
  note: string;
  userId: number | string;
  contactId: number | string;
  ticketId: number | string;
}

const CreateTicketNoteService = async (
  ticketNoteData: TicketNoteData
): Promise<TicketNote> => {
  const { note } = ticketNoteData;

  const ticketnoteSchema = Yup.object().shape({
    note: Yup.string()
      .min(3, "ERR_TICKETNOTE_INVALID_NAME")
      .required("ERR_TICKETNOTE_INVALID_NAME")
  });

  try {
    await ticketnoteSchema.validate({ note });
  } catch (err) {
    throw new AppError(err.message);
  }

  const createData = {
    ...ticketNoteData,
    userId: parseInt(ticketNoteData.userId.toString()),
    contactId: parseInt(ticketNoteData.contactId.toString()),
    ticketId: parseInt(ticketNoteData.ticketId.toString())
  };
  const ticketNote = await TicketNote.create(createData);

  return ticketNote;
};

export default CreateTicketNoteService;
