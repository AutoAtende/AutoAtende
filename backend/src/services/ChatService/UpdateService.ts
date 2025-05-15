import Chat from "../../models/Chat";
import ChatUser from "../../models/ChatUser";
import User from "../../models/User";

interface ChatData {
  id: number;
  title?: string;
  users?: any[];
}

export default async function UpdateService(data: ChatData) {
  const { users } = data;
  const record = await Chat.findByPk(data.id, {
    include: [{ 
      model: ChatUser, 
      as: "users",
      include: [{ model: User, as: "user" }]
    }]
  });
  
  if (!record) {
    throw new Error("Chat não encontrado");
  }

  const { ownerId } = record;

  // Atualiza título se fornecido
  if (data.title) {
    await record.update({ title: data.title });
  }

  // Gerencia usuários apenas se array de users for fornecido
  if (Array.isArray(users)) {
    // Obtém IDs atuais
    const currentUserIds = record.users.map(u => u.userId);
    // Obtém novos IDs
    const newUserIds = users.map(u => u.id);

    // Remove usuários que não estão mais na lista
    const usersToRemove = currentUserIds.filter(id => !newUserIds.includes(id));
    if (usersToRemove.length > 0) {
      await ChatUser.destroy({
        where: {
          chatId: record.id,
          userId: usersToRemove
        }
      });
    }

    // Adiciona novos usuários
    const usersToAdd = newUserIds.filter(id => !currentUserIds.includes(id));
    for (const userId of usersToAdd) {
      await ChatUser.create({
        chatId: record.id,
        userId,
        unreads: 0
      });
    }
  }

  // Recarrega o registro com relacionamentos
  await record.reload({
    include: [
      { 
        model: ChatUser, 
        as: "users", 
        include: [{ model: User, as: "user" }] 
      },
      { model: User, as: "owner" }
    ]
  });

  return record;
}