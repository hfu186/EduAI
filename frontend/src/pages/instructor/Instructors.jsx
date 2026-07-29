import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import Footer from "../../components/common/Layout/Footer";
import { getAllInstructors } from "../../services/operations/profileAPI";
import { createOrGetChat } from "../../services/operations/chatAPI.js";
import { FaLinkedin, FaEnvelope } from "react-icons/fa";
import { BiBookOpen } from "react-icons/bi";
import { motion } from "framer-motion";

const Instructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await getAllInstructors();
      if (res) setInstructors(res);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleMessage = async (e, instructorId) => {
    e.preventDefault();
    e.stopPropagation();
    const chat = await createOrGetChat(instructorId, token);
    if (chat) navigate(`/chat/${chat._id}`);
  };

  return (
    <div className="bg-richblack-900 min-h-screen flex flex-col font-inter">
      {/* HERO */}
      <div className="bg-richblack-800 py-16 border-b border-richblack-700">
        <div className="w-11/12 max-w-maxContent mx-auto flex flex-col items-center text-center">
          <h1 className="text-4xl font-bold text-white mb-4">World-Class Instructors</h1>
          <p className="text-richblack-300 max-w-[600px] text-lg">
            Learn from the best. Our instructors are industry experts,
            researchers, and passionate educators dedicated to your success.
          </p>
        </div>
      </div>

      {/* GRID */}
      <div className="w-11/12 max-w-maxContent mx-auto py-20">
        {loading ? (
          <div className="flex justify-center items-center h-[200px] text-white">
            Loading Instructors...
          </div>
        ) : instructors.length === 0 ? (
          <div className="text-center text-richblack-200 text-xl">No instructors found yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {instructors.map((inst, index) => (
              <Link to={`/instructor/${inst._id}`} key={inst._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group flex flex-col h-full bg-richblack-800 rounded-xl border border-richblack-700 overflow-hidden hover:shadow-[0_0_20px_rgba(255,214,10,0.2)] transition-all duration-200 hover:-translate-y-2"
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden flex-shrink-0">
                    <img
                      src={inst.image || `https://api.dicebear.com/5.x/initials/svg?seed=${inst.firstName}`}
                      alt={`${inst.firstName}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-richblack-900 to-transparent opacity-80" />
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1 capitalize truncate">
                      {inst.firstName} {inst.lastName}
                    </h3>
                    <p className="text-sm text-yellow-50 mb-4 font-medium truncate">{inst.email}</p>
                    <p className="text-richblack-300 text-sm line-clamp-3 mb-6 flex-1">
                      {inst.additionalDetails?.about ||
                        "An experienced instructor passionate about teaching and mentoring students."}
                    </p>

                    <div className="flex items-center justify-between border-t border-richblack-700 pt-4 mt-auto">
                      <div className="flex items-center gap-2 text-richblack-50 text-sm whitespace-nowrap">
                        <BiBookOpen className="text-yellow-25 text-lg" />
                        <span>{inst.courses?.length || 0} Courses</span>
                      </div>

                      <div className="flex gap-3 text-richblack-200">
                        <FaEnvelope
                          className="hover:text-white cursor-pointer transition-colors"
                          onClick={(e) => handleMessage(e, inst._id)}
                        />
                        <FaLinkedin className="hover:text-blue-200 cursor-pointer transition-colors" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Instructors;