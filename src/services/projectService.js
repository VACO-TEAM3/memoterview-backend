const Project = require("../models/Project");
const Interviewer = require("../models/Interviewer");

exports.createProject = async ({ title, filters, creator, participants }) => {
  try {
    const newProject = await Project.create({
      title,
      filters,
      creator,
      participants,
    });

    return { newProject };
  } catch (error) {
    return { createProjectError: error };
  }
};

exports.addToMyProjects = async (creator, _id, session) => {
  try {
    const myProjects = await Interviewer.findByIdAndUpdate(
      creator,
      { $push: { "myProjects": _id } },
      { upsert: true, new: true }
    ).session(session);

    return { myProjects };
  } catch (error) {
    return { addToMyProjectsError: error };
  }
};

exports.addToJoinedProjects = async (participants, _id, session) => {
  try {
    const joinedProjects = participants.map((participantId) =>
      Interviewer.findByIdAndUpdate(
        participantId,
        { $push: { "joinedProjects": _id } },
        { upsert: true, new: true }
      ).session(session)
    );

    const joinedProjectResults = await Promise.all(joinedProjects);

    return { joinedProjectResults };
  } catch (error) {
    return { addToJoinedProjectsError: error };
  }
};

exports.getMyProjects = async (interviewerId) => {
  try {
    const { myProjects } = await Interviewer
      .findOne({ _id: interviewerId })
      .populate("myProjects")
      .lean();

    return { myProjects };
  } catch (error) {
    return { getMyProjectError: error };
  }
};
