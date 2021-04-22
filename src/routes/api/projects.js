const express = require("express");
const { startSession } = require("mongoose");

const multer = require("multer");
const util = require("util");
const fs = require("fs");

const { createProjectBodySchema, projectIdParamsSchema } = require("../../utils/validationSchema");
const {
  createProject,
  addToMyProjects,
  addToJoinedProjects,
  addCandidateToProject,
  deleteProjects,
  updateInterviewRoom,
} = require("../../services/projectService");
const validate = require("../middlewares/validate");
const { deleteProjectOnMyProjects, deleteProjectOnJoinedProjects } = require("../../services/interviewerService");
const { deleteInterviewees, getInterviewees, createInterviewee } = require("../../services/intervieweeService");
const { generateResumeUrl } = require("../../utils/generateResumeUrl");

const { uploadFileToS3 } = require("../../loaders/s3");
const upload = multer({ dest: "uploads/" });

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
          isOpened,
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
          isOpened,
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

router.patch(
  "/:project_id", // need validation
  async (req, res, next) => {
    try {
      const { projectId, roomState } = req.body;
      const { 
        project: {
          _id,
          creator,
          participants,
          title,
          filters,
          isOpened,
          candidates,
          createdAt,
        },
      } = await updateInterviewRoom(projectId, roomState);
      console.log(isOpened);
      return res.json({
        result: "ok",
        data: {
          id: _id,
          title,
          filters,
          creator,
          isOpened,
          participants,
          createAt: createdAt,
          candidateNum: candidates.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:project_id/interviewees",
  async (req, res, next) => {
    try {
      const projectId = req.params.project_id;
      console.log(projectId);
      const { candidates } = await getInterviewees(projectId);
      const intervieweeList = candidates.map((interviewee) => ({
        id: interviewee._id,
        name: interviewee.name,
        email: interviewee.email,
        interviewDate: interviewee.createdAt,
        filterScores: interviewee.filterScores,
        isInterviewed: interviewee.isInterviewed,
        question: interviewee.question,
        resumePath: interviewee.resumePath,
      }));

      return res.json({
        result: "ok",
        data: intervieweeList,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:project_id/interviewee",
  validate(projectIdParamsSchema, "params"),
  // TO-DO: validation form data
  upload.single("pdf"),
  async (req, res, next) => {
    const session = await startSession();

    try {
      session.startTransaction();
      const { project_id: projectId } = req.params;
      const { name, email } = req.body;
      const file = req.file;

      const { key } = await uploadFileToS3(file);
      const resumeUrl = generateResumeUrl(key);
      const unlinkFile = util.promisify(fs.unlink);

      await unlinkFile(file.path);

      // TO-DO : Handling session for Model.Create()
      // TO-DO : Validate transaction through intentional mistakes
      const newInterviewee = await createInterviewee({ email, name, resumeUrl }, session);

      await addCandidateToProject(projectId, newInterviewee._id, session);

      await session.commitTransaction();
      session.endSession();

      return res.json({
        result: "ok",
        data: newInterviewee,
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
    const session = await startSession();

    try {
      session.startTransaction();
      const { project_id: projectId } = req.params;

      const { deletedProject } = await deleteProjects(projectId, session);

      const { creator, participants, candidates } = deletedProject;

      await deleteProjectOnMyProjects({ creator, projectId }, session);

      await deleteProjectOnJoinedProjects({ participants, projectId }, session);

      await deleteInterviewees({ intervieweeIds: candidates }, session);

      await session.commitTransaction();
      session.endSession();

      return res.json({
        result: "ok",
        data: deletedProject,
      });
    } catch (error) {
      await session.abortTransaction();

      session.endSession();
      next(error);
    }
  }
);

module.exports = router;
