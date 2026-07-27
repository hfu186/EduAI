import { useEffect, useState } from "react";
import { getInstructors } from "../../../../services/operations/adminAPI";
import { getInstructorProfile } from "../../../../services/operations/profileAPI";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

export default function InstructorList() {
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetch = async () => {
      const res = await getInstructors(token);
      if (res) setInstructors(res);
    };
    fetch();
  }, []);

  const openInstructorProfile = async (instructorId) => {
    setProfileLoading(true);
    const data = await getInstructorProfile(instructorId);
    if (!data) {
      toast.error("Could not fetch instructor profile");
      setProfileLoading(false);
      return;
    }
    setSelectedInstructor(data);
    setProfileLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-4">
        <h2 className="text-xl font-semibold text-richblack-5">Instructor List</h2>
        <p className="text-sm text-richblack-300 mt-1">
          View instructors and inspect their public profiles.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {instructors.map((ins) => (
          <div key={ins._id} className="bg-richblack-800 border border-richblack-700 p-4 rounded-xl text-center">
            <img src={ins.image} className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-yellow-50" alt="avatar" />
            <h4 className="font-bold text-lg text-white">{ins.firstName} {ins.lastName}</h4>
            <p className="text-sm text-richblack-400">{ins.email}</p>
            <div className="mt-4 pt-4 border-t border-richblack-700 flex justify-around">
              <div>
                <p className="text-yellow-50 font-bold text-xl">{ins.courses.length}</p>
                <p className="text-xs text-richblack-300">Courses</p>
              </div>
            </div>
            <button
              onClick={() => openInstructorProfile(ins._id)}
              className="mt-4 w-full bg-richblack-700 hover:bg-richblack-600 text-richblack-5 text-sm py-2 rounded-md transition-all"
            >
              {profileLoading ? "Loading..." : "View Profile"}
            </button>
          </div>
        ))}
      </div>

      {selectedInstructor && (
        <div className="fixed inset-0 z-[1000] bg-black/70 grid place-items-center p-4">
          <div className="w-full max-w-2xl bg-richblack-800 border border-richblack-700 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-richblack-5">
                {selectedInstructor.firstName} {selectedInstructor.lastName}
              </h3>
              <button
                onClick={() => setSelectedInstructor(null)}
                className="text-richblack-300 hover:text-richblack-5"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-richblack-900 rounded-lg p-4 border border-richblack-700">
                <p className="text-richblack-300">Email</p>
                <p className="text-richblack-5">{selectedInstructor.email}</p>
              </div>
              <div className="bg-richblack-900 rounded-lg p-4 border border-richblack-700">
                <p className="text-richblack-300">Contact</p>
                <p className="text-richblack-5">
                  {selectedInstructor.additionalDetails?.contactNumber || "N/A"}
                </p>
              </div>
              <div className="bg-richblack-900 rounded-lg p-4 border border-richblack-700">
                <p className="text-richblack-300">About</p>
                <p className="text-richblack-5">
                  {selectedInstructor.additionalDetails?.about || "No bio"}
                </p>
              </div>
              <div className="bg-richblack-900 rounded-lg p-4 border border-richblack-700">
                <p className="text-richblack-300">Stats</p>
                <p className="text-richblack-5">
                  Courses: {selectedInstructor.stats?.totalCourses || 0} | Students: {selectedInstructor.stats?.totalStudents || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}