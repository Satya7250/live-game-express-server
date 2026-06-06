import * as roomService from "../modules/rooms/room.service.js";
import Room from "../modules/rooms/room.model.js";

const registerRoomHandlers = (io, socket) => {
    const userId = socket.user?.id;
    if (!userId) return;

    //create room via socket
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

    //join room via socket
    socket.on("room:join", async (data) => {
        try {
            const { roomCode } = data;
            await roomService.joinRoom(userId, roomCode);
            const room = await Room.findOne({ roomCode })
                .populate("owner", "name avatar")
                .populate("players", "name avatar");
            socket.join(`room:${roomCode}`);
            socket.emit("room:joined", { room });
            io.to(`room:${roomCode}`).emit("room:updated", { room });
        } catch (error) {
            socket.emit("room:error", { message: error.message });
        }
    });

    //leave room via socket
    socket.on("room:leave", async (data) => {
        try {
            const { roomCode } = data;
            const result = await roomService.leaveRoom(userId, roomCode);
            socket.leave(`room:${roomCode}`);
            socket.emit("room:left", { result });
            if (!result.message) {
                const room = await Room.findOne({ roomCode })
                    .populate("owner", "name avatar")
                    .populate("players", "name avatar");
                io.to(`room:${roomCode}`).emit("room:updated", { room });
            }
        } catch (error) {
            socket.emit("room:error", { message: error.message });
        }
    });

    //start game via socket
    socket.on("room:start", async (data) => {
        try {
            const { roomCode } = data;
            const room = await roomService.startRoom(
                userId,
                roomCode
            );
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
