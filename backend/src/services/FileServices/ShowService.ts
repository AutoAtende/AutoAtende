import Files from "../../models/Files";
import FilesOptions from "../../models/FilesOptions";
import AppError from "../../errors/AppError";

const ShowService = async (id: string | number, companyId: number): Promise<Files> => {
  const file = await Files.findOne({
    where: {
      id,
      companyId
    },
    include: [
      {
        model: FilesOptions,
        attributes: ["id", "path", "mediaType"]
      }
    ]
  });

  if (!file) {
    throw new AppError("Lista de arquivos não encontrada", 404);
  }

  return file;
};

export default ShowService;