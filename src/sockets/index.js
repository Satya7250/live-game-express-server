import { addUser, removeUser } from "./onlineUser.js";

const registerSocketHandlers = (io, socket) => {
    console.log(`Registering handlers for socket: ${socket.id} (User: ${socket.user?._id || "Unknown"})`);

    if (socket.user?._id) {
        addUser(socket.user._id, socket.id);
    }

    socket.on("disconnect", (reason) => {
        console.log(`Socket disconnected: ${socket.id}, Reason: ${reason}`);
        if (socket.user?._id) {
            removeUser(socket.user._id, socket.id);
        }
    });

    socket.on("error", (error) => {
        console.error(`Socket error (${socket.id}):`, error);
    });
};

export default registerSocketHandlers;
