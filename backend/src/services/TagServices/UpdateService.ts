import Tag from "../../models/Tag";
import ShowService from "./ShowService";

interface TagData {
  id?: number;
  name?: string;
  color?: string;
  kanban?: number;
}

interface Request {
  tagData: TagData;
  id: string | number;
}

const UpdateUserService = async ({
  tagData,
  id
}: Request): Promise<Tag | undefined> => {
  const tag = await ShowService(id);

  const { name, color, kanban } = tagData;

  await tag.update({
    name,
    color,
    kanban,
  });

  await tag.reload();
  return tag;
};

export default UpdateUserService;
