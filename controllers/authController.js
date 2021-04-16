const Interviewer = require("../models/Interviewer");
const { signAccessToken } = require("../utils/jwtHelpers");
const { validateLoginData } = require("../utils/validateLoginData");

exports.getLogin = async function (req, res, next) {
  try {
    const user = req.body;

    const { value, error } = validateLoginData(user);

    if (error) {
      return res.status(400).json({
        "result": "error",
        "errMessage": "We can't login (or sign up) for unknown reasons",
      });
    }

    const { email, imageUrl, name } = user;
    const interviewer = await Interviewer.findOne({ email });
    let accessToken;

    if (!interviewer) {
      const newInterviewer = await Interviewer.create({
        email,
        avatar: imageUrl,
        username: name,
      });

      accessToken = await signAccessToken(newInterviewer);
      return res.json({
        "result": "ok",
        "data": {
          "user": {
            "email": newInterviewer.email,
            "avatar": newInterviewer.avatar,
            "username": newInterviewer.username,
            "myProjects": newInterviewer.myProjects,
            "joinedProjects": newInterviewer.joinedProjects,
          },
          "token": accessToken,
        },
      });
    }

    accessToken = await signAccessToken(interviewer);
    return res.json({
      "result": "ok",
      "data": {
        "user": {
          "email": interviewer.email,
          "avatar": interviewer.avatar,
          "username": interviewer.username,
          "myProjects": interviewer.myProjects,
          "joinedProjects": interviewer.joinedProjects,
        },
        "token": accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};
