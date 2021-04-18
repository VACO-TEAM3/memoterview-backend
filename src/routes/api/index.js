const express = require("express");
const router = express.Router();

const loginRouter = require("../auth/login");
const projectsRouter = require("./projects");
const interviewerRouter = require("./interviewer");
const speechToTextRouter = require("./speechToText");
const authentication = require("../middlewares/authenticate");

router.use("/api/login", loginRouter);
router.use("/api/interviewer", authentication, interviewerRouter);
router.use("/api/projects", authentication, projectsRouter);
router.use("/api/speech-to-text", speechToTextRouter);

module.exports = router;
