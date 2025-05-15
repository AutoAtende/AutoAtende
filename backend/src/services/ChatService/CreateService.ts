import Chat from "../../models/Chat";
import ChatUser from "../../models/ChatUser";
import User from "../../models/User";

interface Data {
  ownerId: number;
  companyId: number;
  users: any[];
  title: string;
}

// CreateService.ts - Correção
const CreateService = async (data: Data): Promise<Chat> => {
  const { ownerId, companyId, users, title } = data;

  // Validações
  if (!title) {
    throw new Error("Título é obrigatório");
  }

  if (!users || !Array.isArray(users) || users.length === 0) {
    throw new Error("Selecione pelo menos um usuário");
  }

  // Verifica se o owner está incluído na lista de usuários
  const hasOwner = users.some(user => user.id === ownerId);
  if (!hasOwner) {
    // Se o owner não estiver na lista, adiciona-o
    const owner = await User.findByPk(ownerId);
    if (owner) {
      users.push({
        id: owner.id,
        name: owner.name
      });
    }
  }

  const record = await Chat.create({
    ownerId,
    companyId,
    title
  });

  // Criar ChatUser para todos os usuários
  for (let user of users) {
    await ChatUser.create({ 
      chatId: record.id, 
      userId: user.id,
      unreads: 0
    });
  }

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
};

export default CreateService;
