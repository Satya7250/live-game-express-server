import Joi from "joi";
import BaseDto from "../../common/dto/base.dto.js";

class CreateConversationDto extends BaseDto {
    static schema = Joi.object({
        participantId: Joi.string()
            .trim()
            .length(24)
            .hex()
            .required()
            .messages({
                "any.required": "Participant ID is required",
                "string.length": "Invalid participant ID",
                "string.hex": "Invalid participant ID",
            })
    });
}

export { CreateConversationDto };
