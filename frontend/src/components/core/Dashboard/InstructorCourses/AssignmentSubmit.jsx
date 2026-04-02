import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { courseEndpoints } from "../../../../services/apis";
import { toast } from "react-hot-toast";
import { IoIosArrowBack, IoMdClose } from "react-icons/io";
import { BiTask } from "react-icons/bi";

export default function AssignmentSubmissions() {
  const { assignmentId, courseId } = useParams();
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho Modal Chấm điểm
  const [selectedSubmission, setSelectedSubmission] = useState(null); // Lưu bài đang chấm
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [gradingLoading, setGradingLoading] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await apiConnector(
          "GET",
          `${courseEndpoints.GET_ASSIGNMENT_SUBMISSIONS_API}/${assignmentId}`,
          null,
          { Authorization: `Bearer ${token}` },
        );

        if (response?.data?.success) {
          setSubmissions(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
        toast.error("Could not fetch submissions");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [assignmentId, token]);

  // Mở Modal chấm điểm
  const openGradeModal = (submission) => {
    setSelectedSubmission(submission);
    // Nếu đã chấm rồi thì hiện lại điểm cũ, chưa thì để trống
    setGrade(submission.grade || "");
    setFeedback(submission.feedback || "");
  };

  // Đóng Modal
  const closeGradeModal = () => {
    setSelectedSubmission(null);
    setGrade("");
    setFeedback("");
  };

  // Xử lý gọi API chấm điểm
  const handleGradeSubmission = async (e) => {
    e.preventDefault();

    if (!grade) {
      toast.error("Vui lòng nhập điểm số");
      return;
    }

    setGradingLoading(true);
    try {
      const response = await apiConnector(
        "POST",
        courseEndpoints.GRADE_ASSIGNMENT_API, // Đảm bảo bạn đã khai báo endpoint này
        {
          submissionId: selectedSubmission._id,
          grade: grade,
          feedback: feedback,
        },
        { Authorization: `Bearer ${token}` },
      );

      if (response?.data?.success) {
        toast.success("Đã chấm điểm thành công!");

        const updatedSubmissions = submissions.map((sub) =>
          sub._id === selectedSubmission._id
            ? { ...sub, status: "Graded", grade: grade, feedback: feedback }
            : sub,
        );
        setSubmissions(updatedSubmissions);
        closeGradeModal();
      }
    } catch (error) {
      console.error("Grading error:", error);
      toast.error("Lỗi khi chấm điểm");
    } finally {
      setGradingLoading(false);
    }
  };

  return (
    <div className="text-white relative">
      <button
        onClick={() => navigate(`/dashboard/course/${courseId}`)}
        className="flex items-center gap-x-2 text-richblack-300 mb-6 hover:text-white transition-colors"
      >
        <IoIosArrowBack /> Quay lại chi tiết khóa học
      </button>

      <h1 className="text-2xl font-bold mb-6">Chấm điểm bài tập</h1>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="flex flex-col gap-y-4">
          {submissions.length === 0 ? (
            <div className="p-4 bg-richblack-800 rounded-md text-center text-richblack-300">
              Chưa có học viên nào nộp bài.
            </div>
          ) : (
            submissions.map((sub) => (
              <div
                key={sub._id}
                className="bg-richblack-800 p-6 rounded-lg border border-richblack-700 flex justify-between items-start md:items-center gap-4"
              >
                {/* Thông tin học viên */}
                <div>
                  <div className="flex items-center gap-x-3">
                    <img
                      src={sub.studentId.image}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-lg text-richblack-5">
                        {sub.studentId.firstName} {sub.studentId.lastName}
                      </p>
                      <p className="text-richblack-300 text-sm">
                        {sub.studentId.email}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`http://localhost:5000${sub.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-yellow-50 underline mt-3 block text-sm hover:text-yellow-200"
                  >
                    📄 Xem bài nộp: {sub.fileName}
                  </a>
                  <p className="text-xs text-richblack-400 mt-1">
                    Nộp lúc: {new Date(sub.submittedAt).toLocaleString("vi-VN")}
                  </p>
                </div>

                {/* Trạng thái & Nút chấm */}
                <div className="flex flex-col items-end gap-3 min-w-[150px]">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold 
                                        ${sub.status === "Graded" ? "bg-caribbeangreen-900 text-caribbeangreen-50" : "bg-yellow-900 text-yellow-50"}`}
                  >
                    {sub.status === "Graded"
                      ? `Đã chấm: ${sub.grade} điểm`
                      : "Chờ chấm"}
                  </span>

                  <button
                    onClick={() => openGradeModal(sub)}
                    className="flex items-center gap-x-2 bg-yellow-50 text-black px-4 py-2 rounded-md font-bold hover:scale-105 transition-transform"
                  >
                    <BiTask />{" "}
                    {sub.status === "Graded" ? "Sửa điểm" : "Chấm điểm"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* === MODAL CHẤM ĐIỂM === */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-[1000] !mt-0 grid place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
          <div className="w-11/12 max-w-[500px] rounded-lg border border-richblack-400 bg-richblack-800 p-6">
            {/* Header Modal */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-richblack-5">
                Chấm bài cho {selectedSubmission.studentId.firstName}
              </h3>
              <button onClick={closeGradeModal}>
                <IoMdClose className="text-2xl text-richblack-5 hover:text-pink-200" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleGradeSubmission}
              className="flex flex-col gap-y-4"
            >
              <div>
                <label className="mb-1 block text-sm text-richblack-5">
                  Điểm số (0-100) <sup className="text-pink-200">*</sup>
                </label>
                <input
                  type="number"
                  placeholder="Nhập điểm..."
                  className="w-full rounded-lg bg-richblack-700 p-3 text-richblack-5 outline-none border-b border-richblack-600 focus:border-yellow-50"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-richblack-5">
                  Nhận xét / Feedback
                </label>
                <textarea
                  rows={4}
                  placeholder="Nhập lời nhận xét cho học viên..."
                  className="w-full rounded-lg bg-richblack-700 p-3 text-richblack-5 outline-none border-b border-richblack-600 focus:border-yellow-50"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-x-3 mt-4">
                <button
                  type="button"
                  onClick={closeGradeModal}
                  className="rounded-md bg-richblack-700 px-5 py-2 font-semibold text-richblack-50 hover:bg-richblack-600"
                  disabled={gradingLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-yellow-50 px-5 py-2 font-semibold text-black hover:scale-105 transition-all"
                  disabled={gradingLoading}
                >
                  {gradingLoading ? "Đang lưu..." : "Xác nhận chấm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
