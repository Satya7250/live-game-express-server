import Conversation from "../modules/chat/conversation.model.js";
import * as chatService from "../modules/chat/chat.service.js";
import { emitToUsers } from "../common/utils/socket.utils.js";

//register chat handlers
const registerChatHandlers = (io, socket) => {
    const userId = socket.user?.id;

    if (!userId) return;

    //join conversation room
    socket.on("chat:join-conversation", async (data) => {
        try {
            const { conversationId } = data;

            const conversation = await Conversation.findById(conversationId)
                .select("participants")
                .lean();

            if (!conversation) {
                return;
            }

            const isParticipant = conversation.participants.some(
                participant =>
                    participant.toString() === userId.toString()
            );

            if (!isParticipant) {
                return;
            }

            socket.join(`conversation:${conversationId}`);
        } catch (error) {
            socket.emit("chat:error", {
                message: error.message,
            });
        }
    });

    //send message
    socket.on("chat:send-message", async (data) => {
        try {
            const { conversationId, content } = data;

            const { message, conversation } =
                await chatService.sendMessage(
                    userId,
                    conversationId,
                    content
                );

            const participantIds =
                conversation.participants.map(
                    participant => participant.toString()
                );

            emitToUsers(
                io,
                participantIds,
                "chat:new-message",
                {
                    message,
                }
            );
        } catch (error) {
            socket.emit("chat:error", {
                message: error.message,
            });
        }
    });

    //typing
    socket.on("chat:typing", async (data) => {
        try {
            const { conversationId } = data;

            const conversation = await Conversation.findById(
                conversationId
            )
                .select("participants")
                .lean();

            if (!conversation) {
                return;
            }

            const isParticipant = conversation.participants.some(
                participant =>
                    participant.toString() === userId.toString()
            );

            if (!isParticipant) {
                return;
            }

            socket
                .to(`conversation:${conversationId}`)
                .emit("chat:typing", {
                    conversationId,
                    userId,
                });
        } catch (error) {
            socket.emit("chat:error", {
                message: error.message,
            });
        }
    });

    //stop typing
    socket.on("chat:stop-typing", async (data) => {
        try {
            const { conversationId } = data;

            const conversation = await Conversation.findById(
                conversationId
            )
                .select("participants")
                .lean();

            if (!conversation) {
                return;
            }

            const isParticipant = conversation.participants.some(
                participant =>
                    participant.toString() === userId.toString()
            );

            if (!isParticipant) {
                return;
            }

            socket
                .to(`conversation:${conversationId}`)
                .emit("chat:stop-typing", {
                    conversationId,
                    userId,
                });
        } catch (error) {
            socket.emit("chat:error", {
                message: error.message,
            });
        }
    });
};

export default registerChatHandlers;