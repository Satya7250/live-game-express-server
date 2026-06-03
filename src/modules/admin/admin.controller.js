import * as adminService from "./admin.service.js";
import ApiResponse from "../../common/utils/api-response.js";

const getUsers = async (req, res) => {
    const users = await adminService.getUsers();
    ApiResponse.ok(res, "Get All Users Successfully", users);
}

const getUserById = async (req, res) => {
    const user = await adminService.getUserById(req.params.id);
    ApiResponse.ok(res, "Get User Successfully", user);
}

const updateUserById = async (req, res) => {
    const user = await adminService.updateUserById(req.params.id, req.body);
    ApiResponse.ok(res, "Update User Successfully", user);
}

const deleteUserById = async (req, res) => {
    await adminService.deleteUserById(req.params.id);
    ApiResponse.ok(res, "Delete User Successfully");
}

const updateUserRoleById = async (req, res) => {
    const user = await adminService.updateUserRoleById(req.params.id, req.body.role);
    ApiResponse.ok(res, "Update User Role Successfully", user);
}

const updateUserStatusById = async (req, res) => {
    const user = await adminService.updateUserStatusById(req.params.id, req.body.isActive);
    ApiResponse.ok(res, "Update User Status Successfully", user);
}

export { getUsers, getUserById, updateUserById, deleteUserById, updateUserRoleById, updateUserStatusById };
