import { addUser, removeUser } from "./onlineUser.js";

import registerChatHandlers from "./chat.handler.js";
import registerRoomHandlers from "./room.handler.js";
import registerTicTacToeHandlers from "./ticTacToe.handler.js";
import * as roomService from "../modules/rooms/room.service.js";
import Room from "../modules/rooms/room.model.js";
import { activeGames } from "./activeGames.js";

const registerSocketHandlers = (io, socket) => {
    console.log(
        `Registering handlers for socket: ${socket.id} (User: ${
            socket.user?.id || "Unknown"
        })`
    );

    if (socket.user?.id) {
        addUser(socket.user.id, socket.id);
    }

    //chat
    registerChatHandlers(io, socket);
    //rooms
    registerRoomHandlers(io, socket);
    //tic-tac-toe
    registerTicTacToeHandlers(io, socket);

    socket.on("disconnect", async (reason) => {
        console.log(
            `Socket disconnected: ${socket.id}, Reason: ${reason}`
        );

        if (socket.user?.id) {
            const userId = socket.user.id;
            removeUser(userId, socket.id);

            // Find rooms user belongs to
            const rooms = await roomService.getRoomsForUser(userId);

            for (const roomDoc of rooms) {
                const roomCode = roomDoc.roomCode;
                const roomKey = `room:${roomCode}`;

                // Leave room through roomService
                const result = await roomService.leaveRoom(userId, roomCode);

                // Clean up active game if needed
                if (result.message) {
                    if (activeGames.has(roomKey)) {
                        activeGames.delete(roomKey);
                        io.to(roomKey).emit("ttt:gameEnded", { reason: "room_deleted" });
                    }
                } else {
                    // Notify remaining players
                    const room = await Room.findOne({ roomCode })
                        .populate("owner", "name avatar")
                        .populate("players", "name avatar");
                    io.to(roomKey).emit("room:updated", { room });
                }

                // Emit updated room state (handled above)
            }
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