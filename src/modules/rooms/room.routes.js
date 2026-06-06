import { Router } from "express";
import * as controller from "./room.controller.js";
import validate from "../../common/middleware/validate.middleware.js";
import { authenticate } from "../../modules/auth/auth.middleware.js";
import { CreateRoomDto } from "./create-room.dto.js";
import { JoinRoomDto } from "./join-room.dto.js";

const router = Router();

router.use(authenticate);

router.post("/", validate(CreateRoomDto), controller.createRoom);
router.post("/join", validate(JoinRoomDto), controller.joinRoom);
router.post("/:roomCode/leave", controller.leaveRoom);
router.get("/:roomCode", controller.getRoomByCode);
router.get("/", controller.getMyRooms);

export default router;
