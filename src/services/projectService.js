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

exports.addToMyProjects = async (creator, _id) => {
  try {
    const myProjects = await Interviewer.findByIdAndUpdate(
      creator,
      { $push: { "myProjects": _id } },
      { upsert: true, new: true }
    );

    return { myProjects };
  } catch (error) {
    return { addMyProjectsError: error };
  }
};
