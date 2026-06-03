import { Server } from "socket.io";
import socketAuth from "../../sockets/socketAuth.js";
import registerSocketHandlers from "../../sockets/index.js";
import ApiError from "../utils/api-error.js";

let io = null;

const initializeSocket = (server) => {
    if (io) {
        throw ApiError.conflict("Socket.IO is already initialized");
    }

    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            credentials: true,
        },
    });

    io.use(socketAuth);

    io.engine.on("connection_error", (err) => {
        console.error("Socket connection error:", err.message);
    });

    io.on("connection", (socket) => {
        console.log(
            `New socket connected: ${socket.id} (User: ${socket.user?._id || "Unknown"})`
        );

        registerSocketHandlers(io, socket);

        socket.on("disconnect", (reason) => {
            console.log(`Socket disconnected: ${socket.id} (${reason})`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw ApiError.badRequest("Socket.IO is not initialized. Call initializeSocket first.");
    }
    return io;
};

export { initializeSocket, getIO };