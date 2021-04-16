const express = require("express");
const router = express.Router();

router.get("/:id/my_projects", async (req, res, next) => {
  try {
    // console below is for checking authenticate router to proceed next task on 17th Apr
    console.log(req.user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
