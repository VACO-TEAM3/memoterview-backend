const express = require("express");
const createError = require("http-errors");
const { searchByEmail } = require("../../services/interviewerService");

const { getMyProjects, getJoinedProjects } = require("../../services/projectService");
const { validateGetInterviewersQuery } = require("../../utils/validation");

const router = express.Router();

router.get("/:id/my_projects", async (req, res, next) => {
  try {
    const interviewerId = req.user._id;
    const { myProjects } = await getMyProjects(interviewerId);

    const myProjectsFormat = myProjects.map(myProject => ({
      id: myProject._id,
      title: myProject.title,
      filters: myProject.filters,
      participants: myProject.participants,
      creator: myProject.creator,
      candidateNum: myProject.candidates.length,
      createAt: myProject.createdAt,
    }));

    return res.json({
      result: "ok",
      data: myProjectsFormat,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id/joined_projects", async (req, res, next) => {
  try {
    const interviewerId = req.user._id;
    const { joinedProjects } = await getJoinedProjects(interviewerId);

    const joinedProjectFormat = joinedProjects.map(joinedProject => ({
      id: joinedProject._id,
      title: joinedProject.title,
      filters: joinedProject.filters,
      participants: joinedProject.participants,
      creator: joinedProject.creator,
      candidateNum: joinedProject.candidates.length,
      createAt: joinedProject.createdAt,
    }));

    return res.json({
      result: "ok",
      data: joinedProjectFormat,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/search", async (req, res, next) => {
  try {
    const validationResult = validateGetInterviewersQuery(req.query);

    if (validationResult.error) {
      return next(createError(400));
    }

    const { emailSearchList } = await searchByEmail(req.query.email);

    const refinedEmailSearchList = emailSearchList.map((searchItem) => ({
      id: searchItem._id,
      name: searchItem.username,
      email: searchItem.email,
    }));

    return res.json({
      result: "ok",
      data: refinedEmailSearchList,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
