import QueueOption from "../../models/QueueOption";
import ShowService from "./ShowService";

interface QueueData {
  queueId?: string;
  title?: string;
  option?: string;
  message?: string;
  parentId?: string;
}

const UpdateService = async (
  queueOptionId: number | string,
  queueOptionData: QueueData
): Promise<QueueOption> => {

  const queueOption = await ShowService(queueOptionId);

  const updateData = {
    ...queueOptionData,
    queueId: queueOptionData.queueId ? parseInt(queueOptionData.queueId) : undefined,
    parentId: queueOptionData.parentId ? parseInt(queueOptionData.parentId) : undefined
  };

  await queueOption.update(updateData);

  return queueOption;
};

export default UpdateService;