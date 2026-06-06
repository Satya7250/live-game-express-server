import ApiResponse from "../../common/utils/api-response.js";
import * as chatService from "./chat.service.js";

const createConversation = async (req, res, next) => {
    try {
        const conversation = await chatService.createConversation(req.user.id, req.body.participantId);
        ApiResponse.created(res, "Conversation created successfully", conversation);
    } catch (error) {
        next(error);
    }
};

const getConversations = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await chatService.getConversations(req.user.id, page, limit);
        ApiResponse.ok(res, "Conversations retrieved successfully", result);
    } catch (error) {
        next(error);
    }
};

const sendMessage = async (req, res, next) => {
    try {
        const { message, conversation } = await chatService.sendMessage(req.user.id, req.body.conversationId, req.body.content);
        ApiResponse.created(res, "Message sent successfully", { message, conversation });
    } catch (error) {
        next(error);
    }
};

const getMessages = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const result = await chatService.getMessages(req.user.id, req.params.conversationId, page, limit);
        ApiResponse.ok(res, "Messages retrieved successfully", result);
    } catch (error) {
        next(error);
    }
};

export {
    createConversation,
    getConversations,
    sendMessage,
    getMessages,
};
