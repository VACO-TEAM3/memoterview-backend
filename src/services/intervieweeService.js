const Interviewee = require("../models/Interviewee");

exports.deleteInterviewees = async ({ intervieweeIds }, session) => {
  try {
    const deletedIntervieweesResult = await Interviewee.deleteMany({
      _id: {
        $in: intervieweeIds,
      },
    }).session(session);

    return { deletedIntervieweesResult };
  } catch (error) {
    return { error };
  }
};
