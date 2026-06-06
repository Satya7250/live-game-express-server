import Conversation from "./conversation.model.js";
import Message from "./message.model.js";
import ApiError from "../../common/utils/api-error.js";
import User from "../auth/auth.model.js";

//create conversation
const createConversation = async (userId, participantId) => {
    if (userId === participantId) {
        throw ApiError.badRequest(
            "Cannot create conversation with yourself"
        );
    }

    const participant = await User.findById(participantId)
        .select("_id")
        .lean();

    if (!participant) {
        throw ApiError.notFound("Participant not found");
    }

    const sortedParticipants = [userId, participantId].sort(
        (a, b) =>
            a.toString().localeCompare(
                b.toString()
            )
    );

    let conversation = await Conversation.findOne({
        type: "private",
        participants: {
            $all: sortedParticipants,
            $size: 2,
        },
    }).lean();

    if (conversation) {
        return conversation;
    }

    conversation = await Conversation.create({
        type: "private",
        participants: [userId, participantId],
    });

    return conversation.toObject();
};

//get conversations
const getConversations = async (
    userId,
    page = 1,
    limit = 20
) => {
    page = Math.max(Number(page) || 1, 1);
    limit = Math.min(
        Math.max(Number(limit) || 20, 1),
        100
    );

    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({
        participants: userId,
    })
        .populate(
            "participants",
            "name avatar"
        )
        .populate(
            "lastMessageSender",
            "name avatar"
        )
        .sort({
            lastMessageAt: -1,
            updatedAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean();

    const total =
        await Conversation.countDocuments({
            participants: userId,
        });

    return {
        conversations,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(
                total / limit
            ),
        },
    };
};

//send message
const sendMessage = async (
    userId,
    conversationId,
    content
) => {
    const conversation =
        await Conversation.findById(
            conversationId
        );

    if (!conversation) {
        throw ApiError.notFound(
            "Conversation not found"
        );
    }

    const isParticipant =
        conversation.participants.some(
            participant =>
                participant.toString() ===
                userId.toString()
        );

    if (!isParticipant) {
        throw ApiError.forbidden(
            "Not a participant of this conversation"
        );
    }

    const message = await Message.create({
        conversation: conversationId,
        sender: userId,
        content,
        readBy: [userId],
    });

    await message.populate(
        "sender",
        "name avatar"
    );

    conversation.lastMessage = content;
    conversation.lastMessageSender = userId;
    conversation.lastMessageAt =
        new Date();

    await conversation.save();

    return {
        message,
        conversation,
    };
};

//get messages
const getMessages = async (
    userId,
    conversationId,
    page = 1,
    limit = 50
) => {
    page = Math.max(Number(page) || 1, 1);
    limit = Math.min(
        Math.max(Number(limit) || 50, 1),
        100
    );

    const conversation =
        await Conversation.findById(
            conversationId
        ).lean();

    if (!conversation) {
        throw ApiError.notFound(
            "Conversation not found"
        );
    }

    const isParticipant =
        conversation.participants.some(
            participant =>
                participant.toString() ===
                userId.toString()
        );

    if (!isParticipant) {
        throw ApiError.forbidden(
            "Not a participant of this conversation"
        );
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({
        conversation: conversationId,
    })
        .populate(
            "sender",
            "name avatar"
        )
        .sort({
            createdAt: 1,
        })
        .skip(skip)
        .limit(limit)
        .lean();

    const total =
        await Message.countDocuments({
            conversation: conversationId,
        });

    return {
        messages,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(
                total / limit
            ),
        },
    };
};

export {
    createConversation,
    getConversations,
    sendMessage,
    getMessages,
};