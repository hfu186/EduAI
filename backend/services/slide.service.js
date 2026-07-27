const SubSection = require("../models/subSection");

exports.uploadSlide = async (subSectionId, file) => {
  const subSection = await SubSection.findById(subSectionId);
  if (!subSection) {
    throw new Error("SubSection not found");
  }

  if (subSection.type !== "slide") {
    throw new Error("This SubSection is not a slide type");
  }

  subSection.slides.push({
    fileName: file.originalname,
    fileUrl: `/uploads/slides/${file.filename}`,
  });

  await subSection.save();
  return subSection;
};
