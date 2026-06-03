import { Router } from "express";
import * as controller from "./auth.controller.js";

import validate from "../../common/middleware/validate.middleware.js";

import RegisterDto from "../dto/register.dto.js";
import LoginDto from "../dto/login.dto.js";
import ChangePasswordDto from "../dto/passwordChange.dto.js";
import ForgotPasswordDto from "../dto/forgot-password.dto.js";
import ResetPasswordDto from "../dto/reset-password.dto.js";

import { authenticate } from "./auth.middleware.js";

const router = Router();

// Public Routes
router.post("/register", validate(RegisterDto), controller.register);

router.post("/login", validate(LoginDto), controller.login);

router.post("/forgot-password", validate(ForgotPasswordDto), controller.forgotPassword);

router.post("/reset-password/:token", validate(ResetPasswordDto), controller.resetPassword);

router.post("/verify-email/:token", controller.verifyEmail);

router.post("/refresh-token", controller.refresh);

// Protected Routes
router.post("/logout", authenticate, controller.logout);

router.post("/change-password", authenticate, validate(ChangePasswordDto), controller.changePassword);

router.get("/me", authenticate, controller.getMe);


export default router;