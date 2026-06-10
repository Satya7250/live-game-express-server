import { Router } from "express";
import * as controller from "./user.controller.js";
import * as cloudinaryController from "./controllers/cloudinary.controller.js";
import validate from "../../common/middleware/validate.middleware.js";
import UpdateProfileDto from "../dto/update-profile.dto.js";
import DeleteAccountDto from "../dto/delete-account.dto.js";
import { authenticate } from "../auth/auth.middleware.js";

const router = Router();

// Public
router.get("/cloudinary-signature", cloudinaryController.getUploadSignature);

// Protected
router.get("/profile", authenticate, controller.getProfile);
router.patch("/profile", authenticate, validate(UpdateProfileDto), controller.updateProfile);
router.delete("/account", authenticate, validate(DeleteAccountDto), controller.deleteAccount);

export default router;
