// Store online users (userId -> Set of socketIds)
const onlineUsers = new Map();

// Add a user's socket connection
const addUser = (userId, socketId) => {
    
    if (!userId || !socketId) return;
    if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socketId);
};

// Remove a user's socket connection
const removeUser = (userId, socketId) => {

    if (!userId || !socketId) return;
    if (onlineUsers.has(userId)) {
        const sockets = onlineUsers.get(userId);
        sockets.delete(socketId);
        if (sockets.size === 0) {
            onlineUsers.delete(userId);
        }
    }
};

// Get all active socket IDs for a user
const getUserSockets = (userId) => {
    const sockets = onlineUsers.get(userId);
    return sockets ? Array.from(sockets) : [];
};

// Check if a user has any active connections
const isOnline = (userId) => {
    return onlineUsers.has(userId);
};

// Get list of all online user IDs
const getOnlineUsers = () => {
    return Array.from(onlineUsers.keys());
};

// Get number of online users
const getOnlineCount = () => {
    return onlineUsers.size;
};

export {
    addUser,
    removeUser,
    getUserSockets,
    isOnline,
    getOnlineUsers,
    getOnlineCount
};

export default onlineUsers;
