const Highlight = require("../../models/highlight"); 

exports.getHighlights = async (req, res) => {
  try {
    const { subSectionId } = req.params;
    const highlights = await Highlight.find({
      user: req.user.id,
      subSection: subSectionId,
    });
    return res.status(200).json({ success: true, data: highlights });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createHighlight = async (req, res) => {
  try {
    const { subSectionId, pdfUrl, text, pages } = req.body;
    const highlight = await Highlight.create({
      user: req.user.id,
      subSection: subSectionId,
      pdfUrl,
      text,
      pages,
    });
    return res.status(200).json({ success: true, data: highlight });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteHighlight = async (req, res) => {
  try {
    const { highlightId } = req.params;
    await Highlight.deleteOne({ _id: highlightId, user: req.user.id });
    return res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearHighlights = async (req, res) => {
  try {
    const { subSectionId } = req.params;
    await Highlight.deleteMany({ user: req.user.id, subSection: subSectionId });
    return res.status(200).json({ success: true, message: "Cleared" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};