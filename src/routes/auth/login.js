const express = require("express");
const router = express.Router();
const createError = require("http-errors");

const { validateLoginData } = require("../../utils/validation");
const { checkUser, createUser } = require("../../services/loginService");
const { signAccessToken } = require("../../utils/jwtHelpers");

router.post("/", async (req, res, next) => {
  try {
    const user = req.body;
    const validationResult = validateLoginData(user);

    if (validationResult.error) {
      return res.status(400).json({
        result: "error",
        errMessage: "We can't login (or sign up) for unknown reasons",
      });
    }

    const { email, imageUrl, name } = user;
    const { interviewer, checkUserError } = await checkUser(email);
    let newUser;

    if (checkUserError) {
      next(createError(500));
      return;
    }

    if (!interviewer) {
      const { newInterviewer, createUserError } = await createUser(email, imageUrl, name);

      if (createUserError) {
        next(createError(500));
        return;
      }

      newUser = newInterviewer;
    }

    const userInfo = newUser ? newUser.newInterviewer : interviewer;
    const accessToken = await signAccessToken(userInfo);

    return res.json({
      result: "ok",
      data: {
        user: {
          id: userInfo._id,
          email: userInfo.email,
          avatar: userInfo.avatar,
          username: userInfo.username,
          myProjects: userInfo.myProjects,
          joinedProjects: userInfo.joinedProjects,
        },
        token: accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
