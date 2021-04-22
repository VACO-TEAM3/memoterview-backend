const Interviewee = require("../models/Interviewee");
const Project = require("../models/Project");

exports.createInterviewee = async ({ email, name, key }) => {
  try {
    const { _id } = await Interviewee.create({
      email,
      name,
      resumePath: key,
    }); // todo. session 넣기

    return { _id };
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
