import SubSectionModal from "../AddCourse/CourseInformation/SubSectionModal"

export default function SectionCard({ section }) {
  return (
    <div className="bg-richblack-800 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg text-richblack-5 font-semibold">
          {section.sectionName}
        </h3>

        <button className="text-yellow-50 text-sm">
          + Add Content
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {section.subSection.map(sub => (
          <div
            key={sub._id}
            className="bg-richblack-700 px-3 py-2 rounded-md text-sm text-richblack-200"
          >
            {sub.title} ({sub.type})
          </div>
        ))}
      </div>
    </div>
  )
}
