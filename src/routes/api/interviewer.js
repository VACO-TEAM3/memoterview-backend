const express = require("express");
const router = express.Router();

const Project = require("../../models/Project");

router.get("/:id/my_projects", async (req, res, next) => {
  try {
    // console below is for checking authenticate router to proceed next task on 17th Apr
    console.log(req.user, "user in myproject");
    const interviewerId = req.user._id;

  } catch (error) {
    next(error);
  }
});

module.exports = router;
