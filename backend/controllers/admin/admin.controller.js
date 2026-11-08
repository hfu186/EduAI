const adminService = require("../../services/admin.service");
const Category = require("../../models/category");
const sendError = (res, error) => {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
        success: false,
        message: error.message,
    });
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await adminService.getAllUsers();
        return res.status(200).json({ success: true, data: users });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.updateInstructorStatus = async (req, res) => {
    try {
        const { instructorId } = req.params;
        const { status } = req.body;

        const result = await adminService.updateInstructorStatus({ instructorId, status });
        return res.status(200).json({
            success: true,
            message: result.message,
            data: { _id: result._id, status: result.status },
        });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await adminService.deleteUser({ userId });
        return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.promoteUserToInstructor = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await adminService.promoteUserToInstructor({ userId });
        return res.status(200).json({
            success: true,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.getAllCourses = async (req, res) => {
    try {
        const courses = await adminService.getAllCourses();
        return res.status(200).json({ success: true, data: courses });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.approveCourse = async (req, res) => {
    try {
        const { courseId, status } = req.body;
        const result = await adminService.approveCourse({ courseId, status });
        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.getInstructorRequests = async (req, res) => {
    try {
        const requests = await adminService.getInstructorRequests();
        return res.status(200).json({ success: true, data: requests });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.reviewInstructorRequest = async (req, res) => {
    try {
        const { userId } = req.params;
        const { decision } = req.body;

        const result = await adminService.reviewInstructorRequest({ userId, decision });
        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.getInstructors = async (req, res) => {
    try {
        const instructors = await adminService.getInstructors();
        return res.status(200).json({ success: true, data: instructors });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.getAdminStats = async (req, res) => {
    try {
        const data = await adminService.getAdminStats();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.getTotalRevenue = async (req, res) => {
    try {
        const result = await adminService.getTotalRevenue();
        return res.status(200).json({ success: true, totalRevenue: result.totalRevenue });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.getRevenue30Days = async (req, res) => {
    try {
        const data = await adminService.getRevenue30Days();
        return res.json({ success: true, data });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.getAverageOrderValue = async (req, res) => {
    try {
        const result = await adminService.getAverageOrderValue();
        return res.json({ success: true, data: result.data });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.getTopCourses = async (req, res) => {
    try {
        const data = await adminService.getTopCourses();
        return res.json({ success: true, data });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.getInstructorEarnings = async (req, res) => {
    try {
        const data = await adminService.getInstructorEarnings();
        return res.json({ success: true, data });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.getEnrollmentGrowth = async (req, res) => {
    try {
        const data = await adminService.getEnrollmentGrowth();
        return res.json({ success: true, data });
    } catch (error) {
        return sendError(res, error);
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
