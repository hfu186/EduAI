
const Category = require("../../models/category");
const Course = require("../../models/course");
const Enrollment = require("../../models/enrollment");
const { attachEnrollmentStudents } = require("../../services/enrollment.service");

exports.getCategoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.params; 

    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" }, 
        populate: [
          { path: "instructor" },
          { path: "ratingAndReviews" }, 
        ],
      })
      .exec();

    if (!selectedCategory) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    });
    
    let differentCategory = null;
    if (categoriesExceptSelected.length > 0) {
      let randomIndex = Math.floor(Math.random() * categoriesExceptSelected.length);
      differentCategory = await Category.findById(categoriesExceptSelected[randomIndex]._id)
        .populate({
          path: "courses",
          match: { status: "Published" },
          populate: { path: "instructor" },
        })
        .exec();
    }
    const popularCourseIds = await Enrollment.aggregate([
      { $group: { _id: "$courseId", enrollmentCount: { $sum: 1 } } },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },
      { $match: { "course.status": "Published" } },
      { $sort: { enrollmentCount: -1 } },
      { $limit: 10 },
      { $project: { _id: 1 } },
    ]);
    const popularCourses = await Course.find({
      _id: { $in: popularCourseIds.map(({ _id }) => _id) },
    })
      .populate("instructor")
      .exec();
    const popularCoursesById = new Map(
      popularCourses.map((course) => [String(course._id), course])
    );
    const mostSellingCourses = await attachEnrollmentStudents(
      popularCourseIds
        .map(({ _id }) => popularCoursesById.get(String(_id)))
        .filter(Boolean)
    );

    const selectedCategoryData = selectedCategory.toObject();
    selectedCategoryData.courses = await attachEnrollmentStudents(
      selectedCategory.courses
    );
    const differentCategoryData = differentCategory?.toObject() || null;
    if (differentCategoryData) {
      differentCategoryData.courses = await attachEnrollmentStudents(
        differentCategory.courses
      );
    }

    res.status(200).json({
      success: true,
      data: {
        selectedCategory: selectedCategoryData,
        differentCategory: differentCategoryData,
        mostSellingCourses,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.showAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({}, {
      name: true,
      description: true,
    });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};
