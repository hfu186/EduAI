/* eslint-disable react/prop-types */
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  createSubSection,
  updateSubSection,
} from "../../../../../services/operations/courseDetailsAPI";
import { setCourse } from "../../../../../slices/courseSlice";
import { RxCross2 } from "react-icons/rx";
import QuizBuilder from "../../InstructorCourses/forms/Quiz";
import AssignmentForm from "../../InstructorCourses/forms/Assignment";
import SlideForm from "../../InstructorCourses/forms/Slide"; 

export default function SubSectionModal({
  modalData,
  setModalData,
  add = false,
  view = false,
  edit = false,
}) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const { course } = useSelector((state) => state.course);

  const modalType = modalData?.type || "video";

  const handleCommonSave = async (data) => {
    setLoading(true);
    const formData = new FormData();
    if (!course?._id) return toast.error("Course ID not found");

    formData.append("sectionId", modalData.sectionId);
    formData.append("courseId", course._id);
    formData.append("title", data.lectureTitle);
    formData.append("description", data.lectureDesc);
    formData.append("type", modalType);

    const fileToUpload = data.lectureFile || data.lectureVideo;

    if (fileToUpload && typeof fileToUpload === "object") {
      formData.append(modalType === "slide" ? "slides" : "video", fileToUpload);
    }

    if (edit) formData.append("subSectionId", modalData._id);

    try {
      const result = edit ? await updateSubSection(formData, token) : await createSubSection(formData, token);
      if (result) {
        dispatch(setCourse(result));
        setModalData(null);
        toast.success(edit ? "Updated successfully" : "Added successfully");
      }
    } catch (error) {
      console.error("ERROR SAVE:", error);
      toast.error(error.response?.data?.message || "Failed to save data");
    }
    setLoading(false);
  };

  const handleQuizSave = async (quizData) => {
    setLoading(true);
    const formData = new FormData();
    if (!course?._id) return toast.error("Course ID not found");

    formData.append("sectionId", modalData.sectionId);
    formData.append("courseId", course._id);
    formData.append("title", quizData.title);
    formData.append("type", "quiz");
    formData.append("quiz", JSON.stringify(quizData.quiz));

    if (edit) formData.append("subSectionId", modalData._id);

    try {
      const result = edit ? await updateSubSection(formData, token) : await createSubSection(formData, token);
      if (result) {
        dispatch(setCourse(result));
        setModalData(null);
        toast.success(edit ? "Quiz updated" : "Quiz created");
      }
    } catch (error) {
      toast.error("Quiz processing error");
    }
    setLoading(false);
  };
  const handleAssignmentSave = async (assignmentData) => {
    setLoading(true);
    const formData = new FormData();
    if (!course?._id) return toast.error("Course ID not found");

    formData.append("sectionId", modalData.sectionId);
    formData.append("courseId", course._id);
    formData.append("title", assignmentData.title);
    formData.append("type", "assignment");

    const assignmentPayload = {
      description: assignmentData.description,
      deadline: assignmentData.deadline,
    };
    formData.append("assignment", JSON.stringify(assignmentPayload));

    if (assignmentData.assignmentFile && typeof assignmentData.assignmentFile === "object") {
      formData.append("assignment", assignmentData.assignmentFile);
    }
    if (assignmentData.answerKey && typeof assignmentData.answerKey === "object") {
      formData.append("answerKey", assignmentData.answerKey);
    }

    if (edit) formData.append("subSectionId", modalData._id);

    try {
      const result = edit ? await updateSubSection(formData, token) : await createSubSection(formData, token);
      if (result) {
        dispatch(setCourse(result));
        setModalData(null);
        toast.success("Assignment saved");
      }
    } catch (error) {
      toast.error("Error saving assignment");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm px-4">
      <div className="my-10 w-full max-w-[700px] rounded-lg border border-richblack-400 bg-richblack-800 shadow-2xl">
        <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
          <p className="text-xl font-semibold text-richblack-5 uppercase tracking-wide">
            {view ? "Viewing" : add ? "Adding" : "Editing"} {modalType}
          </p>
          <button onClick={() => !loading && setModalData(null)}>
            <RxCross2 className="text-2xl text-richblack-5 hover:text-pink-200 transition-all" />
          </button>
        </div>

        <div className="p-6">
          {modalType === "quiz" ? (
            <QuizBuilder
              loading={loading}
              onSave={handleQuizSave}
              view={view}
              initialData={edit || view ? { title: modalData.title, questions: modalData.quiz?.questions || [] } : null}
            />
          ) : modalType === "assignment" ? (
            <AssignmentForm
              loading={loading}
              onSave={handleAssignmentSave}
              onCancel={() => setModalData(null)}
              view={view}
              edit={edit}
              initialData={edit || view ? {
                title: modalData.title,
                description: modalData.assignment?.description || modalData.description,
                deadline: modalData.assignment?.deadline,
                fileUrl: modalData.assignment?.fileUrl || modalData.fileUrl,
                answerKeyUrl: modalData.assignment?.answerKeyUrl,
              } : null}
              
            />
          ) : (
            <SlideForm
              loading={loading}
              onSave={handleCommonSave}
              onCancel={() => setModalData(null)}
              view={view}
              edit={edit}
              initialData={edit || view ? {
                title: modalData.title,
                description: modalData.description,
                fileUrl: modalData.slides?.[0]?.fileUrl || modalData.fileUrl,
              } : null}
            />
          )}
        </div>
      </div>
    </div>
  );
}