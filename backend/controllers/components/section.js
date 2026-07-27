const sectionService = require("../../services/section.service");

exports.createSection = async (req, res) => {
  try {
    const result = await sectionService.createSection({
      sectionName: req.body.sectionName,
      courseId: req.body.courseId,
      instructorId: req.user.id,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const result = await sectionService.updateSection(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const result = await sectionService.deleteSection(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
