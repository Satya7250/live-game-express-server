import Joi from "joi";
import BaseDto from "../../common/dto/base.dto.js";

class PasswordChangeDto extends BaseDto {
  static schema = Joi.object({
    oldPassword: Joi.string()
      .required()
      .messages({
        "any.required": "Old password is required",
      }),
    newPassword: Joi.string()
      .required()
      .min(8)
      .max(100)
      .messages({
        "any.required": "New password is required",
        "string.min": "New password must contain 8 char minimum",
        "string.max": "New password must contain at most 100 characters",
      }),
  });
}

export default PasswordChangeDto;
