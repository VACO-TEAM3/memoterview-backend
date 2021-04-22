const Joi = require("joi");

exports.loginBodySchema = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  imageUrl: Joi.string().required(),
  name: Joi.string().required(),
});

exports.createProjectBodySchema = Joi.object({
  title: Joi.string().required(),
  filters: Joi.array().required(),
  participants: Joi.array().required(),
  creator: Joi.string().required(),
});

exports.projectIdParamsSchema = Joi.object({
  project_id: Joi.string().required(),
});

exports.updateRoomStateBodySchema = Joi.object({
  roomState: Joi.boolean().required(),
  projectId: Joi.string().required(),
});

exports.searchInterviewersQuerySchema = Joi.object({
  email: Joi.string().required(),
});

exports.userIdParamsSchema = Joi.object({
  user_id: Joi.string().required(),
});
