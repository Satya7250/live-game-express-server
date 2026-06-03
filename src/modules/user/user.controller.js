import * as userService from "./user.service.js";
import ApiResponse from "../../common/utils/api-response.js";

const getProfile = async (req, res) => {
    const user = await userService.getProfile(req.user.id);
    ApiResponse.ok(res, "User profile retrieved successfully", user);
};

const updateProfile = async (req, res) => {
    const user = await userService.updateProfile(req.user.id, req.body);
    ApiResponse.ok(res, "Profile updated successfully", user);
};

const deleteAccount = async(req, res) => {
    const result = await userService.deleteAccount(req.user.id, req.body.password);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    ApiResponse.ok(res, result.message, result);
};

export { getProfile, updateProfile, deleteAccount };
