import { toast } from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { adminEndpoints } from "../apis";
export const getAllUsers = async (token) => {
    try {
        const response = await apiConnector("GET", adminEndpoints.GET_ALL_USERS, null, {
            Authorization: `Bearer ${token}`,
        });
        return response.data.data;
    } catch (error) {
        console.log("GET_ALL_USERS_ERROR...", error);
    }
};

export const deleteUser = async (userId, token) => {
    const toastId = toast.loading("Deleting...");
    try {
        const response = await apiConnector("DELETE", `${adminEndpoints.DELETE_USER}/${userId}`, null, {
            Authorization: `Bearer ${token}`,
        });
        return response.data;
    } catch (error) {
        console.log("DELETE_USER_ERROR...", error);
    } finally {
        toast.dismiss(toastId);
    }
};

export const promoteUser = async (userId, token) => {
    const toastId = toast.loading("Promoting user...");
    try {
        const response = await apiConnector(
            "PATCH",
            `${adminEndpoints.PROMOTE_USER}/${userId}`,
            null,
            {
                Authorization: `Bearer ${token}`,
            }
        );
        return response.data;
    } catch (error) {
        console.log("PROMOTE_USER_ERROR...", error);
        toast.error(error?.response?.data?.message || "Failed to promote user");
    } finally {
        toast.dismiss(toastId);
    }
};



export const getAllCourses = async (token) => {
    try {
        const response = await apiConnector("GET", adminEndpoints.GET_ALL_COURSES, null, {
            Authorization: `Bearer ${token}`,
        });
        return response.data.data;
    } catch (error) {
        console.log("GET_ALL_COURSES_ERROR...", error);
    }
};

export const approveCourse = async (courseId, status, token) => {
    const toastId = toast.loading("Processing course status...");
    try {
        const response = await apiConnector("POST", adminEndpoints.APPROVE_COURSE, { courseId, status }, {
            Authorization: `Bearer ${token}`,
        });
        return response.data;
    } catch (error) {
        console.log("APPROVE_COURSE_ERROR...", error);
        toast.error("Error updating course status");
    } finally {
        toast.dismiss(toastId);
    }
};
export const updateInstructorStatus = async (instructorId, status, token) => {
    const toastId = toast.loading("Updating status...");
    try {
        const response = await apiConnector(
            "PATCH",
            `${adminEndpoints.UPDATE_INSTRUCTOR_STATUS}/${instructorId}`,
            { status },
            { Authorization: `Bearer ${token}` }
        );
        return response.data;
    } catch (error) {
        console.log("UPDATE_INSTRUCTOR_STATUS_ERROR...", error);
        toast.error(error?.response?.data?.message || "Failed to update instructor status");
    } finally {
        toast.dismiss(toastId);
    }
};
export const getInstructorRequests = async (token) => {
    try {
        const response = await apiConnector("GET", adminEndpoints.GET_INSTRUCTOR_REQUESTS, null, {
            Authorization: `Bearer ${token}`,
        });
        return response.data.data;
    } catch (error) {
        console.log("GET_INSTRUCTOR_REQUESTS_ERROR...", error);
        return [];
    }
};

export const reviewInstructorRequest = async (userId, decision, token) => {
    const toastId = toast.loading("Processing request...");
    try {
        const response = await apiConnector(
            "PATCH",
            `${adminEndpoints.REVIEW_INSTRUCTOR_REQUEST}/${userId}`,
            { decision },
            { Authorization: `Bearer ${token}` }
        );
        return response.data;
    } catch (error) {
        console.log("REVIEW_INSTRUCTOR_REQUEST_ERROR...", error);
        toast.error(error?.response?.data?.message || "Unable to process request");
    } finally {
        toast.dismiss(toastId);
    }
};

