const express = require("express");
const router = express.Router();
const { createProject, addToMyProjects, addToJoinedProjects } = require("../../services/projectService");

router.post("/", async (req, res, next) => {
  try {
    const project = req.body;

    const {
      newProject: { _id, creator, participants, title, filters, candidates, createdAt },
      createProjectError
    } = await createProject(project);

    const { myProjects, addToMyProjectsError } = await addToMyProjects(creator, _id);
    const { joinedProjectResults, error } = await addToJoinedProjects(participants, _id);

    return res.json({
      result: "ok",
      data: {
        id: _id,
        title,
        filters,
        creator,
        participants,
        createAt: createdAt,
        candidateNum: candidates.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
