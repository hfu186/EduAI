import Course from "../../models/course.js"
import Category from "../../models/category.js"
import Section from "../../models/section.js"
import SubSection from "../../models/subSection.js"
import User from "../../models/user.js"
import CourseProgress from "../../models/courseProgress.js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.user.id

    const courses = await Course.find({ instructor: instructorId })
      .populate("category")
      .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      data: courses,
    })
  } catch (error) {
    console.error("GET INSTRUCTOR COURSES ERROR:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to fetch instructor courses",
    })
  }
}


export const createCourse = async (req, res) => {
  try {
    const {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      category,
      status = "Draft",
      tag,
      instructions,
    } = req.body;

    const thumbnail = req.files?.thumbnailImage;

    if (!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    let imageBuffer;
    if (thumbnail.tempFilePath) {
      imageBuffer = fs.readFileSync(thumbnail.tempFilePath);
    } else {
      imageBuffer = thumbnail.data;
    }

    const base64Thumbnail = `data:${thumbnail.mimetype};base64,${imageBuffer.toString('base64')}`;
    const parsedTag = typeof tag === "string" ? JSON.parse(tag) : tag;
    const parsedInstructions = typeof instructions === "string" ? JSON.parse(instructions) : instructions;

    const instructorId = req.user.id;

    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorId,
      whatYouWillLearn,
      price,
      category: categoryDetails._id,
      tag: parsedTag,
      instructions: parsedInstructions,
      thumbnail: base64Thumbnail,
      status,
    });

    await User.findByIdAndUpdate(
      { _id: instructorId },
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    await Category.findByIdAndUpdate(
      { _id: category },
      { $push: { courses: newCourse._id } },
      { new: true }
    );


    if (thumbnail.tempFilePath) {
      fs.unlink(thumbnail.tempFilePath, (err) => {
        if (err) console.error("Lỗi xóa file thumbnail tạm:", err);
      });
    }
    // ===================================================

    return res.status(200).json({
      success: true,
      message: "Course Created Successfully",
      data: newCourse,
    });

  } catch (error) {
    console.error("CREATE COURSE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    });
  }
};
/* ================= EDIT COURSE DETAILS ================= */
export const editCourse = async (req, res) => {
  try {
    const { courseId } = req.body; 
    const updates = req.body;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (req.files && req.files.thumbnailImage) {
      const thumbnail = req.files.thumbnailImage;

      let imageBuffer;
      if (thumbnail.tempFilePath) {
        imageBuffer = fs.readFileSync(thumbnail.tempFilePath);
      } else {
        imageBuffer = thumbnail.data;
      }
      const base64Thumbnail = `data:${thumbnail.mimetype};base64,${imageBuffer.toString('base64')}`;

      course.thumbnail = base64Thumbnail;
    }

    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "tag" || key === "instructions") {
          course[key] = JSON.parse(updates[key]);
        } else if (key !== "thumbnailImage" && key !== "courseId") {
          course[key] = updates[key];
        }
      }
    }

    await course.save();

    const updatedCourse = await Course.findOne({ _id: courseId })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate({
        path: "ratingAndReviews",
        populate: {
          path: "user",
          select: "firstName lastName email image"
        }
      }).populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find({status: "Published"}) 
      .populate({
        path: "instructor",
        select: "firstName lastName email image", 
      })
      .populate({
        path: "courseContent",
        populate: { path: "subSection" },
      })
      .populate("ratingAndReviews")
      .populate("category")
      .sort({ createdAt: -1 })
      .exec()


    return res.status(200).json({
      success: true,
      data: allCourses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params

    const courseDetails = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: { path: "additionalDetails" },
      })
      .populate("category")
      .populate({
        path: "ratingAndReviews",
        populate: {
          path: "user",
          select: "firstName lastName email image"
        }
      }).populate({
        path: "courseContent",
        populate: { path: "subSection" },
      })

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    return res.status(200).json({
      success: true,
      data: { courseDetails },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const getCourseLearningData = async (req, res) => {
  const { courseId } = req.params

  const course = await Course.findById(courseId).select(
    "lectures quizzes assignments slides"
  )

  if (!course) {
    return res.status(404).json({ success: false })
  }

  return res.json({
    success: true,
    data: course,
  })
}

export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    await User.findByIdAndUpdate(course.instructor, {
      $pull: { courses: courseId },
    })

    await Category.findByIdAndUpdate(course.category, {
      $pull: { courses: courseId },
    })

    for (const studentId of course.studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      })
    }

    for (const sectionId of course.courseContent) {
      const section = await Section.findById(sectionId)
      if (section) {
        for (const subId of section.subSection) {
          await SubSection.findByIdAndDelete(subId)
        }
      }
      await Section.findByIdAndDelete(sectionId)
    }

    await Course.findByIdAndDelete(courseId)

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params
    const updates = req.body

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    if (req.files && req.files.thumbnailImage) {
      const thumbnail = req.files.thumbnailImage



      course.thumbnail = uploadedImage.secure_url
    }

    for (const key in updates) {
      if (Object.hasOwn(updates, key)) {
        if (key === "tag" || key === "instructions") {
          course[key] = JSON.parse(updates[key])
        } else if (key !== "thumbnailImage") {
          course[key] = updates[key]
        }
      }
    }

    await course.save()

    /* ================= RETURN UPDATED COURSE ================= */
    const updatedCourse = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: { path: "additionalDetails" },
      })
      .populate("category")
      .populate({
        path: "ratingAndReviews",
        populate: {
          path: "user",
          select: "firstName lastName email image"
        }
      }).populate({
        path: "courseContent",
        populate: { path: "subSection" },
      })

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error("UPDATE COURSE ERROR:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to update course",
      error: error.message,
    })
  }
}


