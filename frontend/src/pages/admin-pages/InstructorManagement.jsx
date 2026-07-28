import { useEffect, useState } from "react";
import { getInstructorRequests, getInstructors, reviewInstructorRequest } from "@/services/operations/adminAPI";
import { getInstructorProfile } from "@/services/operations/profileAPI";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

export default function InstructorList() {
  const [requests, setRequests] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [, setProfileLoading] = useState(false);
  const { token } = useSelector((state) => state.auth);

  const fetchData = async () => {
    const [reqRes, insRes] = await Promise.all([
      getInstructorRequests(token),
      getInstructors(token),
    ]);
    if (reqRes) setRequests(reqRes);
    if (insRes) setInstructors(insRes);
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const openInstructorProfile = async (instructorId) => {
    setProfileLoading(true);
    const data = await getInstructorProfile(instructorId);
    if (!data) {
      toast.error("Unable to load instructor profile");
      setProfileLoading(false);
      return;
    }
    setSelectedInstructor(data);
    setProfileLoading(false);
  };

  const handleReview = async (userId, decision) => {
    const result = await reviewInstructorRequest(userId, decision, token);
    if (result?.success) {
      toast.success(decision === "approved" ? "Request approved successfully" : "Request rejected successfully");
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-4">
        <h2 className="text-3xl font-bold text-richblack-5">  Instructor Request Management
        </h2>
        <p className="text-sm text-richblack-300 mt-1">
          Review user profiles and approve or reject instructor applications.
        </p>
      </div>

      <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-richblack-5 mb-3">  Pending Requests
        </h3>
        {requests.length === 0 ? (
          <p className="text-sm text-richblack-400">  There are no pending instructor requests.
          </p>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req._id} className="rounded-lg border border-richblack-700 bg-richblack-900 p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-richblack-5">{req.firstName} {req.lastName}</p>
                    <p className="text-sm text-richblack-400">{req.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openInstructorProfile(req._id)}
                      className="rounded-md bg-richblack-700 px-3 py-2 text-sm text-richblack-5 hover:bg-richblack-600"
                    >
                      View profile
                    </button>
                    <button
                      onClick={() => handleReview(req._id, "rejected")}
                      className="rounded-md border border-richblack-600 px-3 py-2 text-sm text-richblack-300 hover:bg-richblack-700"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleReview(req._id, "approved")}
                      className="rounded-md bg-yellow-500 px-3 py-2 text-sm font-semibold text-richblack-900 hover:bg-yellow-400"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-richblack-5 mb-3">Instructor List</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {instructors.map((ins) => (
            <div key={ins._id} className="bg-richblack-900 border border-richblack-700 p-4 rounded-xl text-center">
              <img src={ins.image} className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-yellow-50" alt="avatar" />
              <h4 className="font-bold text-lg text-white">{ins.firstName} {ins.lastName}</h4>
              <p className="text-sm text-richblack-400">{ins.email}</p>
              <div className="mt-4 pt-4 border-t border-richblack-700 flex justify-around">
                <div>
                  <p className="text-yellow-50 font-bold text-xl">{ins.courses?.length || 0}</p>
                  <p className="text-xs text-richblack-300">Courses</p>
                </div>
              </div>
              <button
                onClick={() => openInstructorProfile(ins._id)}
                className="mt-4 w-full bg-richblack-700 hover:bg-richblack-600 text-richblack-5 text-sm py-2 rounded-md transition-all"
              >
                Xem hồ sơ
              </button>
            </div>
          ))}
        </div>
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
                <p className="text-richblack-300">Phone Number</p>
                <p className="text-richblack-5">
                  {selectedInstructor.additionalDetails?.contactNumber || "N/A"}
                </p>
              </div>
              <div className="bg-richblack-900 rounded-lg p-4 border border-richblack-700">
                <p className="text-richblack-300">Bio</p>
                <p className="text-richblack-5">
                  {selectedInstructor.additionalDetails?.about || "No bio provided"}
                </p>
              </div>
              <div className="bg-richblack-900 rounded-lg p-4 border border-richblack-700">
                <p className="text-richblack-300">Statistics</p>
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