export const getInstructors = async (token) => {
    try {
        const response = await apiConnector("GET", adminEndpoints.GET_ALL_INSTRUCTORS, null, {
            Authorization: `Bearer ${token}`,
        });
        return response.data.data;
    } catch (error) {
        console.log("GET_INSTRUCTORS_ERROR...", error);
    }
};
export const getAdminStats = async (token) => {
    try {
        const response = await apiConnector("GET", adminEndpoints.GET_ADMIN_STATS, null, {
            Authorization: `Bearer ${token}`,
        });
        return response.data.data;
    } catch (error) {
        console.log("GET_ADMIN_STATS_ERROR...", error);
    }   
};
export const getRevenueStats = async (token) => {
    try {
        const response = await apiConnector("GET", adminEndpoints.GET_REVENUE_STATS, null, {
            Authorization: `Bearer ${token}`,
        });
        return response.data.data;
    } catch (error) {
        console.log("GET_REVENUE_STATS_ERROR...", error);
    }   
};
export const getRevenue30Days = async (token) => {
  try {
    const res = await apiConnector(
      "GET",
      adminEndpoints.GET_REVENUE_30DAYS,
      null,
      { Authorization: `Bearer ${token}` }
    );
    return res.data.data;
  } catch (error) {
    console.log("GET_REVENUE_30DAYS_ERROR...", error);
    return [];
  }
};

export const getTopCourses = async (token) => {
  try {
    const res = await apiConnector(
      "GET",
      adminEndpoints.GET_TOP_COURSES,
      null,
      { Authorization: `Bearer ${token}` }
    );
    return res.data.data;
  } catch (error) {
    console.log("GET_TOP_COURSES_ERROR...", error);
    return [];
  }
};

export const getInstructorEarnings = async (token) => {
  try {
    const res = await apiConnector(
      "GET",
      adminEndpoints.GET_INSTRUCTOR_EARNINGS,
      null,
      { Authorization: `Bearer ${token}` }
    );
    return res.data.data;
  } catch (error) {
    console.log("GET_INSTRUCTOR_EARNINGS_ERROR...", error);
    return [];
  }
};

export const getEnrollmentGrowth = async (token) => {
  try {
    const res = await apiConnector(
      "GET",
      adminEndpoints.GET_ENROLLMENT_GROWTH,
      null,
      { Authorization: `Bearer ${token}` }
    );
    return res.data.data;
  } catch (error) {
    console.log("GET_ENROLLMENT_GROWTH_ERROR...", error);
    return [];
  }
};

export const getAverageOrderValue = async (token) => {
  try {
    const res = await apiConnector(
      "GET",
      adminEndpoints.GET_AVERAGE_ORDER_VALUE,
      null,
      { Authorization: `Bearer ${token}` }
    );
    return res.data.data;
  } catch (error) {
    console.log("GET_AVERAGE_ORDER_VALUE_ERROR...", error);
    return 0;
  }
};

export const createCategory = async (data, token) => {
  const toastId = toast.loading("Creating category...");
  try {
    const res = await apiConnector(
      "POST",
      adminEndpoints.CREATE_CATEGORY_API,
      data,
      { Authorization: `Bearer ${token}` }
    );
    return res.data.data;
  } catch (error) {
    console.log("CREATE_CATEGORY_ERROR...", error);
    toast.error(error?.response?.data?.message || "Failed to create category");
  } finally {
    toast.dismiss(toastId);
  }
};

export const updateCategory = async (categoryId, data, token) => {
  const toastId = toast.loading("Updating category...");
  try {
    const res = await apiConnector(
      "PUT",
      `${adminEndpoints.UPDATE_CATEGORY_API}/${categoryId}`,
      data,
      { Authorization: `Bearer ${token}` }
    );
    return res.data.data;
  } catch (error) {
    console.log("UPDATE_CATEGORY_ERROR...", error);
    toast.error(error?.response?.data?.message || "Failed to update category");
  } finally {
    toast.dismiss(toastId);
  }
};

export const deleteCategory = async (categoryId, token) => {
  const toastId = toast.loading("Deleting category...");
  try {
    const res = await apiConnector(
      "DELETE",
      `${adminEndpoints.DELETE_CATEGORY_API}/${categoryId}`,
      null,
      { Authorization: `Bearer ${token}` }
    );
    return res.data.success;
  } catch (error) {
    console.log("DELETE_CATEGORY_ERROR...", error);
    toast.error(error?.response?.data?.message || "Failed to delete category");
  } finally {
    toast.dismiss(toastId);
  }
};

export const fetchAllCategories = async () => {
  let result = [];
  try {
    const response = await apiConnector("GET", adminEndpoints.GET_ALL_CATEGORY_API);

    if (!response?.data?.success) {
      throw new Error("Could not fetch categories");
    }

    result = response?.data?.data;
  } catch (error) {
    console.log("GET_ALL_CATEGORY_API ERROR............", error);
    toast.error(error.message);
  }
  return result;
};
