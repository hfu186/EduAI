import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RxDropdownMenu } from "react-icons/rx";
import {
  MdEdit,
  MdDelete,
  MdQuiz,
  MdOndemandVideo,
  MdSlideshow,
  MdAssignment,
} from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { BiSolidDownArrow } from "react-icons/bi";

import {
  deleteSection,
  deleteSubSection,
} from "../../../../services/operations/courseDetailsAPI";
import { setCourse } from "../../../../slices/courseSlice";
import SubSectionModal from "../AddCourse/CourseInformation/SubSectionModal";
import ConfirmationModal from "../../../common/ConfirmationModal";

export default function NestedView({ handleChangeEditSectionName }) {
  const { course } = useSelector((state) => state.course);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // States quản lý Modal
  const [addSubSection, setAddSubSection] = useState(null);
  const [viewSubSection, setViewSubSection] = useState(null);
  const [editSubSection, setEditSubSection] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(null);

  const handleDeleteSection = async (sectionId) => {
    const result = await deleteSection(
      {
        sectionId,
        courseId: course._id,
      },
      token,
    );
    if (result) dispatch(setCourse(result));
    setConfirmationModal(null);
  };

  const handleDeleteSubSection = async (subSectionId, sectionId) => {
    const result = await deleteSubSection(
      {
        subSectionId,
        sectionId,
        courseId: course._id,
      },
      token,
    );
    if (result) dispatch(setCourse(result));
    setConfirmationModal(null);
  };

  return (
    <>
      <div
        className="rounded-lg bg-richblack-700 p-6 px-8 shadow-md border border-richblack-600"
        id="nestedViewContainer"
      >
        {course?.courseContent?.map((section) => (
          <details key={section._id} open className="group mb-4">
            {/* Header Section */}
            <summary className="flex cursor-pointer items-center justify-between border-b-2 border-b-richblack-600 py-3 transition-all duration-200">
              <div className="flex items-center gap-x-3">
                <RxDropdownMenu className="text-2xl text-richblack-50" />
                <p className="font-semibold text-lg text-richblack-50">
                  {section.sectionName}
                </p>
              </div>
              <div className="flex items-center gap-x-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleChangeEditSectionName(
                      section._id,
                      section.sectionName,
                    );
                  }}
                  title="Edit Section"
                >
                  <MdEdit className="text-xl text-richblack-300 hover:text-richblack-50 transition-all" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setConfirmationModal({
                      text1: "Delete this Section?",
                      text2: "All lectures inside will be deleted",
                      btn1Text: "Delete",
                      btn2Text: "Cancel",
                      btn1Handler: () => handleDeleteSection(section._id),
                      btn2Handler: () => setConfirmationModal(null),
                    });
                  }}
                  title="Delete Section"
                >
                  <MdDelete className="text-xl text-richblack-300 hover:text-[#ff0000] transition-all" />
                </button>
                <span className="font-medium text-richblack-300">|</span>
                <BiSolidDownArrow
                  className={`text-xl text-richblack-300 transition-all duration-200 group-open:rotate-180`}
                />
              </div>
            </summary>

            {/* Nội dung Section */}
            <div className="px-6 pb-4 pt-2">
              {/* Danh sách SubSection */}
              <div className="flex flex-col gap-y-2">
                {section.subSection.map((data) => (
                  <div
                    key={data?._id}
                    onClick={() => setViewSubSection(data)}
                    className="flex cursor-pointer items-center justify-between gap-x-3 border-b border-richblack-600 bg-richblack-800 p-3 rounded-md hover:bg-richblack-900 transition-all"
                  >
                    <div className="flex items-center gap-x-3">
                      {/* Icon tùy theo type */}
                      {data.type === "quiz" ? (
                        <MdQuiz
                          className="text-2xl text-caribbeangreen-200"
                          title="Quiz"
                        />
                      ) : data.type === "slide" ? (
                        <MdSlideshow
                          className="text-2xl text-blue-200"
                          title="Slide"
                        />
                      ) : data.type === "assignment" ? (
                        <MdAssignment
                          className="text-2xl text-red-200"
                          title="Assignment"
                        />
                      ) : (
                        <MdOndemandVideo
                          className="text-2xl text-yellow-50"
                          title="Lecture"
                        />
                      )}
                      <p className="font-semibold text-richblack-50">
                        {data.title}
                      </p>
                    </div>

                    <div
                      className="flex items-center gap-x-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          setEditSubSection({ ...data, sectionId: section._id })
                        }
                      >
                        <MdEdit className="text-xl text-richblack-300 hover:text-richblack-50 transition-all" />
                      </button>
                      <button
                        onClick={() =>
                          setConfirmationModal({
                            text1: "Delete this Item?",
                            text2: "This content will be deleted permanently",
                            btn1Text: "Delete",
                            btn2Text: "Cancel",
                            btn1Handler: () =>
                              handleDeleteSubSection(data._id, section._id),
                            btn2Handler: () => setConfirmationModal(null),
                          })
                        }
                      >
                        <MdDelete className="text-xl text-richblack-300 hover:text-[#ff0000] transition-all" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-richblack-600">
                <p className="text-sm text-richblack-300 mb-2 font-medium">
                  Add Content to This Section
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() =>
                      setAddSubSection({
                        sectionId: section._id,
                        type: "slide",
                      })
                    }
                    className="flex items-center justify-center gap-x-2 rounded-md border border-blue-200 bg-blue-900/20 py-2 px-3 text-blue-200 font-semibold hover:bg-blue-900/40 transition-all"
                  >
                    <MdSlideshow className="text-lg" />
                    <span>Slide</span>
                  </button>

                  <button
                    onClick={() =>
                      setAddSubSection({
                        sectionId: section._id,
                        type: "quiz",
                      })
                    }
                    className="flex items-center justify-center gap-x-2 rounded-md border border-caribbeangreen-200 bg-caribbeangreen-900/20 py-2 px-3 text-caribbeangreen-200 font-semibold hover:bg-caribbeangreen-900/40 transition-all"
                  >
                    <MdQuiz className="text-lg" />
                    <span>Quiz</span>
                  </button>

                  <button
                    onClick={() =>
                      setAddSubSection({
                        sectionId: section._id,
                        type: "assignment",
                      })
                    }
                    className="flex items-center justify-center gap-x-2 rounded-md border border-yellow-50 bg-yellow-900/20 py-2 px-3 text-yellow-50 font-semibold hover:bg-yellow-900/40 transition-all"
                  >
                    {" "}
                    <MdAssignment className="text-lg" />
                    <span>Assignment</span>
                  </button>
                </div>
              </div>
            </div>
          </details>
        ))}
      </div>

      {/* Render Modals */}
      {addSubSection ? (
        <SubSectionModal
          modalData={addSubSection}
          setModalData={setAddSubSection}
          add={true}
        />
      ) : null}
      {viewSubSection ? (
        <SubSectionModal
          modalData={viewSubSection}
          setModalData={setViewSubSection}
          view={true}
        />
      ) : null}
      {editSubSection ? (
        <SubSectionModal
          modalData={editSubSection}
          setModalData={setEditSubSection}
          edit={true}
        />
      ) : null}
      {confirmationModal ? (
        <ConfirmationModal modalData={confirmationModal} />
      ) : null}
    </>
  );
}
