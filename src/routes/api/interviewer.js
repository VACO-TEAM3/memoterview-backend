const express = require("express");
const router = express.Router();

const { getMyProjects, getJoinedProjects } = require("../../services/projectService");

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

  } catch (error) {
    next(error);
  }
});

module.exports = router;
