import Joi from "joi";
import BaseDto from "../../common/dto/base.dto.js";

class DeleteAccountDto extends BaseDto {
  static schema = Joi.object({
    password: Joi.string()
      .required()
      .messages({
        "any.required": "Password is required to delete account",
      }),
  });
}

export default DeleteAccountDto;
