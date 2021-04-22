const express = require("express");
const router = express.Router();

const loginRouter = require("../auth/login");
const projectsRouter = require("./projects");
const interviewerRouter = require("./interviewer");
const authentication = require("../middlewares/authenticate");

router.use("/api/login", loginRouter);
router.use("/api/interviewers", authentication, interviewerRouter);
router.use("/api/projects", authentication, projectsRouter);

module.exports = router;
