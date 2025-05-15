import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";

const AssociateWhatsappQueue = async (
  whatsapp: Whatsapp,
  queueIds: number[]
): Promise<void> => {
  // Logs para diagnóstico
  console.log(`[AssociateWhatsappQueue] Iniciando associação de filas para WhatsApp #${whatsapp.id}`);
  console.log(`[AssociateWhatsappQueue] queueIds recebidos:`, JSON.stringify(queueIds));
  console.log(`[AssociateWhatsappQueue] Tipo de queueIds: ${typeof queueIds}, é Array: ${Array.isArray(queueIds)}, comprimento: ${Array.isArray(queueIds) ? queueIds.length : 'N/A'}`);

  try {
    // Remover todos os relacionamentos existentes
    console.log(`[AssociateWhatsappQueue] Removendo todas as filas existentes...`);
    await whatsapp.$set("queues", []);
    
    // Log após remoção
    console.log(`[AssociateWhatsappQueue] Todas as filas foram removidas. Recarregando...`);
    
    // Se houver novos IDs para adicionar, faz a adição
    if (queueIds && queueIds.length > 0) {
      console.log(`[AssociateWhatsappQueue] Adicionando ${queueIds.length} novas filas:`, JSON.stringify(queueIds));
      await whatsapp.$add("queues", queueIds);
      console.log(`[AssociateWhatsappQueue] Filas adicionadas com sucesso`);
    } else {
      console.log(`[AssociateWhatsappQueue] Nenhuma nova fila para adicionar`);
    }
  } catch (error) {
    console.error(`[AssociateWhatsappQueue] ERRO ao processar filas:`, error);
    throw error;
  }
  
  // Recarregar para garantir dados atualizados
  await whatsapp.reload({
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name"]
      }
    ]
  });
  
  // Log final
  console.log(`[AssociateWhatsappQueue] Associação de filas concluída. Estado final:`, 
    whatsapp.queues ? JSON.stringify(whatsapp.queues.map(q => ({ id: q.id, name: q.name }))) : "[]");
};

export default AssociateWhatsappQueue;