import ApiError from "../utils/api-error.js";

const validate = (DtoClass) => {
    return (req, res, next) => {
        const { error, value } = DtoClass.validate(req.body);

        if (error) {
            throw ApiError.badRequest(
                Array.isArray(error) ? error[0] : (error.details?.[0]?.message || "Validation failed")
            );
        }

        req.body = value;
        next();
    };
};

export default validate;