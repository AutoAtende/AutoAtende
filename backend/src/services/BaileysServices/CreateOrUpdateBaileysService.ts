import { Chat, Contact } from "bail-lite";
import Baileys from "../../models/Baileys";

interface Request {
  whatsappId: number;
  contacts?: Contact[];
  chats?: Chat[];
}

const createOrUpdateBaileysService = async ({
  whatsappId,
  contacts,
  chats
}: Request): Promise<Baileys> => {
  const baileysExists = await Baileys.findOne({
    where: { whatsappId }
  });

  if (baileysExists) {
    // Corrigir a forma como os dados são extraídos do banco
    let getChats = [];
    let getContacts = [];
    
    try {
      // Tratar corretamente a string JSON para obter um array
      if (baileysExists.chats) {
        getChats = JSON.parse(baileysExists.chats);
      }
      
      if (baileysExists.contacts) {
        getContacts = JSON.parse(baileysExists.contacts);
      }
    } catch (error) {
      console.error('Erro ao analisar dados JSON:', error);
      // Em caso de erro na análise, manter os arrays vazios
    }

    if (chats && Array.isArray(getChats)) {
      getChats.push(...chats);
      // Remover duplicatas usando Set (mais eficiente que filter)
      getChats = Array.from(new Set(getChats));
    } else if (chats) {
      // Se getChats não for um array, usar apenas os novos chats
      getChats = [...chats];
    }

    if (contacts && Array.isArray(getContacts)) {
      getContacts.push(...contacts);
      // Remover duplicatas usando Set (mais eficiente que filter)
      getContacts = Array.from(new Set(getContacts));
    } else if (contacts) {
      // Se getContacts não for um array, usar apenas os novos contatos
      getContacts = [...contacts];
    }

    const newBaileys = await baileysExists.update({
      chats: JSON.stringify(getChats),
      contacts: JSON.stringify(getContacts)
    });

    return newBaileys;
  }

  // Criar novo registro se não existir
  const bail-lite = await Baileys.create({
    whatsappId,
    contacts: JSON.stringify(contacts || []),
    chats: JSON.stringify(chats || [])
  });

  return bail-lite;
};

export default createOrUpdateBaileysService;