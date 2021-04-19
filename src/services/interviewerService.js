const Interviewer = require("../models/Interviewer");

exports.searchByEmail = async (email) => {
  try {
    const query =
      email.indexOf("@") !== -1
        ? new RegExp(`${email}`, "i")
        : new RegExp(`.*${email}.*@.*`, "i");

    const emailSearchList = await Interviewer.find({ email: query })
      .sort({ username: -1 })
      .limit(5)
      .lean();

    return { emailSearchList };
  } catch (error) {
    return { error };
  }
};

exports.deleteProjectOnMyProjectList = async ({ userId, projectId }) => {
  try {
    const myProjects = await Interviewer.findByIdAndUpdate(
      userId,
      { $pull: { myProjects: projectId } },
      { safe: true, upsert: true }
    );

    return { myProjects };
  } catch (error) {
    return { error };
  }
};
