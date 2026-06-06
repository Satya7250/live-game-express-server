import { Router } from "express";
import * as controller from "./chat.controller.js";
import validate from "../../common/middleware/validate.middleware.js";
import { authenticate } from "../auth/auth.middleware.js";
import { CreateConversationDto } from "./create-conversation.dto.js";
import { SendMessageDto } from "./send-message.dto.js";

const router = Router();

router.use(authenticate);

router.post("/conversations", validate(CreateConversationDto), controller.createConversation);
router.get("/conversations", controller.getConversations);
router.get("/conversations/:conversationId/messages", controller.getMessages);
router.post("/messages", validate(SendMessageDto), controller.sendMessage);

export default router;
