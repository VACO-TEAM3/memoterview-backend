const Question = require("../models/Question");

exports.getQuestions = async ({ category }) => {
  try {
    const categorizedQuestions = await Question.find({ category });

    return categorizedQuestions;
  } catch (error) {
    return { getQuestionError: error };
  }
};
