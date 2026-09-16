const courseProgressService = require("../../services/courseProgress.service");

const errorStatus = (error) => error.statusCode || 500;

exports.updateCourseProgress = async (req, res) => {
  try {
    const result = await courseProgressService.updateCourseProgress({
      courseId: req.body.courseId,
      subsectionId: req.body.subsectionId,
      userId: req.user.id,
    });

    if (result.alreadyCompleted) {
      return res.status(200).json({
        success: true,
        message: "Already completed",
        data: result.completedSubSections,
        isCompletedAll: false,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Progress updated",
      data: result.completedSubSections,
      isCompletedAll: result.isCompletedAll,
    });
  } catch (error) {
    console.error("UPDATE_PROGRESS_ERROR:", error);
    return res.status(errorStatus(error)).json({
      success: false,
      message: error.statusCode ? error.message : "Server error",
    });
  }
};

exports.getProgressPercentage = async (req, res) => {
  try {
    const result = await courseProgressService.getProgressPercentage({
      courseId: req.body.courseId,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("GET_PROGRESS_ERROR:", error);
    return res.status(errorStatus(error)).json({
      success: false,
      message: error.statusCode ? error.message : "Internal server error",
    });
  }
};
