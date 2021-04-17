const express = require("express");
const router = express.Router();

const { createProject, addProjectToRelevantInterviewer } = require("../../services/projectService");

router.post("/", async (req, res, next) => {
  try {
    const project = req.body;

    const { newProject, createProjectError } = await createProject(project);
    const { addJoinedProjectsFinalResult, addProjectError } = await addProjectToRelevantInterviewer(newProject);

    if (createProjectError || addProjectError ) {
      next(createProjectError || addProjectError);
      return;
    }

    return res.json({
      result: "ok",
      data: {
        id: newProject._id,
        title: newProject.title,
        filters: newProject.filters,
        creator: newProject.creator,
        participants: newProject.participants,
        candidateNum: 0,
        createAt: newProject.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
