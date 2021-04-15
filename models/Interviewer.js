const mongoose = require("mongoose");

const interviewerSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
  username: {
    type: String,
  },
  avatar: {
    type: String,
    required: true,
  },
  myProject: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    }],
    default: [],
  },
  joinedProject: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    }],
    default: [],
  },
});

module.exports = mongoose.model("Interviewer", interviewerSchema);
