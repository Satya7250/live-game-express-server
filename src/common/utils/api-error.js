class ApiError extends Error {

    constructor(statusCode, message) {
        super(message);

        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message = "The request data is invalid.") {
        return new ApiError(400, message);
    }

    static unauthorized(message = "You must log in to access this resource.") {
        return new ApiError(401, message);
    }

    static forbidden(message = "You do not have permission to perform this action.") {
        return new ApiError(403, message);
    }

    static notFound(message = "The requested resource could not be found.") {
        return new ApiError(404, message);
    }

    static internal(message = "An unexpected error occurred. Please try again later.") {
        return new ApiError(500, message);
    }

    static conflict(message = "Conflict") {
        return new ApiError(409, message);
    }
}

export default ApiError;

// throw ApiError.badRequest("Email and password are required.");

// throw ApiError.unauthorized("Invalid email or password.");

// throw ApiError.forbidden("Only administrators can delete users.");

// throw ApiError.notFound("User with the provided ID does not exist.");

// throw ApiError.internal();