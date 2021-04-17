const Joi = require("joi");

exports.validateLoginData = data => {
  const schema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    imageUrl: Joi.string().required(),
    name: Joi.string().required(),
  });

  return schema.validate({ ...data });
};

exports.validateNewProjectData = data => {
  const schema = Joi.object({
    title: Joi.string().required(),
    filters: Joi.array().required(),
    participants: Joi.array().required(),
    creator: Joi.string().required(),
  });

  return schema.validate({ ...data });
};
