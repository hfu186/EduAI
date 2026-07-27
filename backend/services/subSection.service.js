const Section = require("../models/section");
const SubSection = require("../models/subSection");

exports.createSubSection = async ({
  sectionId,
  title,
  description,
  timeDuration,
}) => {
  if (!sectionId || !title) {
    throw new Error("sectionId and title are required");
  }

  const newSubSection = await SubSection.create({
    title,
    description,
    timeDuration,
    section: sectionId,
  });

  await Section.findByIdAndUpdate(sectionId, {
    $push: { subSection: newSubSection._id },
  });

  return Section.findById(sectionId).populate("subSection");
};
