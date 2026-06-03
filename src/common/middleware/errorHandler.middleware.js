// Global error-handling middleware for the entire application.
// Handles custom ApiError responses and unexpected server errors.
import ApiError from "../utils/api-error.js";

const errorHandler = (err, req, res, next) => {
    console.error(err);

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }

    res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
};

export default errorHandler;