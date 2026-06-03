import Joi from "joi";
import BaseDto from "../../common/dto/base.dto.js";

class AdminUpdateUserDto extends BaseDto {
    static schema = Joi.object({
        name: Joi.string().trim().min(2).max(50),
        phone: Joi.string().trim().allow(null),
        avatar: Joi.string().trim().allow(null),
        address: Joi.string().trim().max(100).allow(null),
        bio: Joi.string().trim().max(100).allow(null),
    });
}

export default AdminUpdateUserDto;