import ApiResponse from "../../common/utils/api-response.js";
import * as notificationService from "./notification.service.js";

const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await notificationService.getNotifications(userId, page, limit);
        ApiResponse.ok(res, "Notifications retrieved successfully", result);
    } catch (error) {
        next(error);
    }
};

const getUnreadCount = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await notificationService.getUnreadCount(userId);
        ApiResponse.ok(res, "Unread count retrieved successfully", result);
    } catch (error) {
        next(error);
    }
};

const markAsRead = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.notificationId;
        const notification = await notificationService.markAsRead(notificationId, userId);
        ApiResponse.ok(res, "Notification marked as read", notification);
    } catch (error) {
        next(error);
    }
};

const markAllAsRead = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await notificationService.markAllAsRead(userId);
        ApiResponse.ok(res, result.message);
    } catch (error) {
        next(error);
    }
};

const deleteNotification = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.notificationId;
        const result = await notificationService.deleteNotification(notificationId, userId);
        ApiResponse.ok(res, result.message);
    } catch (error) {
        next(error);
    }
};

export {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};
