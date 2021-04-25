const express = require("express");
const router = express.Router();

const loginRouter = require("../auth/login");
const projectsRouter = require("./projects");
const interviewerRouter = require("./interviewer");
const intervieweeRouter = require("./interviewee");

const authentication = require("../middlewares/authenticate");

router.use("/api/login", loginRouter);
router.use("/api/interviewers", authentication, interviewerRouter);
router.use("/api/projects", authentication, projectsRouter);
router.use("/api/interviewees", authentication, intervieweeRouter);

module.exports = router;
