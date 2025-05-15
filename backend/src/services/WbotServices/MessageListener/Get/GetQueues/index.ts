import Queue from "../../../../../models/Queue";

export async function getQueues(companyId: number): Promise<Queue[]> {
    try {
      const queues = await Queue.findAll({
        where: { companyId: companyId }
      });
      return queues;
    } catch (error) {
      console.error("Failed to fetch queues:", error);
      return [];
    }
  }