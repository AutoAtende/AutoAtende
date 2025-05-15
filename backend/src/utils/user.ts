import User from "../models/User";
import UserQueue from "../models/UserQueue";

export const firstQueueThisUser = async (user: User): Promise<UserQueue> => {
  const queuesThisUser = await UserQueue.findAll({
    where: {
      userId: user.id
    }
  });

  return queuesThisUser[0];
};
