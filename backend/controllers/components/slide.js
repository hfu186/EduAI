const slideService = require("../../services/slide.service");

exports.uploadSlide = async (req, res) => {
  try {
    const { subSectionId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "PDF file is required",
      });
    }

    const updatedSubSection = await slideService.uploadSlide(
      subSectionId,
      req.file
    );

    res.status(200).json({
      success: true,
      message: "Slide uploaded successfully",
      data: updatedSubSection,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
