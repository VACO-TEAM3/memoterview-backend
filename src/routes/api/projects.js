const express = require("express");
const { startSession } = require("mongoose");
const multer = require("multer");
const util = require("util");
const fs = require("fs");
const nodemailer = require("nodemailer");
const { getAverageScore, getFilterAvgScors } = require("../../utils/getAverageScroe");

const {
  mailing: { gmail },
} = require("../../config");

const {
  createProjectBodySchema,
  projectIdParamsSchema,
  updateRoomStateBodySchema,
  sendInvitingEmailBodySchema,
  projectIntervieweeIdParamsSchema,
} = require("../../utils/validationSchema");
const {
  createProject,
  addToMyProjects,
  addToJoinedProjects,
  addCandidateToProject,
  deleteProjects,
  updateInterviewRoom,
  deleteCandidate,
} = require("../../services/projectService");
const validate = require("../middlewares/validate");
const {
  deleteProjectOnMyProjects,
  deleteProjectOnJoinedProjects,
} = require("../../services/interviewerService");
const {
  deleteInterviewees,
  getInterviewees,
  getInterviewee,
  createInterviewee,
  updateInterviewee,
  deleteInterviewee,
} = require("../../services/intervieweeService");
const { generateResumeUrl } = require("../../utils/generateResumeUrl");

const { uploadFileToS3 } = require("../../loaders/s3");
const mailConstant = require("../../config/inviteMailing");
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
  validate(updateRoomStateBodySchema, "body"),
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

router.get("/:project_id/interviewees", async (req, res, next) => {
  try {
    const projectId = req.params.project_id;

    const { candidates } = await getInterviewees(projectId);

    const intervieweeList = candidates.map((interviewee) => ({
      id: interviewee._id,
      name: interviewee.name,
      email: interviewee.email,
      interviewDate: interviewee.createdAt,
      filterScores: interviewee.filterScores,
      isInterviewed: interviewee.isInterviewed,
      questions: interviewee.questions,
      comments: interviewee.comments,
      interviewDuration: interviewee.interviewDuration,
      resumePath: interviewee.resumePath,
      commentAvgScore: getAverageScore(interviewee.comments),
      questionAvgScore: getAverageScore(interviewee.questions),
      filterAvgScores: getFilterAvgScors(interviewee.filterScores),
    }));

    return res.json({
      result: "ok",
      data: intervieweeList,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/:project_id/interviewees",
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
      const newInterviewee = await createInterviewee(
        { email, name, resumeUrl },
        session
      );

      await addCandidateToProject(projectId, newInterviewee._id, session);

      await session.commitTransaction();
      session.endSession();

      return res.json({
        result: "ok",
        data: {
          id: newInterviewee._id,
          name: newInterviewee.name,
          email: newInterviewee.email,
          interviewDate: newInterviewee.createdAt,
          filterScores: newInterviewee.filterScores,
          isInterviewed: newInterviewee.isInterviewed,
          question: newInterviewee.question,
          resumePath: newInterviewee.resumePath,
        },
      });
    } catch (error) {
      await session.abortTransaction();

      session.endSession();
    }
  }
);

router.get(
  //validation 필요
  "/:project_id/:interviewee_id",
  async (req, res, next) => {
    try {
      const intervieweeId = req.params.interviewee_id;
      const { interviewee } = await getInterviewee(intervieweeId);

      return res.json({
        url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${interviewee.resumePath}`,
      });
    } catch (error) {
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

router.patch(
  "/:project_id/interviewees/:interviewee_id", // need validation
  async (req, res, next) => {
    try {
      const { intervieweeId, interviewee } = req.body; // project Id 있음
      const {
        intervieweeData: {
          _id,
          email,
          name,
          resumePath,
          questions,
          comments,
          isInterviewed,
          filterScores,
        },
      } = await updateInterviewee({ intervieweeId, interviewee });

      return res.json({
        data: {
          id: _id,
          email,
          name,
          resumePath,
          questions,
          comments,
          isInterviewed,
          filterScores,
        },
        result: "ok",
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:project_id/interviewees/:interviewee_id/invite",
  validate(projectIntervieweeIdParamsSchema, "params"),
  validate(sendInvitingEmailBodySchema, "body"),
  async (req, res, next) => {
    const { userEmail, welcomePageLink } = req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail", //사용하고자 하는 서비스
      prot: 587,
      host: "smtp.gmlail.com",
      secure: false,
      requireTLS: true,
      auth: {
        user: gmail.user, //gmail주소입력
        pass: gmail.password, //gmail패스워드 입력
      },
    });

    const info = await transporter.sendMail({
      from: gmail.user, //보내는 주소 입력
      to: userEmail, //위에서 선언해준 받는사람 이메일
      subject: mailConstant.subject, //메일 제목
      text: mailConstant.makeInviteMailText(welcomePageLink), //내용
    });

    res.json({
      result: "ok",
      info,
      message: "Sent Email",
    });
  }
);

router.delete(
  "/:project_id/interviewees/:interviewee_id",
  validate(projectIntervieweeIdParamsSchema, "params"),
  async (req, res, next) => {
    const session = await startSession();

    try {
      session.startTransaction();
      const { project_id: projectId, interviewee_id: intervieweeId } = req.params;

      await deleteCandidate({ projectId, intervieweeId }, session);

      const { deletedInterviewee } = await deleteInterviewee({ intervieweeId }, session);

      await session.commitTransaction();

      session.endSession();

      return res.json({
        result: "ok",
        data: deletedInterviewee,
      });
    } catch (error) {
      await session.abortTransaction();

      session.endSession();
      next(error);
    }
  }
);

module.exports = router;
