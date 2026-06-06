import Joi from "joi";
import BaseDto from "../../common/dto/base.dto.js";

class CreateRoomDto extends BaseDto {
    static schema = Joi.object({
        name: Joi.string()
            .trim()
            .min(1)
            .max(50)
            .required(),
        gameType: Joi.string()
            .valid("tic-tac-toe", "rock-paper-scissors")
            .required(),
        maxPlayers: Joi.number()
            .integer()
            .min(2)
            .max(10)
            .required(),
    });
}

export { CreateRoomDto };