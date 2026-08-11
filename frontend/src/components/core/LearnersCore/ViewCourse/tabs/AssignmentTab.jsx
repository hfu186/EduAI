/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  MdAssignment,
  MdCloudUpload,
  MdAccessTime,
  MdCheckCircle,
  MdDelete,
  MdEdit,
  MdFilePresent,
  MdOutlineDateRange,
  MdDownload,
} from "react-icons/md";
import { toast } from "react-hot-toast";
import { updateCompletedLectures } from "@/slices/viewCourseSlice";
import { apiConnector } from "@/services/apiConnector";
import { courseEndpoints } from "@/services/apis";

export default function AssignmentTab({ assignment, courseId, subSectionId }) {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submittedAssignment, setSubmittedAssignment] = useState(null);
  const [editMode, setEditMode] = useState(false);

  if (!assignment) return null;

  const deadlineDate = assignment.assignment?.deadline || assignment.deadline || assignment.dueDate;
  
  const isDeadlinePassed = deadlineDate ? new Date() > new Date(deadlineDate) : false;
  const canViewAnswer = submittedAssignment || isDeadlinePassed;

  useEffect(() => {
    const fetchSubmissionStatus = async () => {
      setLoading(true);
      try {
        const response = await apiConnector(
          "GET",
          `${courseEndpoints.CHECK_SUBMISSION_API}/${assignment._id}`,
          null,
          { Authorization: `Bearer ${token}` }
        );

        if (response?.data?.success && response?.data?.data) {
          setSubmittedAssignment(response.data.data);
        } else {
          setSubmittedAssignment(null);
        }
      } catch (error) {
        console.error("Fetch submission error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (assignment._id) fetchSubmissionStatus();
  }, [assignment._id, token]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Please select a file under 10MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file.");
      return;
    }

    if (isDeadlinePassed) {
        toast.error("The deadline has passed. You can no longer submit.");
        return;
    }

    setUploading(true);
    const toastId = toast.loading("Submitting assignment...");

    try {
      const formData = new FormData();
      formData.append("submissionFile", selectedFile);
      formData.append("assignmentId", assignment._id);
      formData.append("courseId", courseId);
      formData.append("subSectionId", subSectionId);

      const response = await apiConnector(
        "POST",
        courseEndpoints.SUBMIT_ASSIGNMENT_API,
        formData,
        {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        }
      );

      if (!response?.data?.success) {
        throw new Error(response?.data?.message);
      }

      toast.success("Assignment submitted successfully!");
      setSubmittedAssignment(response.data.data);
      dispatch(updateCompletedLectures(subSectionId));
      setSelectedFile(null);
      setEditMode(false);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to submit assignment.");
    } finally {
      toast.dismiss(toastId);
      setUploading(false);
    }
  };

  const handleDeleteSubmission = async () => {
    if (isDeadlinePassed) {
        toast.error("You cannot delete submission after the deadline.");
        return;
    }

    if (!window.confirm("Are you sure you want to delete this submission?"))
      return;

    setUploading(true);
    const toastId = toast.loading("Deleting submission...");

    try {
      const response = await apiConnector(
        "POST",
        courseEndpoints.DELETE_SUBMISSION_API,
        { assignmentId: assignment._id },
        { Authorization: `Bearer ${token}` }
      );

      if (!response?.data?.success) {
        throw new Error(response?.data?.message);
      }

      toast.success("Submission deleted.");
      setSubmittedAssignment(null);
      setEditMode(false);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete submission.");
    } finally {
      toast.dismiss(toastId);
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      <section className="bg-richblack-800 rounded-2xl border border-richblack-700 overflow-hidden shadow-lg">
        <div className="bg-richblack-700/50 px-6 py-4 flex justify-between items-center border-b border-richblack-700">
          <div className="flex items-center gap-x-2 text-yellow-50 font-bold text-lg">
            <MdAssignment className="text-2xl" />
            <span>{assignment.title || "Assignment"}</span>
          </div>

          {deadlineDate && (
            <div
              className={`text-sm px-3 py-1 rounded-full flex items-center gap-x-1 font-medium
                ${isDeadlinePassed 
                    ? "bg-pink-900/30 text-pink-200 border border-pink-900" 
                    : "bg-caribbeangreen-900/30 text-caribbeangreen-200 border border-caribbeangreen-900"
                }`}
            >
              <MdAccessTime />
              {isDeadlinePassed ? "Expired: " : "Due: "}
              {new Date(deadlineDate).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short"
              })}
            </div>
          )}
        </div>

        <div className="p-6 text-richblack-300 bg-richblack-900 flex flex-col gap-6">
          <div className="prose prose-invert max-w-none">
            {/* Use the nested description value when available. */}
            {assignment.assignment?.description || assignment.description || assignment.instructions || "Please complete the assignment and submit your file below."}
          </div>

          {assignment.assignment?.fileUrl && (
            <div className="mt-2">
                <a 
                    href={`http://localhost:5000${assignment.assignment.fileUrl}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-2 text-blue-200 hover:text-blue-100 transition-colors bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-900"
                >
                    <MdFilePresent className="text-xl"/> Download Question File
                </a>
            </div>
          )}

          {/* Use the nested answerKeyUrl value when available. */}
          {assignment.assignment?.answerKeyUrl && (
            <div className={`mt-4 p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all
              ${canViewAnswer 
                 ? "bg-caribbeangreen-900/10 border-caribbeangreen-600" 
                 : "bg-richblack-800 border-richblack-600 opacity-70"
              }`}
            >
              <div>
                <h4 className={`font-bold text-lg flex items-center gap-2 ${canViewAnswer ? "text-caribbeangreen-200" : "text-richblack-200"}`}>
                   {canViewAnswer ? <MdCheckCircle /> : <MdAccessTime />}
                   Answer Key (Reference)
                </h4>
                <p className={`text-sm mt-1 ${canViewAnswer ? "text-caribbeangreen-50" : "text-richblack-400"}`}>
                  {submittedAssignment 
                    ? "You have submitted your work. You can now download the reference answer." 
                    : isDeadlinePassed 
                       ? "The deadline has passed. The reference answer is now available."
                       : "The answer key is locked. It will be available after you submit your work or the deadline passes."}
                </p>
              </div>
              
              {canViewAnswer && (
                <a
                  href={`http://localhost:5000${assignment.assignment.answerKeyUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-caribbeangreen-600/20 text-caribbeangreen-200 border border-caribbeangreen-600 font-bold rounded-lg hover:bg-caribbeangreen-600 hover:text-white transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
                >
                  <MdDownload className="text-xl" /> Download Answer
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ---------------- SECTION 2: UPLOAD AND STATUS WORKSPACE ---------------- */}
      <section className="bg-richblack-900 rounded-2xl border-2 border-dashed border-richblack-700 p-8 shadow-2xl relative">
        <h3 className="text-xl font-bold text-white mb-6 text-center">
          Submission Workspace
        </h3>

        {loading ? (
          <div className="text-center text-richblack-200 py-10 animate-pulse">Loading workspace...</div>
        ) : submittedAssignment && !editMode ? (
          
          // --- STATE: ASSIGNMENT SUBMITTED ---
          <div className="flex flex-col items-center gap-y-4">
            <MdCheckCircle className="text-6xl text-caribbeangreen-200" />

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">
                Assignment Submitted
              </h2>

              <div className="bg-richblack-800 p-4 rounded-lg border border-richblack-700 mt-4 min-w-[300px]">
                <div className="flex items-center gap-x-3 text-richblack-50 mb-2">
                  <MdFilePresent className="text-2xl text-yellow-50" />
                  <span className="font-medium truncate max-w-[250px]">
                    {submittedAssignment.fileName}
                  </span>
                </div>

                <div className="flex items-center gap-x-3 text-richblack-300 text-sm">
                  <MdOutlineDateRange className="text-xl" />
                  <span>
                    Submitted at:{" "}
                    {new Date(submittedAssignment.submittedAt).toLocaleString("en-US")}
                  </span>
                </div>

                {submittedAssignment.status === "Graded" && (
                  <div className="mt-3 pt-3 border-t border-richblack-600 text-left">
                    <p className="text-caribbeangreen-100 font-bold">
                      Grade: {submittedAssignment.grade}
                    </p>
                    <p className="text-xs text-richblack-300 italic mt-1">
                      Feedback: {submittedAssignment.feedback}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Show delete/resubmit only when the submission is ungraded and before the deadline. */}
            {!isDeadlinePassed && submittedAssignment.status !== "Graded" && (
              <div className="flex gap-x-4 mt-6">
                <button
                  onClick={handleDeleteSubmission}
                  disabled={uploading}
                  className="px-6 py-2 rounded-lg border border-pink-200 text-pink-200 flex items-center gap-x-2 hover:bg-pink-900/10 transition-colors"
                >
                  <MdDelete /> Delete
                </button>

                <button
                  onClick={() => setEditMode(true)}
                  className="px-6 py-2 rounded-lg bg-yellow-50 text-black font-bold hover:scale-105 flex items-center gap-x-2 transition-all shadow-md"
                >
                  <MdEdit /> Resubmit
                </button>
              </div>
            )}
          </div>

        ) : isDeadlinePassed ? (

          // --- STATE: DEADLINE PASSED AND NO ACTIVE SUBMISSION ---
          <div className="flex flex-col items-center justify-center text-center py-8">
             <div className="w-24 h-24 bg-pink-900/20 rounded-full flex items-center justify-center mb-6 border-2 border-pink-800">
                <MdAccessTime className="text-5xl text-pink-300" />
             </div>
             <h3 className="text-2xl font-bold text-pink-100 mb-2">Submission Closed</h3>
             <p className="text-richblack-300 max-w-md">
                The deadline for this assignment has passed. You can no longer submit or edit your work.
             </p>
          </div>

        ) : (

          // --- STATE: STANDARD SUBMISSION FORM ---
          <div className="flex flex-col items-center">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.zip,.rar,.doc,.docx"
              disabled={uploading}
            />

            <label
              htmlFor="file-upload"
              className={`w-full max-w-2xl h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-y-4 cursor-pointer transition-all
              ${
                selectedFile
                  ? "border-caribbeangreen-400 bg-caribbeangreen-900/10"
                  : "border-richblack-600 hover:border-yellow-50 bg-richblack-800"
              }`}
            >
              {selectedFile ? (
                <>
                  <MdCheckCircle className="text-6xl text-caribbeangreen-200" />
                  <p className="text-caribbeangreen-200 font-bold text-lg">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-caribbeangreen-100/50">Click to change file</p>
                </>
              ) : (
                <>
                  <MdCloudUpload className="text-5xl text-yellow-50 mb-2" />
                  <p className="text-richblack-5 font-bold text-xl tracking-wide">
                    Browse Files to Upload
                  </p>
                  <p className="text-richblack-400 text-sm">
                    Supported formats: PDF, DOCX, ZIP (Max 10MB)
                  </p>
                </>
              )}
            </label>

            <div className="mt-8 flex gap-x-6 w-full max-w-2xl justify-end">
              {editMode && submittedAssignment && (
                <button
                  onClick={() => {
                    setEditMode(false);
                    setSelectedFile(null);
                  }}
                  className="px-6 py-3 font-semibold text-richblack-300 hover:text-white transition-colors"
                >
                  Cancel Edit
                </button>
              )}

              <button
                 onClick={handleUpload}
                 disabled={uploading || !selectedFile}
                 className={`px-10 py-3 rounded-lg font-bold shadow-[2px_2px_0px_rgba(255,255,255,0.18)] transition-all
                 ${
                   uploading || !selectedFile
                     ? "bg-richblack-600 text-richblack-300 cursor-not-allowed"
                     : "bg-yellow-50 text-black hover:scale-[0.98]"
                 }`}
              >
                 {uploading
                   ? "Processing..."
                   : editMode
                   ? "Update Submission"
                   : "Submit Assignment"}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
