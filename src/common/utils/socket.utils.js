import { getIO } from "../config/socket.js";
import { getUserSockets } from "../../sockets/onlineUser.js";

/**
 * Emit an event to a specific user
 * @param {string} userId - The ID of the user to emit to
 * @param {string} event - The event name
 * @param {*} data - The data to send
 */
const emitToUser = (userId, event, data) => {
  const io = getIO();
  
  // Try sending to user's personal room first
  io.to(`user:${userId}`).emit(event, data);
  
  // Also send directly to all active socket connections of the user
  const socketIds = getUserSockets(userId);
  socketIds.forEach((socketId) => {
    io.to(socketId).emit(event, data);
  });
};

/**
 * Emit an event to multiple users
 * @param {string[]} userIds - Array of user IDs
 * @param {string} event - The event name
 * @param {*} data - The data to send
 */
const emitToUsers = (userIds, event, data) => {
  userIds.forEach((userId) => {
    emitToUser(userId, event, data);
  });
};

export { emitToUser, emitToUsers };
