const express = require("express");
const router = express.Router();
const { startSession } = require("mongoose");
const { validateNewProjectData } = require("../../utils/validation");
const {
  createProject,
  addToMyProjects,
  addToJoinedProjects,
} = require("../../services/projectService");

router.post("/", async (req, res, next) => {
  const session = await startSession();

  try {
    session.startTransaction();
    const project = req.body;
    const validationResult = validateNewProjectData(project);

    if (validationResult.error) {
      return res.status(400).json({
        result: "error",
        errMessage: "We can't login (or sign up) for unknown reasons",
      });
    }

    // TO-DO : Handling session for Model.Create()
    // TO-DO : Validate transaction through intentional mistakes
    const {
      newProject: {
        _id,
        creator,
        participants,
        title,
        filters,
        candidates,
        createdAt,
      },
      createProjectError,
    } = await createProject(project, session);

    await addToMyProjects(creator, _id, session);
    await addToJoinedProjects(participants, _id, session);

    await session.commitTransaction();
    session.endSession();

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
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
});

module.exports = router;
