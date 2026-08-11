import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const res = await getAllInstructors();

      if (res) {
        setInstructors(res);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleMessage = async (e, instructorId) => {
    e.preventDefault();
    e.stopPropagation();

    const chat = await createOrGetChat(instructorId, token);

    if (chat) {
      navigate(`/chat/${chat._id}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-richblack-900 font-inter">
      {/* HERO */}
      <div className="border-b border-richblack-700 bg-richblack-800 py-16">
        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col items-center text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">
            {t("pages.instructors.hero_title")}
          </h1>

          <p className="max-w-[600px] text-lg text-richblack-300">
            {t("pages.instructors.hero_description")}
          </p>
        </div>
      </div>

      {/* GRID */}
      <div className="mx-auto w-11/12 max-w-maxContent py-20">
        {loading ? (
          <div className="flex h-[200px] items-center justify-center text-white">
            {t("pages.instructors.loading")}
          </div>
        ) : instructors.length === 0 ? (
          <div className="text-center text-xl text-richblack-200">
            {t("pages.instructors.none")}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {instructors.map((inst, index) => (
              <Link
                to={`/instructor/${inst._id}`}
                key={inst._id}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-richblack-700 bg-richblack-800 transition-all duration-200 hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(255,214,10,0.2)]"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] w-full flex-shrink-0 overflow-hidden">
                    <img
                      src={
                        inst.image ||
                        `https://api.dicebear.com/5.x/initials/svg?seed=${inst.firstName}`
                      }
                      alt={inst.firstName}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-richblack-900 to-transparent opacity-80" />
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="mb-1 truncate text-xl font-semibold capitalize text-white">
                      {inst.firstName} {inst.lastName}
                    </h3>

                    <p className="mb-4 truncate text-sm font-medium text-yellow-50">
                      {inst.email}
                    </p>

                    <p className="mb-6 line-clamp-3 flex-1 text-sm text-richblack-300">
                      {inst.additionalDetails?.about ||
                        t("pages.instructor_detail.bio_default")}
                    </p>

                    {/* Bottom */}
                    <div className="mt-auto flex items-center justify-between border-t border-richblack-700 pt-4">
                      <div
                        className="flex items-center gap-2 whitespace-nowrap text-sm text-richblack-50"
                        title={t("pages.instructors.courses_label")}
                      >
                        <BiBookOpen className="text-lg text-yellow-25" />

                        <span>
                          {inst.courses?.length || 0}{" "}
                          {t("pages.instructors.courses_label")}
                        </span>
                      </div>

                      <div className="flex gap-3 text-richblack-200">
                        <button
                          type="button"
                          title={t("pages.instructors.message_action")}
                          aria-label={t("pages.instructors.message_action")}
                          className="transition-colors hover:text-white"
                          onClick={(e) => handleMessage(e, inst._id)}
                        >
                          <FaEnvelope />
                        </button>

                        <button
                          type="button"
                          title="LinkedIn"
                          aria-label="LinkedIn"
                          className="cursor-pointer transition-colors hover:text-blue-200"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <FaLinkedin />
                        </button>
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