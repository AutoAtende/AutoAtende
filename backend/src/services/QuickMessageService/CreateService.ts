import * as Yup from "yup";
import AppError from "../../errors/AppError";
import QuickMessage from "../../models/QuickMessage";

interface Data {
  shortcode: string;
  message: string;
  companyId: number | string;
  userId: number | string;
  mediaPath: string;
  mediaType: string;
  mediaName: string;
  geral: boolean;
}

const CreateService = async (data: Data): Promise<QuickMessage> => {
  const { shortcode, message, geral, mediaPath, mediaType, mediaName } = data;

  const ticketnoteSchema = Yup.object().shape({
    shortcode: Yup.string()
      .min(3, "ERR_SHORTCUT_MIN_3_CHARACTERS")
      .required("ERR_QUICKMESSAGE_REQUIRED")
  });

  try {
    await ticketnoteSchema.validate({ shortcode, message, mediaPath });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const record = await QuickMessage.create(data);

  return record;
};

export default CreateService;
