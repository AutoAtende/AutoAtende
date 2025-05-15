// services/WhatsappService/ListAllWhatsAppsService.ts

import Whatsapp from "../../models/Whatsapp";
import Queue from "../../models/Queue";
import QueueOption from "../../models/QueueOption";
import Prompt from "../../models/Prompt";

const ListAllWhatsAppsService = async () => {
  const whatsapps = await Whatsapp.findAll({
    include: [
      {
        model: Queue,
        as: 'queues',  // Adicione a propriedade 'as'
        include: [{
          model: QueueOption,
          as: 'queueOptions'  // Adicione a propriedade 'as'
        }],
      },
      {
        model: Prompt,
        as: 'prompts',  // Adicione a propriedade 'as'
      },
    ],
    order: [['queues', 'orderQueue', 'ASC']],  // Use o alias correto
  });

  return whatsapps;
};

export default ListAllWhatsAppsService;
