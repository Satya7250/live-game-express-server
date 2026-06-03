import Joi from "joi";

class BaseDto {
    static schema = Joi.object({});

    static validate(data) {
        const { error, value } = this.schema.validate(data, {
            abortEarly: false, //Shows all validation errors at once
            stripUnknown: true, //Keeps only the fields you explicitly allow
        });

        if (error) {
            const errors = error.details.map((d) => d.message);
            return { error: errors, value: null };
        }

        return { error: null, value };
    }
}

export default BaseDto;