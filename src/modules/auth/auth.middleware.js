import ApiError from "../../common/utils/api-error.js";
import User from "./auth.model.js";
import { verifyAccessToken } from "../../common/utils/jwt.utils.js";

// Authentication Middleware
const authenticate = async (req, res, next) => {
    let token;

    if (req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        throw ApiError.unauthorized("Not authenticated");
    }

    let decoded;

    try {
        decoded = verifyAccessToken(token);
    } catch (error) {
        throw ApiError.unauthorized("Invalid or expired token");
    }

    const user = await User.findById(decoded.id);

    if (!user) {
        throw ApiError.unauthorized("User no longer exists");
    }

    if (!user.isActive) {
        throw ApiError.forbidden("Account has been deactivated");
    }

    req.user = {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
    };

    next();
};

// Authorization Middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw ApiError.forbidden(
                "You do not have permission to perform this action"
            );
        }

        next();
    };
};

export { authenticate, authorize };