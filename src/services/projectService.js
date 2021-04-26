const Project = require("../models/Project");
const Interviewer = require("../models/Interviewer");

exports.createProject = async ({ title, filters, creator, participants }) => {
  try {
    const newProject = await Project.create({
      title,
      filters,
      creator,
      participants,
    }); // todo. session 넣기

    return { newProject };
  } catch (error) {
    return { createProjectError: error };
  }
};

exports.addToMyProjects = async (creator, _id, session) => {
  try {
    const myProjects = await Interviewer.findByIdAndUpdate(
      creator,
      { $push: { myProjects: _id } },
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
        { $push: { joinedProjects: _id } },
        { upsert: true, new: true }
      ).session(session)
    );

    const joinedProjectResults = await Promise.all(joinedProjects);

    return { joinedProjectResults };
  } catch (error) {
    return { addToJoinedProjectsError: error };
  }
};

exports.addCandidateToProject = async (projectId, _id, session) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $push: { candidates: _id } },
      { upsert: true, new: true }
    ).session(session);

    return { updatedProject };
  } catch (error) {
    return { addToCandidatesError: error };
  }
};

exports.getMyProjects = async (interviewerId) => {
  try {
    const { myProjects } = await Interviewer.findOne({ _id: interviewerId })
      .populate("myProjects")
      .lean();

    return { myProjects };
  } catch (error) {
    return { getMyProjectError: error };
  }
};

exports.getJoinedProjects = async (interviewerId) => {
  try {
    const { joinedProjects } = await Interviewer.findOne({ _id: interviewerId })
      .populate("joinedProjects")
      .lean();

    return { joinedProjects };
  } catch (error) {
    return { getJoinedProjectsError: error };
  }
};

exports.deleteProjects = async (projectId, session) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(projectId)
      .session(session);

    return { deletedProject };
  } catch (error) {
    return { deleteProjectsError: error };
  }
};

exports.deleteCandidate = async ({ projectId, intervieweeId }, session) => {
  try {
    const deletedCandidates = await Project.findByIdAndUpdate(
      projectId,
      { $pull: { candidates: intervieweeId } }
    ).session(session);

    return { deletedCandidates };
  } catch (error) {
    return { error };
  }
};
