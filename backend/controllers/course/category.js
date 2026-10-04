
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
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });

    return res.status(200).json({
      success: true,
      message: "Category created successfully",
      data: categoryDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const duplicate = await Category.findOne({
      _id: { $ne: categoryId },
      name: name.trim(),
    });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Category name already exists",
      });
    }

    category.name = name.trim();
    category.description = description.trim();
    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (category.courses && category.courses.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category that has courses",
      });
    }

    await Category.findByIdAndDelete(categoryId);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};