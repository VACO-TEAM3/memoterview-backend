const express = require("express");

const router = express.Router();

const { getQuestions } = require("../../services/questionService");

router.get(
  "/",
  async (req, res, next) => {
    try {
      const { category } = req.body;
      const questions = await getQuestions({ category });

      return res.json({ questions });
      return { categorizedQuestions };
    } catch (error) {
      next(error);
    }
  }
);
module.exports = router;
