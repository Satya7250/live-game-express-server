import ApiResponse from "../../common/utils/api-response.js";
import * as friendService from "./friend.service.js";

const sendFriendRequest = async (req, res, next) => {
    try {
        const friendRequest = await friendService.sendFriendRequest(req.user.id, req.body.receiverId);
        ApiResponse.created(res, "Friend request sent successfully", friendRequest);
    } catch (error) {
        next(error);
    }
};

const acceptFriendRequest = async (req, res, next) => {
    try {
        const request = await friendService.acceptFriendRequest(req.params.requestId, req.user.id);
        ApiResponse.ok(res, "Friend request accepted successfully", request);
    } catch (error) {
        next(error);
    }
};

const rejectFriendRequest = async (req, res, next) => {
    try {
        const request = await friendService.rejectFriendRequest(req.params.requestId, req.user.id);
        ApiResponse.ok(res, "Friend request rejected successfully", request);
    } catch (error) {
        next(error);
    }
};

const cancelFriendRequest = async (req, res, next) => {
    try {
        const result = await friendService.cancelFriendRequest(req.params.requestId, req.user.id);
        ApiResponse.ok(res, result.message);
    } catch (error) {
        next(error);
    }
};

const removeFriend = async (req, res, next) => {
    try {
        const result = await friendService.removeFriend(req.user.id, req.params.friendId);
        ApiResponse.ok(res, result.message);
    } catch (error) {
        next(error);
    }
};

const getFriendRequests = async (req, res, next) => {
    try {
        const requests = await friendService.getFriendRequests(req.user.id);
        ApiResponse.ok(res, "Friend requests retrieved successfully", requests);
    } catch (error) {
        next(error);
    }
};

const getSentRequests = async (req, res, next) => {
    try {
        const requests = await friendService.getSentRequests(req.user.id);
        ApiResponse.ok(res, "Sent friend requests retrieved successfully", requests);
    } catch (error) {
        next(error);
    }
};

const getFriends = async (req, res, next) => {
    try {
        const friends = await friendService.getFriends(req.user.id);
        ApiResponse.ok(res, "Friends retrieved successfully", friends);
    } catch (error) {
        next(error);
    }
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
