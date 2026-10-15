import { toast } from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { courseEndpoints } from "../apis";

const { GET_INSTRUCTOR_QUIZ_REPORTS_API, UPDATE_QUIZ_REPORT_STATUS_API } = courseEndpoints;

export const getInstructorQuizReports = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_INSTRUCTOR_QUIZ_REPORTS_API,
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not fetch quiz reports");
    }

    return response?.data?.data || [];
  } catch (error) {
    console.error("GET_INSTRUCTOR_QUIZ_REPORTS_API ERROR............", error);
    toast.error(error.message || "Could not fetch quiz reports");
    return [];
  }
};

export const updateQuizReportStatus = async (token, reportId, status) => {
  try {
    const response = await apiConnector(
      "PATCH",
      `${UPDATE_QUIZ_REPORT_STATUS_API}/${reportId}/status`,
      { status },
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not update quiz report status");
    }

    return response?.data?.data;
  } catch (error) {
    console.error("UPDATE_QUIZ_REPORT_STATUS_API ERROR............", error);
    toast.error(error.message || "Could not update quiz report status");
    return null;
  }
};

export const fixReportedQuizQuestion = async (token, reportId, quizQuestion) => {
  try {
    const response = await apiConnector(
      "PATCH",
      `${GET_INSTRUCTOR_QUIZ_REPORTS_API}/${reportId}/fix`,
      quizQuestion,
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not save the quiz correction");
    }

    toast.success(response.data.message || "Quiz question fixed");
    return response.data.data;
  } catch (error) {
    console.error("FIX_REPORTED_QUIZ_QUESTION_API_ERROR:", error);
    toast.error(error.response?.data?.message || error.message || "Could not save the quiz correction");
    return null;
  }
};
