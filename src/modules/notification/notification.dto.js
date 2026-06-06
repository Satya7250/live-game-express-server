import Joi from "joi";
import BaseDto from "../../common/dto/base.dto.js";
import { NOTIFICATION_TYPES } from "./notification.constants.js";

class CreateNotificationDto extends BaseDto {
    static schema = Joi.object({
        recipient: Joi.string().required(),
        type: Joi.string().valid(...Object.values(NOTIFICATION_TYPES)).required(),
        title: Joi.string().trim().required(),
        message: Joi.string().trim().required(),
        data: Joi.object().optional(),
    });
}

export { CreateNotificationDto };
