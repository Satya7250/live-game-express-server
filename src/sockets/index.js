import { addUser, removeUser } from "./onlineUser.js";
import registerChatHandlers from "./chat.handler.js";
import registerRoomHandlers from "./room.handler.js";

const registerSocketHandlers = (io, socket) => {
    console.log(
        `Registering handlers for socket: ${socket.id} (User: ${
            socket.user?.id || "Unknown"
        })`
    );

    if (socket.user?.id) {
        addUser(socket.user.id, socket.id);

        socket.join(`user:${socket.user.id}`);
    }

    //chat
    registerChatHandlers(io, socket);
    //rooms
    registerRoomHandlers(io, socket);

    socket.on("disconnect", (reason) => {
        console.log(
            `Socket disconnected: ${socket.id}, Reason: ${reason}`
        );

        if (socket.user?.id) {
            removeUser(socket.user.id, socket.id);
        }
    });

    socket.on("error", (error) => {
        console.error(
            `Socket error (${socket.id}):`,
            error
        );
    });
};

export default registerSocketHandlers;