/* ================= PUBLISH COURSE ================= */
export const publishCourse = async (req, res) => {
  try {
    const { courseId } = req.params
    const instructorId = req.user.id

    const course = await Course.findById(courseId).populate({
      path: "courseContent",
      populate: { path: "subSection" },
    })

    if (!course) {
      return res.status(404).json({ success: false })
    }

    if (course.instructor.toString() !== instructorId) {
      return res.status(403).json({ success: false })
    }

    if (!course.courseContent.length) {
      return res.status(400).json({
        success: false,
        message: "Add at least one section",
      })
    }

    course.status = "Pending Review"
    await course.save()

    return res.status(200).json({
      success: true,
      message: "Course submitted for review successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const courseDetails = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: { path: "additionalDetails" },
      })
      .populate("category")
      .populate({
        path: "ratingAndReviews",
        populate: {
          path: "user",
          select: "firstName lastName email image"
        }
      })
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      });

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (
      courseDetails.instructor._id.toString() !== userId && !courseDetails.studentsEnrolled.includes(userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    });

    if (!courseProgressCount) {
      courseProgressCount = {
        completedSubSections: [],
      };
    }
    res.set({
      "Cache-Control": "no-store",
    });


    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        completedSubSections: courseProgressCount.completedSubSections,
      },
    });
  } catch (error) {
    console.error("GET FULL COURSE DETAILS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch course details",
    });
  }
};


export const getSectionDetails = async (req, res) => {
  try {
    const { sectionId } = req.params;

    const section = await Section.findById(sectionId).populate("subSection");

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: section,
    });
  } catch (error) {
    console.error("GET SECTION DETAILS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch section details",
    });
  }
};

export const getSubSectionDetails = async (req, res) => {
  try {
    const { subsectionId } = req.params;

    const subsection = await SubSection.findById(subsectionId);

    if (!subsection) {
      return res.status(404).json({
        success: false,
        message: "Subsection not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: subsection,
    });
  } catch (error) {
    console.error("GET SUBSECTION DETAILS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subsection details",
    });
  }
};

