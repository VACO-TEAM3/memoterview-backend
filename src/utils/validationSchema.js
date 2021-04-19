const Joi = require("joi");

exports.loginBodySchema = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  imageUrl: Joi.string().required(),
  name: Joi.string().required(),
});

exports.projectBodySchema = Joi.object({
  title: Joi.string().required(),
  filters: Joi.array().required(),
  participants: Joi.array().required(),
  creator: Joi.string().required(),
});

exports.searchInterviewersQuerySchema = Joi.object({
  email: Joi.string().required(),
});
