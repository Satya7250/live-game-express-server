import { verifyAccessToken } from "../common/utils/jwt.utils.js";
import ApiError from "../common/utils/api-error.js";

const socketAuth = async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];

        if (!token) {
            return next(ApiError.unauthorized("Authentication required"));
        }

        const decoded = verifyAccessToken(token);
        socket.user = decoded;
        next();
    } catch (error) {
        next(ApiError.unauthorized("Invalid or expired token"));
    }
};

export default socketAuth;
