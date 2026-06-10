import * as roomService from "../modules/rooms/room.service.js";
import Room from "../modules/rooms/room.model.js";
import { activeGames } from "./activeGames.js";

const registerRoomHandlers = (io, socket) => {
    const userId = socket.user?.id;
    if (!userId) return;

    // Create room
    socket.on("room:create", async (data) => {
        try {
            const room = await roomService.createRoom(userId, data);
            const populatedRoom = await Room.findById(room._id)
                .populate("owner", "name avatar")
                .populate("players", "name avatar");
            socket.join(`room:${room.roomCode}`);
            socket.emit("room:created", { room: populatedRoom });
            io.to(`room:${room.roomCode}`).emit("room:updated", { room: populatedRoom });
        } catch (error) {
            socket.emit("room:error", { message: error.message });
        }
    });

    // Join room
    socket.on("room:join", async (data) => {
        try {
            const { roomCode } = data;
            let room = await Room.findOne({ roomCode })
                .populate("owner", "name avatar")
                .populate("players", "name avatar");
            
            if (!room) {
                throw new Error("Room not found");
            }

            // Check if user is already in the room
            const isAlreadyInRoom = room.players.some(
                (player) => player._id.toString() === userId.toString()
            );

            // If not in room, add them
            if (!isAlreadyInRoom) {
                await roomService.joinRoom(userId, roomCode);
                // Re-fetch the room after joining
                room = await Room.findOne({ roomCode })
                    .populate("owner", "name avatar")
                    .populate("players", "name avatar");
            }

            socket.join(`room:${roomCode}`);
            socket.emit("room:joined", { room });
            io.to(`room:${roomCode}`).emit("room:updated", { room });
        } catch (error) {
            socket.emit("room:error", { message: error.message });
        }
    });

    // Leave room
    socket.on("room:leave", async (data) => {
        try {
            const { roomCode } = data;
            const roomKey = `room:${roomCode}`;
            const result = await roomService.leaveRoom(userId, roomCode);

            // Clean up active game if room is empty
            if (result.message) {
                if (activeGames.has(roomKey)) {
                    activeGames.delete(roomKey);
                    io.to(roomKey).emit("ttt:gameEnded", { reason: "room_deleted" });
                }
            } else {
                // Update remaining players
                const room = await Room.findOne({ roomCode })
                    .populate("owner", "name avatar")
                    .populate("players", "name avatar");
                io.to(roomKey).emit("room:updated", { room });
            }

            socket.leave(roomKey);
            socket.emit("room:left", { result });
        } catch (error) {
            socket.emit("room:error", { message: error.message });
        }
    });

    // Start game
    socket.on("room:start", async (data) => {
        try {
            const { roomCode } = data;
            const room = await roomService.startRoom(userId, roomCode);
            const populatedRoom = await Room.findById(room._id)
                .populate("owner", "name avatar")
                .populate("players", "name avatar");
            io.to(`room:${roomCode}`).emit("room:started", { room: populatedRoom });
            io.to(`room:${roomCode}`).emit("room:updated", { room: populatedRoom });
        } catch (error) {
            socket.emit("room:error", { message: error.message });
        }
    });
};

export default registerRoomHandlers;
