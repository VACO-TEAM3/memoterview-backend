const Interviewee = require("../models/Interviewee");
const Project = require("../models/Project");

exports.createInterviewee = async ({ email, name, resumeUrl }) => {
  try {
    const newInterviewee = await Interviewee.create({
      email,
      name,
      resumePath: resumeUrl,
    }); // todo. session 넣기

    return newInterviewee;
  } catch (error) {
    return { error };
  }
};

exports.deleteInterviewees = async ({ intervieweeIds }, session) => {
  try {
    const deletedIntervieweesResult = await Interviewee.deleteMany({
      _id: {
        $in: intervieweeIds,
      },
    }).session(session);

    return { deletedIntervieweesResult };
  } catch (error) {
    return { error };
  }
};

exports.getInterviewee = async (intervieweeId) => {
  try {
    const interviewee = await Interviewee.findOne({ _id: intervieweeId });

    return { interviewee };
  } catch (error) {
    return { error };
  }
};

exports.getInterviewees = async (projectId) => {
  try {
    const { candidates } = await Project
      .findOne({ _id: projectId })
      .populate("candidates")
      .lean();

    return { candidates };
  } catch (error) {
    return { error };
  }
};

exports.updateInterviewee = async ({ intervieweeId, interviewee }) => {
  try {
    const intervieweeData = await Interviewee.findOne({ _id: intervieweeId });
    Object.keys(interviewee.filterScores).forEach((key) => {
      if (!intervieweeData.filterScores[key]) {
        intervieweeData.filterScores[key] = [];
      }

      intervieweeData.filterScores[key].push(interviewee.filterScores[key]);
    });

    const updatedInterviewee =  await Interviewee.findByIdAndUpdate(intervieweeId, {
      $push: {
        questions: { $each: interviewee.questions },
        comments: { $each: interviewee.comments },
      },
      $set: {
        filterScores: { ...intervieweeData.filterScores },
      },
    }, { new: true });
    
    return { intervieweeData: updatedInterviewee };
  } catch (error) {
    return { error };
  }
};
