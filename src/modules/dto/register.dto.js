import Joi from "joi";
import BaseDto from "../../common/dto/base.dto.js";

class RegisterDto extends BaseDto {
  static schema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),

    email: Joi.string().trim().max(300).required().lowercase(),

    password: Joi.string().trim().min(8).required().messages({
      "string.min": "Password must contain 8 char minimum",
    }),

    role: Joi.string().valid("player","developer").default("player"),

    phone: Joi.string().trim().allow(null),

    avatar: Joi.string().trim().allow(null),

    address: Joi.string().trim().max(100).allow(null),

    bio: Joi.string().trim().max(100).allow(null),
  });
}

export default RegisterDto;
