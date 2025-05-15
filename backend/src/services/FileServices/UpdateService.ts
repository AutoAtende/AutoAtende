import AppError from "../../errors/AppError";
import Files from "../../models/Files";
import FilesOptions from "../../models/FilesOptions";

interface UpdateData {
  id: string | number;
  fileData: {
    name?: string;
    message?: string;
    options?: Array<{
      id?: number;
      path?: string;
      mediaType?: string;
    }>;
  };
  companyId: number;
}

const UpdateService = async ({
  id,
  fileData,
  companyId
}: UpdateData): Promise<Files> => {
  const file = await Files.findOne({
    where: {
      id,
      companyId
    },
    include: [{ model: FilesOptions }]
  });

  if (!file) {
    throw new AppError("Lista de arquivos não encontrada", 404);
  }

  // Atualizar dados básicos da lista
  if (fileData.name || fileData.message !== undefined) {
    await file.update({
      name: fileData.name || file.name,
      message: fileData.message !== undefined ? fileData.message : file.message
    });
  }

  // Atualizar opções de arquivos
  if (fileData.options && fileData.options.length > 0) {
    for (const option of fileData.options) {
      if (option.id) {
        // Atualizar opção existente
        const fileOption = file.options.find(opt => opt.id === option.id);
        if (fileOption) {
          await fileOption.update({
            path: option.path || fileOption.path,
            mediaType: option.mediaType || fileOption.mediaType
          });
        }
      } else {
        // Criar nova opção
        await FilesOptions.create({
          fileId: file.id,
          path: option.path || "",
          mediaType: option.mediaType || "document"
        });
      }
    }
  }

  // Recarregar a lista atualizada
  await file.reload({
    include: [{ model: FilesOptions }]
  });

  return file;
};

export default UpdateService;