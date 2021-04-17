const express = require("express");
const router = express.Router();
const { createProject } = require("../../services/projectService");

router.post("/", async (req, res, next) => {
  try {
    const project = req.body;

    const { newProject, createProjectError } = await createProject(project);

  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
