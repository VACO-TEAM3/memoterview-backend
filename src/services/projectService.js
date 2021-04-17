const Project = require("../models/Project");

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
