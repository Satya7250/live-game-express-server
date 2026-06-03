import Joi from "joi";
import BaseDto from "../../common/dto/base.dto.js";

class ResetPasswordDto extends BaseDto {
    static schema = Joi.object({
        password: Joi.string().trim().min(8).required().messages({
            "string.min": "Password must contain 8 char minimum",
        }),
    });
}

export default ResetPasswordDto;