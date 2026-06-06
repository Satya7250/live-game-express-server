import Joi from "joi";
import BaseDto from "../../common/dto/base.dto.js";

class SendMessageDto extends BaseDto {
    static schema = Joi.object({
        conversationId: Joi.string()
            .trim()
            .length(24)
            .hex()
            .required()
            .messages({
                "any.required": "Conversation ID is required",
                "string.length": "Invalid conversation ID",
                "string.hex": "Invalid conversation ID",
            }),

        content: Joi.string()
            .trim()
            .max(2000)
            .required()
            .messages({
                "any.required": "Message content is required",
                "string.empty": "Message content is required",
                "string.max": "Message cannot exceed 2000 characters",
            }),
    });
}

export { SendMessageDto };