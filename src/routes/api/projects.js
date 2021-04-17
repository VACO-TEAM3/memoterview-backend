const express = require("express");
const router = express.Router();
const { createProject, addToMyProjects } = require("../../services/projectService");

router.post("/", async (req, res, next) => {
  try {
    const project = req.body;

    const { newProject: { _id, creator }, createProjectError } = await createProject(project);
    const { myProjects, error } = await addToMyProjects(creator, _id);

  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
