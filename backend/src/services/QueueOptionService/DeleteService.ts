import ShowService from "./ShowService";

const DeleteService = async (queueOptionId: number | string): Promise<void> => {
  const queueOption = await ShowService(queueOptionId);

  await queueOption.destroy({ force: true });
};

export default DeleteService;