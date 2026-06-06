import Joi from "joi";
import BaseDto from "../../common/dto/base.dto.js";

class JoinRoomDto extends BaseDto {
    static schema = Joi.object({
        roomCode: Joi.string().trim().uppercase().length(6).required(),
    });
}

export { JoinRoomDto };
