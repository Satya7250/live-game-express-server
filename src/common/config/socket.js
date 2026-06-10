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
    pingInterval: 10000,
    pingTimeout: 20000,
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    registerSocketHandlers(io, socket);
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