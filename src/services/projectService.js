const { startSession } = require("mongoose");
const Project = require("../models/Project");
const Interviewer = require("../models/Interviewer");

exports.getMyProjects = async (interviewerId) => {
  try {
    const interviewer = await Project.findOne({ id: interviewerId });

    return { interviewer };
  } catch (error) {
    return { error };
  }
};

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

exports.addProjectToRelevantInterviewer = async ({ creator, participants, _id }) => {
  const session = await startSession();

  try {
    session.startTransaction();

    // adding new project to myProjects field for relevant interviewer
    await Interviewer.findByIdAndUpdate(
      creator,
      { $push: { "myProjects": _id } },
      { upsert: true, new: true }
    ).session(session);

    const joinedProjectsResult = participants.map((participantId) =>
      Interviewer.findByIdAndUpdate(
        participantId,
        { $push: { "joinedProjects": _id } },
        { upsert: true, new: true }
      ).session(session)
    );

    const addJoinedProjectsFinalResult = await Promise.all(joinedProjectsResult);

    await session.commitTransaction();
    session.endSession();

    return { addJoinedProjectsFinalResult };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return { addProjectError: error };
  }
};
