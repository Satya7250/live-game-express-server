import ApiResponse from "../../common/utils/api-response.js";
import * as roomService from "./room.service.js";

const createRoom = async (req, res, next) => {
    try {
        const room = await roomService.createRoom(req.user.id, req.body);
        ApiResponse.created(res, "Room created successfully", room);
    } catch (error) {
        next(error);
    }
};

const joinRoom = async (req, res, next) => {
    try {
        const room = await roomService.joinRoom(req.user.id, req.body.roomCode);
        ApiResponse.ok(res, "Joined room successfully", room);
    } catch (error) {
        next(error);
    }
};

const leaveRoom = async (req, res, next) => {
    try {
        const result = await roomService.leaveRoom(req.user.id, req.params.roomCode);
        ApiResponse.ok(res, "Left room successfully", result);
    } catch (error) {
        next(error);
    }
};

const getRoomByCode = async (req, res, next) => {
    try {
        const room = await roomService.getRoomByCode(req.params.roomCode);
        ApiResponse.ok(res, "Room retrieved successfully", room);
    } catch (error) {
        next(error);
    }
};

const getMyRooms = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 20);
        const result = await roomService.getMyRooms(req.user.id, page, limit);
        ApiResponse.ok(res, "Rooms retrieved successfully", result);
    } catch (error) {
        next(error);
    }
};

export {
    createRoom,
    joinRoom,
    leaveRoom,
    getRoomByCode,
    getMyRooms,
};
