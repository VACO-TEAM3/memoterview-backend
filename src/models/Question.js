const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
  questioner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Interviewer",
  },
}, { _id: false });

module.exports = mongoose.model("Question", questionSchema);
