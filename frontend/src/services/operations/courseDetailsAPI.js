import { toast } from "react-hot-toast"
import { apiConnector } from "../apiConnector"
import { courseEndpoints, ratingsEndpoints, aiEndpoints } from "../apis"

const {
  COURSE_CATEGORIES_API,
  GET_ALL_COURSE_API,
  CREATE_COURSE_API,
  EDIT_COURSE_API,
  CREATE_SECTION_API,
  CREATE_SUBSECTION_API,
  UPDATE_SECTION_API,
  UPDATE_SUBSECTION_API,
  DELETE_SECTION_API,
  DELETE_SUBSECTION_API,
  GET_ALL_INSTRUCTOR_COURSES_API,
  DELETE_COURSE_API,
  GET_FULL_COURSE_DETAILS,
  PUBLISH_COURSE_API,
  UPDATE_COURSE_PROGRESS,
  GET_SECTION_DETAILS,
  
} = courseEndpoints

const { CREATE_RATING_API } = ratingsEndpoints
const { CHAT_WITH_AI_API, GENERATE_AI_QUIZ_API } = aiEndpoints

export const chatWithAI = async (question, subSectionId, token) => {
  let result = null;
  console.log("Sending:", { question, subSectionId });
  try {
    const response = await apiConnector(
      "POST",
      CHAT_WITH_AI_API,
      { question, subSectionId },
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    result = response.data.answer;
  } catch (error) {
    console.log("CHAT_WITH_AI_API ERROR............", error);
  }
  return result;
};
export const generateAIQuiz = async (subSectionId, numberOfQuestions = 5, token) => {
  let result = [];
  try {
    const response = await apiConnector(
      "POST",
      GENERATE_AI_QUIZ_API,
      { subSectionId, numberOfQuestions },
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    result = response.data.data;
    toast.success("AI Generated!");
  } catch (error) {
    console.log("GENERATE_AI_QUIZ_API ERROR............", error);
    toast.error("Can't create Quiz now!");
  }
  return result;
};
export const getAllCourses = async () => {
  let result = []
  try {
    const response = await apiConnector("GET", GET_ALL_COURSE_API)
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Course Categories")
    }
    result = response?.data?.data
  } catch (error) {
    console.log("GET_ALL_COURSE_API API ERROR............", error)
    toast.error(error.message)
  }
  return result
}

export const fetchCourseDetails = async (courseId) => {
  let result = null
  try {
    const response = await apiConnector(
      "GET",
      `${courseEndpoints.GET_COURSE_DETAILS_API}/${courseId}`
    )

    if (!response?.data?.success) {
      throw new Error("Failed to fetch course details")
    }

    result = response.data.data.courseDetails
  } catch (error) {
    console.log("FETCH_COURSE_DETAILS_API ERROR:", error)
  }
  return result
}

export const getSectionDetails = async (sectionId, token) => {
  let result = null;
  try {
    const response = await apiConnector(
      "GET",
      `${GET_SECTION_DETAILS}/${sectionId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    result = response.data.data;
  } catch (error) {
    console.error("GET_SECTION_DETAILS ERROR:", error);
    toast.error("Could not fetch section details");
  }
  return result;
};

export const markLectureAsComplete = async (courseId, subsectionId, token) => {
  const toastId = toast.loading("Saving progress...");
  try {
    const response = await apiConnector(
      "POST",
      UPDATE_COURSE_PROGRESS,
      {
        courseId,
        subsectionId,
      },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    toast.success("Progress saved");
  } catch (error) {
    console.error("MARK_LECTURE_COMPLETE ERROR:", error);
    toast.error("Could not save progress");
  } finally {
    toast.dismiss(toastId);
  }
};

export async function getCourseLearning(courseId, token) {
  const response = await apiConnector(
    "GET",
    `/course/${courseId}/learning`,
    null,
    { Authorization: `Bearer ${token}` }
  )
  return response.data.data
}

export const fetchCourseCategories = async () => {
  let result = []
  try {
    const response = await apiConnector("GET", COURSE_CATEGORIES_API)
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Course Categories")
    }
    result = response?.data?.data
  } catch (error) {
    toast.error(error.message)
  }
  return result
}

export const addCourseDetails = async (data, token) => {
  const toastId = toast.loading("Loading...")
  let result = null;
  try {
    const response = await apiConnector("POST", CREATE_COURSE_API, data, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    })
    console.log("CREATE COURSE API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Add Course Details")
    }
    result = response?.data?.data
    toast.success("Course Details Added Successfully")
  } catch (error) {
    console.log("CREATE COURSE API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
  return result
}

export const editCourseDetails = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", EDIT_COURSE_API, data, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) {
      throw new Error("Could Not Update Course Details")
    }
    result = response?.data?.data
    toast.success("Course Details Updated Successfully")
  } catch (error) {
    console.log("EDIT COURSE API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
  return result
}

// ================ create Section ================
export const createSection = async (data, token) => {
  let result = null
  const toastId = toast.loading("Creating section...")
  try {
    const response = await apiConnector("POST", CREATE_SECTION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("CREATE SECTION RESPONSE:", response.data)
    if (!response?.data?.success) {
      throw new Error(response.data.message)
    }
    toast.success("Section created successfully")
    result = response.data.data
  } catch (error) {
    console.log("CREATE SECTION API ERROR:", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
  return result
}

// ================ create SubSection ================
export const createSubSection = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", CREATE_SUBSECTION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("CREATE SUB-SECTION API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Add Lecture")
    }
    result = response?.data?.data
  } catch (error) {
    console.log("CREATE SUB-SECTION API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
  return result
}

// ================ Update Section ================
export const updateSection = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", UPDATE_SECTION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("UPDATE SECTION API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Update Section")
    }
    result = response?.data?.data
    toast.success("Course Section Updated")
  } catch (error) {
    console.log("UPDATE SECTION API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
  return result
}

// ================ Update SubSection ================
export const updateSubSection = async (data, token) => {
  let result = null;
  const toastId = toast.loading("Loading...");
  try {
    const response = await apiConnector("POST", UPDATE_SUBSECTION_API, data, {
      Authorization: `Bearer ${token}`,
    });
    console.log("UPDATE SUB-SECTION API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error("Could Not Update Lecture");
    }

    result = response?.data?.data;
    toast.success("Lecture Updated");
  } catch (error) {
    console.log("UPDATE SUB-SECTION API ERROR............", error);

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Could Not Update Lecture";
    if (error.response?.status === 403) {
      toast.error(errorMessage, { duration: 6000 });
    } else {
      toast.error(errorMessage);
    }
  }
  toast.dismiss(toastId);
  return result;
};
export const deleteSection = async (data, token) => {
  let result = null;
  const toastId = toast.loading("Deleting section...");
  try {
    const response = await apiConnector("DELETE", DELETE_SECTION_API, data, {
      Authorization: `Bearer ${token}`,
    });
    if (!response?.data?.success) {
      throw new Error(response.data.message);
    }
    toast.success("Section deleted successfully");
    result = response.data.data;
  } catch (error) {
    console.log("DELETE SECTION API ERROR:", error);
    toast.error(error.message);
  }
  toast.dismiss(toastId);
  return result;
};

// ================ delete SubSection ================
export const deleteSubSection = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", DELETE_SUBSECTION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("DELETE SUB-SECTION API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Delete Lecture")
    }
    result = response?.data?.data
    toast.success("Lecture Deleted")
  } catch (error) {
    console.log("DELETE SUB-SECTION API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
  return result
}

// ================ fetch Instructor Courses ================
export const fetchInstructorCourses = async (token) => {
  let result = []
  // const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector(
      "GET",
      GET_ALL_INSTRUCTOR_COURSES_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    )
    console.log("INSTRUCTOR COURSES API RESPONSE", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Instructor Courses")
    }
    result = response?.data?.data
  } catch (error) {
    console.log("INSTRUCTOR COURSES API ERROR............", error)
    toast.error(error.message)
  }
  return result
}

export const publishCourse = async (courseId, token) => {
  try {
    const response = await apiConnector(
      "PATCH",
      `${PUBLISH_COURSE_API}/${courseId}`,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    )
    return response.data.data
  } catch (error) {
    console.error("PUBLISH COURSE ERROR:", error)
    throw error
  }
}

// ================ delete Course ================
export const deleteCourse = async (data, token) => {
  const toastId = toast.loading("Deleting course...");
  let result = false;
  try {
    const response = await apiConnector(
      "DELETE",
      `${DELETE_COURSE_API}/${data.courseId}`,null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    console.log("DELETE COURSE API RESPONSE:", response);
    if (!response?.data?.success) {
      throw new Error(response.data.message);
    }
    result = true;
  } catch (error) {
    console.log("DELETE COURSE API ERROR:", error);
    toast.error(error.response?.data?.message || "Could not delete course");
  }
  toast.dismiss(toastId);
  return result;
};

// ================ get Full Details Of Course ================
export const getFullCourseDetails = async (courseId, token) => {
  let result = null
  try {
    const response = await apiConnector(
      "GET",
      `${GET_FULL_COURSE_DETAILS}/${courseId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    )
    console.log("COURSE_FULL_DETAILS_API API RESPONSE............", response)
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    result = response?.data
  } catch (error) {
    console.log("COURSE_FULL_DETAILS_API API ERROR............", error)
    result = error.response?.data
  }
  return result
}

// ================ create Course Rating  ================
export const createRating = async (data, token) => {
  let success = false
  try {
    const response = await apiConnector("POST", CREATE_RATING_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("CREATE RATING API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Create Rating")
    }

    success = true
  } catch (error) {
    success = false
    console.log("CREATE RATING API ERROR............", error)
    toast.error(error?.response?.data?.message || error.message)
  }
  return success
}

// ================ enroll Free Course ================
export const enrollFreeCourse = async (courseId, token) => {
  try {
    const response = await apiConnector(
      "POST",
      courseEndpoints.ENROLL_FREE_COURSE,
      { courseId },
      {
        Authorization: `Bearer ${token}`,
      }
    )
    console.log("ENROLL FREE API SUCCESS:", response)
    return response.data
  } catch (error) {
    console.log("ENROLL FREE API ERROR DETAIL:", error)
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Could not enroll in free course"

    return {
      success: false,
      message: errorMessage,
    }
  }
}

