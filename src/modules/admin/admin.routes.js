import { Router } from "express";
import * as controller from "./admin.controller.js";
import validate from "../../common/middleware/validate.middleware.js";
import AdminUpdateUserDto from "../dto/admin-update-user.dto.js";
import AdminUpdateRoleDto from "../dto/admin-update-role.dto.js";
import AdminUpdateStatusDto from "../dto/admin-update-status.dto.js";
import { authenticate, authorize } from "../auth/auth.middleware.js";

const router = Router();

// Protected Routes - Only accessible by admin users
router.get("/users", authenticate, authorize("admin"), controller.getUsers);

router.patch("/users/role/:id", authenticate, authorize("admin"), validate(AdminUpdateRoleDto), controller.updateUserRoleById);

router.patch("/users/status/:id", authenticate, authorize("admin"), validate(AdminUpdateStatusDto), controller.updateUserStatusById);

router.get("/users/:id", authenticate, authorize("admin"), controller.getUserById);

router.patch("/users/:id", authenticate, authorize("admin"), validate(AdminUpdateUserDto), controller.updateUserById);

router.delete("/users/:id", authenticate, authorize("admin"), controller.deleteUserById);

export default router;