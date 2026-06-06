import { getUserSockets } from "../../sockets/onlineUser.js";

//emit to a single user
const emitToUser = (io, userId, event, data) => {
    const socketIds = getUserSockets(userId) || [];

    socketIds.forEach(socketId => {
        io.to(socketId).emit(event, data);
    });
};

//emit to multiple users
const emitToUsers = (io, userIds, event, data) => {
    const uniqueUserIds = [...new Set(userIds)];

    uniqueUserIds.forEach(userId => {
        emitToUser(io, userId, event, data);
    });
};

//check if user is online
const isUserOnline = (userId) => {
    const socketIds = getUserSockets(userId) || [];
    return socketIds.length > 0;
};

export {
    emitToUser,
    emitToUsers,
    isUserOnline,
};