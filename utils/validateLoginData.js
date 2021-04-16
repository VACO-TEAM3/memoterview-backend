const Joi = require("joi");

function validateLoginData(data) {
  const schema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    imageUrl: Joi.string().required(),
    name: Joi.string().required(),
  });

  return schema.validate({ ...data });
}

module.exports.validateLoginData = validateLoginData;
