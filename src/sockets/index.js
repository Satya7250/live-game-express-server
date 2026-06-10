import { addUser, removeUser } from "./onlineUser.js";

import registerChatHandlers from "./chat.handler.js";
import registerRoomHandlers from "./room.handler.js";
import registerTicTacToeHandlers from "./ticTacToe.handler.js";
import * as roomService from "../modules/rooms/room.service.js";
import Room from "../modules/rooms/room.model.js";
import { activeGames } from "./activeGames.js";

const registerSocketHandlers = (io, socket) => {
    if (socket.user?.id) {
        addUser(socket.user.id, socket.id);
        socket.join(`user:${socket.user.id}`);
    }

    registerChatHandlers(io, socket);
    registerRoomHandlers(io, socket);
    registerTicTacToeHandlers(io, socket);

    socket.on("disconnect", async (reason) => {
        if (socket.user?.id) {
            const userId = socket.user.id;
            removeUser(userId, socket.id);
            socket.leave(`user:${userId}`);

            const rooms = await roomService.getRoomsForUser(userId);

            for (const roomDoc of rooms) {
                const roomCode = roomDoc.roomCode;
                const roomKey = `room:${roomCode}`;
                const result = await roomService.leaveRoom(userId, roomCode);

                if (result.message) {
                    if (activeGames.has(roomKey)) {
                        activeGames.delete(roomKey);
                        io.to(roomKey).emit("ttt:gameEnded", { reason: "room_deleted" });
                    }
                } else {
                    const room = await Room.findOne({ roomCode })
                        .populate("owner", "name avatar")
                        .populate("players", "name avatar");
                    io.to(roomKey).emit("room:updated", { room });
                }
            }
        }
    });
};

export default registerSocketHandlers;