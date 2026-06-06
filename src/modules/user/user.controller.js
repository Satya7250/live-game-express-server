import * as userService from "./user.service.js";
import ApiResponse from "../../common/utils/api-response.js";

const getProfile = async (req, res, next) => {
    try {
        const user = await userService.getProfile(req.user.id);
        ApiResponse.ok(res, "User profile retrieved successfully", user);
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const user = await userService.updateProfile(req.user.id, req.body);
        ApiResponse.ok(res, "Profile updated successfully", user);
    } catch (error) {
        next(error);
    }
};

const deleteAccount = async(req, res, next) => {
    try {
        const result = await userService.deleteAccount(req.user.id, req.body.password);
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        ApiResponse.ok(res, result.message, result);
    } catch (error) {
        next(error);
    }
};

export { getProfile, updateProfile, deleteAccount };
