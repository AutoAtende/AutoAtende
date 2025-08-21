import QueueOption from "../../models/QueueOption";

interface QueueOptionData {
  queueId: string;
  title: string;
  option: string;
  message?: string;
  parentId?: string;
}

const CreateService = async (queueOptionData: QueueOptionData): Promise<QueueOption> => {
  const createData = {
    ...queueOptionData,
    queueId: parseInt(queueOptionData.queueId),
    parentId: queueOptionData.parentId ? parseInt(queueOptionData.parentId) : null
  };
  const queueOption = await QueueOption.create(createData);
  return queueOption;
};

export default CreateService;