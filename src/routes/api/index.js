const express = require("express");
const router = express.Router();
const interviewerRouter = require("./interviewer");
const authentication = require("../middlewares/authenticate");

router.use(authentication);
router.use("/api/interviewer", interviewerRouter);

module.exports = router;
