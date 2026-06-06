import Room from "./room.model.js";
import ApiError from "../../common/utils/api-error.js";

//generate unique room code
const generateRoomCode = async () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let roomCode;
    let isUnique = false;

    while (!isUnique) {
        roomCode = "";
        for (let i = 0; i < 6; i++) {
            roomCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const existingRoom = await Room.findOne({ roomCode });
        if (!existingRoom) {
            isUnique = true;
        }
    }
    return roomCode;
};

//create room
const createRoom = async (userId, data) => {
    const roomCode = await generateRoomCode();
    const room = await Room.create({
        name: data.name,
        roomCode,
        owner: userId,
        players: [userId],
        maxPlayers: data.maxPlayers,
        gameType: data.gameType,
    });
    return room;
};

// join room
const joinRoom = async (userId, roomCode) => {
    const room = await Room.findOne({ roomCode });

    if (!room) {
        throw ApiError.notFound("Room not found");
    }

    if (room.status !== "waiting") {
        throw ApiError.badRequest("Room is not waiting for players");
    }

    if (room.players.length >= room.maxPlayers) {
        throw ApiError.badRequest("Room is full");
    }

    if (
        room.players.some(
            (playerId) => playerId.toString() === userId.toString()
        )
    ) {
        throw ApiError.badRequest("You are already in this room");
    }

    room.players.push(userId);

    await room.save();

    return room;
};

// leave room
const leaveRoom = async (userId, roomCode) => {
    const room = await Room.findOne({ roomCode });

    if (!room) {
        throw ApiError.notFound("Room not found");
    }

    const playerIndex = room.players.findIndex(
        (playerId) => playerId.toString() === userId.toString()
    );

    if (playerIndex === -1) {
        throw ApiError.badRequest("You are not in this room");
    }

    room.players.splice(playerIndex, 1);

    if (room.owner.toString() === userId.toString()) {
        if (room.players.length > 0) {
            room.owner = room.players[0];
        }
    }

    if (room.players.length === 0) {
        await Room.findByIdAndDelete(room._id);
        return { message: "Room deleted successfully" };
    }

    await room.save();

    return room;
};

//get room by code
const getRoomByCode = async (roomCode) => {
    const room = await Room.findOne({ roomCode })
        .populate("owner", "name avatar")
        .populate("players", "name avatar");
    if (!room) {
        throw ApiError.notFound("Room not found");
    }
    return room;
};

//get my rooms
const getMyRooms = async (userId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    const rooms = await Room.find({
        $or: [
            { owner: userId },
            { players: userId },
        ],
    })
        .populate("owner", "name avatar")
        .populate("players", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await Room.countDocuments({
        $or: [
            { owner: userId },
            { players: userId },
        ],
    });
    return {
        rooms,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const startRoom = async (userId, roomCode) => {
    const room = await Room.findOne({ roomCode });

    if (!room) {
        throw ApiError.notFound("Room not found");
    }

    if (room.owner.toString() !== userId.toString()) {
        throw ApiError.badRequest("Only room owner can start the game");
    }

    if (room.status !== "waiting") {
        throw ApiError.badRequest("Room is not waiting for players");
    }

    if (room.players.length < 2) {
        throw ApiError.badRequest("Need at least 2 players to start the game");
    }

    room.status = "playing";

    await room.save();

    return room;
};

export {
    generateRoomCode,
    createRoom,
    joinRoom,
    leaveRoom,
    getRoomByCode,
    getMyRooms,
    startRoom,
};
