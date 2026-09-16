const submissionService = require("../../services/submission.service");

const getErrorStatus = (error) => error.statusCode || 500;

exports.submitAssignment = async (req, res) => {
  try {
    const submission = await submissionService.submitAssignment({
      ...req.body,
      studentId: req.user.id,
      submissionFile: req.files?.submissionFile,
    });

    return res.status(200).json({
      success: true,
      message: "Assignment submitted successfully!",
      data: submission,
      progressUpdated: true,
    });
  } catch (error) {
    console.error("SUBMIT ASSIGNMENT ERROR:", error);
    return res.status(getErrorStatus(error)).json({
      success: false,
      message:
        error.statusCode === 400
          ? error.message
          : "System error while submitting assignment",
      error: error.message,
    });
  }
};

exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const submissions = await submissionService.getAssignmentSubmissions(
      req.params.assignmentId
    );

    return res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error("GET SUBMISSIONS ERROR:", error);
    return res.status(getErrorStatus(error)).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to fetch submissions",
      error: error.message,
    });
  }
};

exports.gradeAssignment = async (req, res) => {
  try {
    const updatedSubmission = await submissionService.gradeAssignment(req.body);

    return res.status(200).json({
      success: true,
      message: "Assignment graded successfully",
      data: updatedSubmission,
    });
  } catch (error) {
    console.error("GRADE ASSIGNMENT ERROR:", error);
    return res.status(getErrorStatus(error)).json({
      success: false,
      message: error.statusCode ? error.message : "Error while grading assignment",
      error: error.message,
    });
  }
};

exports.deleteSubmission = async (req, res) => {
  try {
    await submissionService.deleteSubmission({
      assignmentId: req.body.assignmentId,
      studentId: req.user.id,
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("DELETE SUBMISSION ERROR:", error);
    return res.status(getErrorStatus(error)).json({
      success: false,
      message: error.message,
    });
  }
};

exports.checkStudentSubmission = async (req, res) => {
  try {
    const submission = await submissionService.checkStudentSubmission({
      assignmentId: req.params.assignmentId,
      studentId: req.user.id,
    });

    return res.json({ success: true, data: submission });
  } catch (error) {
    console.error("CHECK SUBMISSION ERROR:", error);
    return res.status(getErrorStatus(error)).json({
      success: false,
      message: error.message,
    });
  }
};
