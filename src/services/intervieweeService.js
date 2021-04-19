const Interviewee = require("../models/Interviewee");

exports.deleteInterviewees = async ({ intervieweeIds }) => {
  try {
    const deletedIntervieweesResult = await Interviewee.deleteMany({
      _id: {
        $in: intervieweeIds,
      },
    });

    return { deletedIntervieweesResult };
  } catch (error) {
    return { error };
  }
};
