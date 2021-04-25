const express = require("express");

const router = express.Router();

const { updateIntervieweeQuestion } = require("../../services/intervieweeService");

router.patch(
  "/:interviewee_id/answer",
  async (req, res, next) => {
    try {
      const { intervieweeId, question } = req.body;

      await updateIntervieweeQuestion({ intervieweeId, question });

      return res.json({ result: "ok" });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
