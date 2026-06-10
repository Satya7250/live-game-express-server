import Friend from "./friend.model.js";
import ApiError from "../../common/utils/api-error.js";
import User from "../auth/auth.model.js";
import { createNotification } from "../notification/notification.service.js";
import { NOTIFICATION_TYPES } from "../notification/notification.constants.js";
import { emitToUser } from "../../common/utils/socket.utils.js";

//send friend request
const sendFriendRequest = async (senderId, receiverId) => {
    if (senderId === receiverId) {
        throw ApiError.badRequest("Cannot send friend request to yourself");
    }

    const [receiverUser, senderUser] = await Promise.all([
        User.findById(receiverId).select("_id name email avatar").lean(),
        User.findById(senderId).select("_id name email avatar").lean(),
    ]);

    if (!receiverUser) {
        throw ApiError.notFound("Receiver not found");
    }

    try {
        const friendRequest = await Friend.create({
            sender: senderId,
            receiver: receiverId,
        });

        await createNotification({
            recipient: receiverId,
            sender: senderId,
            type: NOTIFICATION_TYPES.FRIEND_REQUEST,
            title: "New Friend Request",
            message: `${senderUser.name} sent you a friend request`,
            data: {
                requestId: friendRequest._id,
                senderId,
                receiverId,
            },
        });

        // Emit socket event to receiver
        const requestWithSender = {
            ...friendRequest.toObject(),
            sender: senderUser,
        };
        emitToUser(receiverId, "friend:requestReceived", requestWithSender);

        return friendRequest;
    } catch (error) {
        if (error.code === 11000) {
            const existing = await Friend.findOne({
                userPair: { $all: [senderId, receiverId] },
                status: { $in: ["pending", "accepted"] },
            })
                .select("status")
                .lean();

            if (existing?.status === "pending") {
                throw ApiError.conflict("Friend request already exists");
            }

            if (existing?.status === "accepted") {
                throw ApiError.conflict("Already friends");
            }
        }

        throw error;
    }
};

//accept friend request
const acceptFriendRequest = async (requestId, userId) => {
    const request = await Friend.findById(requestId)
        .populate("sender", "_id name email avatar");

    if (!request) {
        throw ApiError.notFound("Friend request not found");
    }

    if (request.receiver.toString() !== userId.toString()) {
        throw ApiError.forbidden("Not authorized");
    }

    if (request.status !== "pending") {
        throw ApiError.badRequest("Friend request is not pending");
    }

    request.status = "accepted";

    await request.save();

    const receiverUser = await User.findById(userId)
        .select("_id name email avatar")
        .lean();

    await createNotification({
        recipient: request.sender._id,
        sender: userId,
        type: NOTIFICATION_TYPES.FRIEND_ACCEPTED,
        title: "Friend Request Accepted",
        message: `${receiverUser.name} accepted your friend request`,
        data: {
            requestId: request._id,
            senderId: request.sender._id,
            receiverId: userId,
        },
    });

    // Emit socket events
    // To the original sender (they got a new friend)
    emitToUser(request.sender._id.toString(), "friend:requestAccepted", {
        ...request.toObject(),
        receiver: receiverUser,
    });
    
    // To the receiver (they got a new friend)
    emitToUser(userId, "friend:requestAccepted", {
        ...request.toObject(),
        sender: request.sender,
    });

    return request;
};

//reject friend request
const rejectFriendRequest = async (requestId, userId) => {
    const request = await Friend.findById(requestId);

    if (!request) {
        throw ApiError.notFound("Friend request not found");
    }

    if (request.receiver.toString() !== userId.toString()) {
        throw ApiError.forbidden("Not authorized");
    }

    if (request.status !== "pending") {
        throw ApiError.badRequest("Friend request is not pending");
    }

    request.status = "rejected";

    await request.save();

    const receiverUser = await User.findById(userId)
        .select("name")
        .lean();

    await createNotification({
        recipient: request.sender,
        sender: userId,
        type: NOTIFICATION_TYPES.FRIEND_REJECTED,
        title: "Friend Request Rejected",
        message: `${receiverUser.name} rejected your friend request`,
        data: {
            requestId: request._id,
            senderId: request.sender,
            receiverId: userId,
        },
    });

    // Emit socket event to original sender
    emitToUser(request.sender.toString(), "friend:requestRejected", {
        requestId: request._id,
    });

    return request;
};

//cancel friend request
const cancelFriendRequest = async (requestId, userId) => {
    const request = await Friend.findById(requestId).select("_id sender receiver status").lean();
    if (!request) {
        throw ApiError.notFound("Friend request not found");
    }

    if (request.sender.toString() !== userId.toString()) {
        throw ApiError.forbidden("You are not authorized to cancel this request");
    }

    if (request.status !== "pending") {
        throw ApiError.badRequest("Friend request is not pending");
    }

    await Friend.findByIdAndDelete(requestId);
    
    // Emit socket event to the receiver
    emitToUser(request.receiver.toString(), "friend:requestCanceled", {
        requestId: request._id,
    });

    return { message: "Friend request canceled successfully" };
};

//remove friend
const removeFriend = async (userId, friendId) => {
    const friendship = await Friend.findOne({
        $or: [
            { sender: userId, receiver: friendId, status: "accepted" },
            { sender: friendId, receiver: userId, status: "accepted" },
        ],
    }).select("_id").lean();

    if (!friendship) {
        throw ApiError.notFound("Friendship not found");
    }

    await Friend.findByIdAndDelete(friendship._id);
    
    // Emit socket events to both users
    emitToUser(userId, "friend:removed", { friendId });
    emitToUser(friendId, "friend:removed", { friendId: userId });

    return { message: "Friend removed successfully" };
};

//get friend requests
const getFriendRequests = async (userId) => {
    const requests = await Friend.find({
        receiver: userId,
        status: "pending",
    }).populate("sender", "name email avatar").lean();

    return requests;
};

//get sent requests
const getSentRequests = async (userId) => {
    const requests = await Friend.find({
        sender: userId,
        status: "pending",
    }).populate("receiver", "name email avatar").lean();

    return requests;
};

//get friends
const getFriends = async (userId) => {
    const friendships = await Friend.find({
        $or: [
            { sender: userId, status: "accepted" },
            { receiver: userId, status: "accepted" },
        ],
    })
        .populate("sender", "name email avatar")
        .populate("receiver", "name email avatar")
        .lean();

    const friends = friendships.map((friendship) => {
        if (friendship.sender._id.toString() === userId.toString()) {
            return friendship.receiver;
        }
        return friendship.sender;
    });

    return friends;
};

export {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
    getFriendRequests,
    getSentRequests,
    getFriends,
};
