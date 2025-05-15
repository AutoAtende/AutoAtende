import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Files from "../../models/Files";
import FilesOptions from "../../models/FilesOptions";

interface FileData {
  name: string;
  message?: string;
  companyId: number;
  options?: Array<{
    mediaType: string;
    path?: string;
  }>;
}

const CreateService = async (data: FileData): Promise<Files> => {
  const { name, message, options, companyId } = data;

  const schema = Yup.object().shape({
    name: Yup.string().required("Nome da lista de arquivos é obrigatório")
  });

  try {
    await schema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const fileList = await Files.create({
    name,
    message: message || "",
    companyId
  });

  if (options && options.length > 0) {
    const fileOptions = options.map(option => ({
      ...option,
      fileId: fileList.id
    }));

    await FilesOptions.bulkCreate(fileOptions);
  }

  // Recarregar a lista de arquivos com suas opções
  const completeFileList = await Files.findByPk(fileList.id, {
    include: [{ model: FilesOptions }]
  });

  return completeFileList;
};

export default CreateService;