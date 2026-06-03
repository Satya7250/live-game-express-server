import Joi from "joi";
import BaseDto from "../../common/dto/base.dto.js";

class SendFriendRequestDto extends BaseDto {
    static schema = Joi.object({
        receiverId: Joi.string()
            .trim()
            .length(24)
            .hex()
            .required(),
    });
}

export { SendFriendRequestDto };