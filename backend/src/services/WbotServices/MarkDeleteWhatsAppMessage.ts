import Message from "../../models/Message";
import { getIO } from "../../libs/socket";

const MarkDeleteWhatsAppMessage = async (from: any, timestamp?: any, msgId?: string, companyId?: number): Promise<Message> => {

    from = from.replace('@c.us', '').replace('@s.whatsapp.net', '')

    if (msgId) {

        const messages = await Message.findOne({
            where: {
                id: msgId,
                companyId
            }
        });

        if (messages == null || !messages) {
            return;
        }

        try {
            const messageToUpdate = await Message.findByPk(messages.id, {
                include: [
                    "contact",
                    {
                        model: Message,
                        as: "quotedMsg",
                        include: ["contact"]
                    }
                ]
            });

            if (messageToUpdate) {
                await messageToUpdate.update({ isDeleted: true });

                const io = getIO();
                io.emit(`appMessage-${messageToUpdate}`, {
                    action: "update",
                    message: messageToUpdate
                });

            }

        } catch (err) {
            console.log("Erro ao tentar marcar a mensagem com excluída > " + err)
        }

        return timestamp;
    };

}

export default MarkDeleteWhatsAppMessage;
