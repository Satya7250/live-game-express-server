import Notification from "./notification.model.js";
import ApiError from "../../common/utils/api-error.js";
import { getIO } from "../../common/config/socket.js";
import { getUserSockets, isOnline } from "../../sockets/onlineUser.js";

const createNotification = async ({ recipient, sender, type, title, message, data = {} }) => {
    const notification = await Notification.create({
        recipient,
        sender,
        type,
        title,
        message,
        data,
    });

    await notification.populate('sender', 'name email avatar');

    if (isOnline(recipient)) {
        const recipientSockets = getUserSockets(recipient);
        const io = getIO();
        recipientSockets.forEach(socketId => {
            io.to(socketId).emit('notification:new', notification);
        });
    }

    return notification;
};

const getNotifications = async (userId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    const notifications = await Notification.find({ recipient: userId })
        .populate('sender', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Notification.countDocuments({ recipient: userId });
    const totalPages = Math.ceil(total / limit);

    return {
        notifications,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    };
};

const getUnreadCount = async (userId) => {
    const count = await Notification.countDocuments({ recipient: userId, isRead: false });
    return { count };
};

const markAsRead = async (notificationId, userId) => {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
        throw ApiError.notFound("Notification not found");
    }

    if (notification.recipient.toString() !== userId.toString()) {
        throw ApiError.forbidden("You are not authorized to update this notification");
    }

    notification.isRead = true;
    await notification.save();

    if (isOnline(userId)) {
        const io = getIO();
        const recipientSockets = getUserSockets(userId);
        recipientSockets.forEach(socketId => {
            io.to(socketId).emit('notification:read', notification);
        });
    }

    return notification;
};

const markAllAsRead = async (userId) => {
    await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });

    if (isOnline(userId)) {
        const io = getIO();
        const recipientSockets = getUserSockets(userId);
        recipientSockets.forEach(socketId => {
            io.to(socketId).emit('notification:all-read');
        });
    }

    return { message: "All notifications marked as read" };
};

const deleteNotification = async (notificationId, userId) => {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
        throw ApiError.notFound("Notification not found");
    }

    if (notification.recipient.toString() !== userId.toString()) {
        throw ApiError.forbidden("You are not authorized to delete this notification");
    }

    await Notification.findByIdAndDelete(notificationId);

    if (isOnline(userId)) {
        const io = getIO();
        const recipientSockets = getUserSockets(userId);
        recipientSockets.forEach(socketId => {
            io.to(socketId).emit('notification:deleted', { notificationId });
        });
    }

    return { message: "Notification deleted successfully" };
};

export {
    createNotification,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};
