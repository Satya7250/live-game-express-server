import { Router } from "express";
import * as controller from "./friend.controller.js";

import validate from "../../common/middleware/validate.middleware.js";
import { authenticate } from "../auth/auth.middleware.js";
import { SendFriendRequestDto } from "./friend.dto.js";

const router = Router();

router.use(authenticate);

router.post("/send-request", validate(SendFriendRequestDto), controller.sendFriendRequest);
router.patch("/accept-request/:requestId", controller.acceptFriendRequest);
router.patch("/reject-request/:requestId", controller.rejectFriendRequest);
router.delete("/cancel-request/:requestId", controller.cancelFriendRequest);
router.delete("/remove/:friendId", controller.removeFriend);
router.get("/requests", controller.getFriendRequests);
router.get("/sent-requests", controller.getSentRequests);
router.get("/", controller.getFriends);

export default router;