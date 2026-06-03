import Joi from "joi";
import BaseDto from "../../common/dto/base.dto.js";

class AdminUpdateRoleDto extends BaseDto {
    static schema = Joi.object({
        role: Joi.string().valid("customer", "seller", "admin").required(),
    });
}

export default AdminUpdateRoleDto;