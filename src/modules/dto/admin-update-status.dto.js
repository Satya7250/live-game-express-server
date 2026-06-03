import Joi from "joi";
import BaseDto from "../../common/dto/base.dto.js";

class AdminUpdateStatusDto extends BaseDto {
    static schema = Joi.object({
        isActive: Joi.boolean().required(),
    });
}

export default AdminUpdateStatusDto;