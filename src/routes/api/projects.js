const express = require("express");
const { startSession } = require("mongoose");

const { createProjectBodySchema, projectIdParamsSchema } = require("../../utils/validationSchema");
const {
  createProject,
  addToMyProjects,
  addToJoinedProjects,
  deleteProjects,
} = require("../../services/projectService");
const validate = require("../middlewares/validate");

const router = express.Router();

router.post(
  "/",
  validate(createProjectBodySchema, "body"),
  async (req, res, next) => {
    const session = await startSession();

    try {
      session.startTransaction();
      const project = req.body;

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
  }
);

router.delete(
  "/:project_id",
  validate(projectIdParamsSchema, "params"),
  async (req, res, next) => {
    try {
      const { project_id: projectId } = req.params;

      const { deletedProject } = await deleteProjects(projectId);

      return res.json({
        result: "ok",
        data: deletedProject,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
