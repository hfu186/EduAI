import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { MdEdit, MdDelete } from "react-icons/md"
import { RiArrowDownSLine } from "react-icons/ri"
import { AiOutlinePlus } from "react-icons/ai"
import { setCourse } from "../../../../../slices/courseSlice"
import { 
  deleteSection, 
  deleteSubSection,
  updateSection 
} from "../../../../../services/operations/courseDetailsAPI"
import ConfirmationModal from "../../../../common/ConfirmationModal"
import SubSectionModal from "./SubSectionModal"

export default function SectionView({ section }) {
  const dispatch = useDispatch()
  const { course } = useSelector((state) => state.course)
  const { token } = useSelector((state) => state.auth)
  const [editSectionName, setEditSectionName] = useState(null)
  const [viewSubSection, setViewSubSection] = useState(null)
  const [addSubSection, setAddSubSection] = useState(null)
  const [editSubSection, setEditSubSection] = useState(null)
  const [confirmationModal, setConfirmationModal] = useState(null)

  // Toggle collapse section
  const handleToggle = () => {
    setViewSubSection(viewSubSection === section._id ? null : section._id)
  }
  const handleDeleteSection = async () => {
    const result = await deleteSection({
      sectionId: section._id,
      courseId: course._id,
    }, token)

    if (result) {
      dispatch(setCourse(result))
    }
    setConfirmationModal(null)
  }

  // Delete SubSection
  const handleDeleteSubSection = async (subSectionId) => {
    const result = await deleteSubSection({
      subSectionId,
      sectionId: section._id,
      courseId: course._id,
    }, token)

    if (result) {
      dispatch(setCourse(result))
    }
    setConfirmationModal(null)
  }

  // Update Section Name
  const handleUpdateSectionName = async () => {
    if (editSectionName === section.sectionName) {
      setEditSectionName(null)
      return
    }

    const result = await updateSection(
      {
        sectionId: section._id,
        sectionName: editSectionName,
        courseId: course._id,
      },
      token
    )

    if (result) {
      dispatch(setCourse(result))
      setEditSectionName(null)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleUpdateSectionName()
    }
  }

  return (
    <div className="rounded-md border border-richblack-600 bg-richblack-700">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-x-3 border-b border-richblack-600 p-5">
        <div className="flex items-center gap-x-3 flex-1">
          <RiArrowDownSLine
            className={`text-2xl text-richblack-300 cursor-pointer transition-transform ${
              viewSubSection === section._id ? "rotate-180" : ""
            }`}
            onClick={handleToggle}
          />

          {editSectionName !== null && editSectionName !== undefined ? (
            <input
              type="text"
              value={editSectionName}
              onChange={(e) => setEditSectionName(e.target.value)}
              onBlur={handleUpdateSectionName}
              onKeyPress={handleKeyPress}
              className="w-full bg-richblack-600 px-3 py-2 text-richblack-5 rounded-md"
              autoFocus
            />
          ) : (
            <p className="font-semibold text-richblack-5">
              {section.sectionName}
            </p>
          )}
        </div>

        <div className="flex items-center gap-x-3">
          {/* Edit Section Name */}
          <button
            onClick={() => setEditSectionName(section.sectionName)}
            className="text-richblack-300 hover:text-richblack-50"
          >
            <MdEdit className="text-xl" />
          </button>

          {/* Delete Section */}
          <button
            onClick={() =>
              setConfirmationModal({
                text1: "Delete this Section?",
                text2: "All lectures in this section will be deleted",
                btn1Text: "Delete",
                btn2Text: "Cancel",
                btn1Handler: handleDeleteSection,
                btn2Handler: () => setConfirmationModal(null),
              })
            }
            className="text-richblack-300 hover:text-richblack-50"
          >
            <MdDelete className="text-xl" />
          </button>

          <span className="text-richblack-400">|</span>

          {/* Add Lecture */}
          <button
            onClick={() => setAddSubSection(section._id)}
            className="flex items-center gap-x-2 text-yellow-50 hover:text-yellow-100"
          >
            <AiOutlinePlus className="text-lg" />
            <span className="text-sm">Add Lecture</span>
          </button>
        </div>
      </div>

      {/* SubSections List */}
      {viewSubSection === section._id && (
        <div className="p-5">
          {section.subSection?.length > 0 ? (
            <div className="space-y-2">
              {section.subSection.map((subSec) => (
                <div
                  key={subSec._id}
                  className="flex items-center justify-between gap-x-3 border-b border-richblack-600 pb-2"
                >
                  <div className="flex items-center gap-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-richblack-600 text-richblack-5">
                      📹
                    </div>
                    <p className="text-richblack-5">{subSec.title}</p>
                  </div>

                  <div className="flex items-center gap-x-3">
                    {/* Edit SubSection */}
                    <button
                      onClick={() => setEditSubSection({
                        ...subSec,
                        sectionId: section._id,
                      })}
                      className="text-richblack-300 hover:text-richblack-50"
                    >
                      <MdEdit className="text-lg" />
                    </button>

                    {/* Delete SubSection */}
                    <button
                      onClick={() =>
                        setConfirmationModal({
                          text1: "Delete this Lecture?",
                          text2: "This lecture will be permanently deleted",
                          btn1Text: "Delete",
                          btn2Text: "Cancel",
                          btn1Handler: () => handleDeleteSubSection(subSec._id),
                          btn2Handler: () => setConfirmationModal(null),
                        })
                      }
                      className="text-richblack-300 hover:text-richblack-50"
                    >
                      <MdDelete className="text-lg" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-richblack-400 text-sm">
              No lectures added yet. Click "Add Lecture" to get started.
            </p>
          )}
        </div>
      )}

      {/* Modals */}
      {addSubSection && (
        <SubSectionModal
          modalData={addSubSection}
          setModalData={setAddSubSection}
          add={true}
        />
      )}

      {editSubSection && (
        <SubSectionModal
          modalData={editSubSection}
          setModalData={setEditSubSection}
          edit={true}
        />
      )}

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  )
}