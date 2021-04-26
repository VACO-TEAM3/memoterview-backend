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

exports.searchInterviewersQuerySchema = Joi.object({
  email: Joi.string().required(),
});

exports.userIdParamsSchema = Joi.object({
  user_id: Joi.string().required(),
});

exports.intervieweeQuestionSchema = Joi.object({
  intervieweeId: Joi.string().required(),
  question: {
    title: Joi.string().allow(""),
    answer: Joi.string().allow(""),
    questioner: Joi.string().required(),
    score: Joi.number().required(),
  },
});

exports.sendInvitingEmailBodySchema = Joi.object({
  userEmail: Joi.string().email().required(),
  welcomePageLink: Joi.string().required(),
});

exports.intervieweeIdParamsSchema = Joi.object({
  interviewee_id: Joi.string().required(),
});

exports.projectIntervieweeIdParamsSchema = Joi.object({
  project_id: Joi.string().required(),
  interviewee_id: Joi.string().required(),
});

exports.updateInterviewRoomBodySchema = Joi.object({
  isRoomOpened: Joi.boolean().required(),
});
