const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    commentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interviewer",
    },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
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
    questioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interviewer",
    },
  },
  { _id: false }
);

const intervieweeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    interviewDate: {
      type: Date,
    },
    resumePath: {
      type: String,
    },
    filterScores: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    questions: [questionSchema],
    comments: [commentSchema],
    isInterviewed: {
      type: Boolean,
      default: false,
    },
    interviewDuration: {
      type: String,
      default: "0",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interviewee", intervieweeSchema);
