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

exports.deleteInterviewee = async ({ intervieweeId }, session) => {
  try {
    const deletedInterviewee = await Interviewee.findByIdAndDelete(intervieweeId)
      .session(session);

    return { deletedInterviewee };
  } catch (error) {
    return { error };
  }
};

exports.getInterviewee = async (intervieweeId) => {
  try {
    const interviewee = await Interviewee.findOne({ _id: intervieweeId }).lean();

    return { interviewee };
  } catch (error) {
    return { error };
  }
};

exports.getInterviewees = async (projectId) => {
  try {
    const { candidates } = await Project
      .findOne({ _id: projectId })
      .populate({
        path: "candidates",
        populate: {
          path: "comments",
          populate: {
            path: "commenter",
          },
        },
      });

    return { candidates };
  } catch (error) {
    return { error };
  }
};

exports.updateInterviewee = async ({ intervieweeId, interviewee }) => {
  try {
    const intervieweeData = await Interviewee.findOne({
      _id: intervieweeId,
    }).lean();

    Object.keys(interviewee.filterScores).forEach((key) => {
      if (!intervieweeData.filterScores[key]) {
        intervieweeData.filterScores[key] = [];
      }

      intervieweeData.filterScores[key].push(interviewee.filterScores[key]);
    });

    const updatedInterviewee = await Interviewee.findByIdAndUpdate(
      intervieweeId,
      {
        $set: {
          filterScores: { ...intervieweeData.filterScores },
        },
        $push: {
          comments: interviewee.comments,
        },
      },
      { new: true }
    );
    return { intervieweeData: updatedInterviewee };
  } catch (error) {
    return { error };
  }
};

exports.updateIntervieweeQuestion = async ({ intervieweeId, question }) => {
  try {
    await Interviewee.findByIdAndUpdate(
      intervieweeId,
      {
        $push: {
          questions: question,
        },
      }
    );
  } catch (error) {
    return { error };
  }
};

exports.updateInterviewRoom = async ({ intervieweeId, isRoomOpened }) => {
  try {
    const interviewee = await Interviewee.findByIdAndUpdate(
      intervieweeId,
      { isRoomOpened },
      { new: true }
    );

    return { interviewee };
  } catch (error) {
    return { updateInterviewRoom: error };
  }
};
