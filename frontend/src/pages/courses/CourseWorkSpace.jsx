/* eslint-disable no-unused-vars */
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import confetti from "canvas-confetti";
import Swal from "sweetalert2";
import withReactContent from 'sweetalert2-react-content'; 

import { getFullCourseDetails } from "@/services/operations/courseDetailsAPI";
import { setCompletedLectures, setTotalNoOfLectures } from "@/slices/viewCourseSlice";

import CourseSidebar from "@/components/core/LearnersCore/ViewCourse/CourseSideBar";
import SlideTab from "@/components/core/LearnersCore/ViewCourse/tabs/SlideTab";
import QuizTab from "@/components/core/LearnersCore/ViewCourse/tabs/QuizTab";
import AssignmentTab from "@/components/core/LearnersCore/ViewCourse/tabs/AssignmentTab";
import AIChatbot from "@/components/core/LearnersCore/ViewCourse/tabs/Chatbox";
import CertificateTemplate from "@/components/core/Auth/Settings/Certificates";

const MySwal = withReactContent(Swal);

function CourseWorkspace() {
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { completedLectures, totalNoOfLectures } = useSelector((state) => state.viewCourse);

  const [courseData, setCourseData] = useState(null);
  const [grouped, setGrouped] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastSlideId, setLastSlideId] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);

  const showCertificateModal = useCallback(() => {
    MySwal.fire({
      html: (
        <CertificateTemplate 
          userName={`${user?.firstName} ${user?.lastName}`}
          courseName={courseData?.courseName}
          certCode={`CERT-${courseId.substring(0, 8).toUpperCase()}`}
          date={new Date().toLocaleDateString()}
        />
      ),
      showConfirmButton: false,
      showCloseButton: true,
      background: "transparent",
      width: 'auto',
      customClass: {
        popup: 'bg-transparent shadow-none border-none'
      }
    });
  }, [user, courseData, courseId]);

  const fireConfetti = useCallback(() => {
    const end = Date.now() + 4 * 1000;
    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#FFD60A", "#1FA2FF"] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#FFD60A", "#1FA2FF"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  }, []);

  useEffect(() => {
    if (totalNoOfLectures > 0 && completedLectures.length === totalNoOfLectures) {
      fireConfetti();
      Swal.fire({
        title: "🎉 Excellent!",
        text: "You have completed the course. Would you like to view your certificate?",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "View Certificate",
        confirmButtonColor: "#FFD60A",
        background: "#161D29",
        color: "#F1F2FF",
      }).then((result) => {
        if (result.isConfirmed) showCertificateModal();
      });
    }
  }, [completedLectures.length, totalNoOfLectures, fireConfetti, showCertificateModal]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await getFullCourseDetails(courseId, token);
        if (response?.success) {
          const details = response.data?.courseDetails;
          setCourseData(details);
          const total = details.courseContent?.reduce((acc, sec) => acc + (sec.subSection?.length || 0), 0) || 0;
          dispatch(setTotalNoOfLectures(total));
          dispatch(setCompletedLectures(response.data?.completedSubSections || []));

          const groupedContent = { slide: [], assignment: [], quiz: [] };
          details.courseContent?.forEach(sec => sec.subSection?.forEach(sub => {
            if (groupedContent[sub.type]) groupedContent[sub.type].push({ ...sub, sectionName: sec.sectionName });
          }));
          setGrouped(groupedContent);
          const first = groupedContent.slide?.[0] || groupedContent.quiz?.[0] || null;
          setCurrentItem(first);
          if (first?.type === "slide") setLastSlideId(first._id);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchCourse();
  }, [courseId, token, dispatch]);

  if (loading) return <div className="grid place-items-center h-screen bg-richblack-900 text-white font-bold italic animate-pulse">Loading Workspace...</div>;

  return (
    <div className="flex h-screen bg-richblack-900 text-richblack-5 overflow-hidden">
      {lastSlideId && <AIChatbot token={token} subSectionId={lastSlideId} />}
      <CourseSidebar grouped={grouped} currentItem={currentItem} setCurrentItem={setCurrentItem} setActiveGroup={setActiveGroup} />
      <div className="flex-1 p-6 overflow-y-auto">
        {currentItem ? (
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 border-b border-richblack-700 pb-4">
              <p className="text-yellow-50 text-xs font-bold uppercase tracking-widest">{currentItem.sectionName}</p>
            </div>
            {currentItem.type === "slide" && <SlideTab slides={[currentItem]} courseId={courseId} subSectionId={currentItem._id} />}
            {currentItem.type === "assignment" && <AssignmentTab assignment={currentItem} courseId={courseId} subSectionId={currentItem._id} />}
            {currentItem.type === "quiz" && <QuizTab quizData={currentItem.quiz} courseId={courseId} subSectionId={currentItem._id} slideSubSectionId={lastSlideId} />}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-richblack-500">No content selected</div>
        )}
      </div>
    </div>
  );
}

export default CourseWorkspace;