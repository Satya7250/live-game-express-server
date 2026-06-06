import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import friendRoutes from "./modules/friends/friend.routes.js";
import notificationRoutes from "./modules/notification/notification.routes.js";
import chatRoutes from "./modules/chat/chat.routes.js";
import roomRoutes from "./modules/rooms/room.routes.js";
import errorHandler from "./common/middleware/errorHandler.middleware.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/rooms", roomRoutes);


app.use(errorHandler);

export default app;