import * as adminService from "./admin.service.js";
import ApiResponse from "../../common/utils/api-response.js";

const getUsers = async (req, res, next) => {
    try {
        const users = await adminService.getUsers();
        ApiResponse.ok(res, "Get All Users Successfully", users);
    } catch (error) {
        next(error);
    }
}

const getUserById = async (req, res, next) => {
    try {
        const user = await adminService.getUserById(req.params.id);
        ApiResponse.ok(res, "Get User Successfully", user);
    } catch (error) {
        next(error);
    }
}

const updateUserById = async (req, res, next) => {
    try {
        const user = await adminService.updateUserById(req.params.id, req.body);
        ApiResponse.ok(res, "Update User Successfully", user);
    } catch (error) {
        next(error);
    }
}

const deleteUserById = async (req, res, next) => {
    try {
        await adminService.deleteUserById(req.params.id);
        ApiResponse.ok(res, "Delete User Successfully");
    } catch (error) {
        next(error);
    }
}

const updateUserRoleById = async (req, res, next) => {
    try {
        const user = await adminService.updateUserRoleById(req.params.id, req.body.role);
        ApiResponse.ok(res, "Update User Role Successfully", user);
    } catch (error) {
        next(error);
    }
}

const updateUserStatusById = async (req, res, next) => {
    try {
        const user = await adminService.updateUserStatusById(req.params.id, req.body.isActive);
        ApiResponse.ok(res, "Update User Status Successfully", user);
    } catch (error) {
        next(error);
    }
}

export { getUsers, getUserById, updateUserById, deleteUserById, updateUserRoleById, updateUserStatusById };
