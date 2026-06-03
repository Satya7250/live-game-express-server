import Friend from "./friend.model.js";
import ApiError from "../../common/utils/api-error.js";

const sendFriendRequest = async (senderId, receiverId) => {
    if (senderId === receiverId) {
        throw ApiError.badRequest("Cannot send friend request to yourself");
    }

    const existingRequest = await Friend.findOne({
        $or: [
            { sender: senderId, receiver: receiverId },
            { sender: receiverId, receiver: senderId },
        ],
        status: { $in: ["pending", "accepted"] },
    });

    if (existingRequest) {
        if (existingRequest.status === "pending") {
            throw ApiError.conflict("Friend request already sent");
        } else if (existingRequest.status === "accepted") {
            throw ApiError.conflict("Already friends");
        }
    }

    const friendRequest = await Friend.create({
        sender: senderId,
        receiver: receiverId,
    });

    return friendRequest;
};

const acceptFriendRequest = async (requestId, userId) => {
    const request = await Friend.findById(requestId);
    if (!request) {
        throw ApiError.notFound("Friend request not found");
    }

    if (request.receiver.toString() !== userId.toString()) {
        throw ApiError.forbidden("You are not authorized to accept this request");
    }

    if (request.status !== "pending") {
        throw ApiError.badRequest("Friend request is not pending");
    }

    request.status = "accepted";
    await request.save();

    return request;
};

const rejectFriendRequest = async (requestId, userId) => {
    const request = await Friend.findById(requestId);
    if (!request) {
        throw ApiError.notFound("Friend request not found");
    }

    if (request.receiver.toString() !== userId.toString()) {
        throw ApiError.forbidden("You are not authorized to reject this request");
    }

    if (request.status !== "pending") {
        throw ApiError.badRequest("Friend request is not pending");
    }

    request.status = "rejected";
    await request.save();

    return request;
};

const cancelFriendRequest = async (requestId, userId) => {
    const request = await Friend.findById(requestId);
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
    return { message: "Friend request canceled successfully" };
};

const removeFriend = async (userId, friendId) => {
    const friendship = await Friend.findOne({
        $or: [
            { sender: userId, receiver: friendId, status: "accepted" },
            { sender: friendId, receiver: userId, status: "accepted" },
        ],
    });

    if (!friendship) {
        throw ApiError.notFound("Friendship not found");
    }

    await Friend.findByIdAndDelete(friendship._id);
    return { message: "Friend removed successfully" };
};

const getFriendRequests = async (userId) => {
    const requests = await Friend.find({
        receiver: userId,
        status: "pending",
    }).populate("sender", "name email avatar")
        .lean();

    return requests;
};

const getSentRequests = async (userId) => {
    const requests = await Friend.find({
        sender: userId,
        status: "pending",
    }).populate("receiver", "name email avatar").lean();

    return requests;
};

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
