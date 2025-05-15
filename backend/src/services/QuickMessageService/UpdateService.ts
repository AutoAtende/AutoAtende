import AppError from "../../errors/AppError";
import QuickMessage from "../../models/QuickMessage";

interface Data {
  shortcode: string;
  message: string;
  userId: number;
  mediaPath: string;
  mediaType: string;
  mediaName: string;
  id?: number;
  geral?: boolean;
}

const UpdateService = async (data: Data): Promise<QuickMessage> => {
  const { id, shortcode, message, userId, mediaPath, mediaType, mediaName, geral } = data;

  const record = await QuickMessage.findByPk(id);

  if (!record) {
    throw new AppError("ERR_NO_TICKETNOTE_FOUND", 404);
  }

  await record.update({
    shortcode,
    message,
    userId,
    mediaPath,
    mediaType,
    mediaName,
    geral
  });

  return record;
};

export default UpdateService;
