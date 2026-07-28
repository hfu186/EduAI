import { Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import Home from "@/pages/public-pages/Home";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import UpdatePassword from "@/pages/auth/UpdatePassword";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import About from "@/pages/public-pages/About";
import Contact from "@/pages/public-pages/Contact";
import PageNotFound from "@/pages/public-pages/PageNotFound";
import CourseDetails from "@/pages/courses/CourseDetails";
import Catalog from "@/pages/courses/Catalog";
import Payment from "@/pages/payment/Payment";
import CourseWorkSpace from "@/pages/courses/CourseWorkSpace";
import OpenRoute from "@/components/core/Auth/OpenRoute";
import ProtectedRoute from "@/components/core/Auth/ProtectedRoute";
import AdminRoute from "@/pages/admin-pages/AdminRoute";
import Instructors from "@/pages/instructor/Instructors";
import Dashboard from "@/pages/public-pages/Dashboard";
import Admin from "@/pages/admin-pages/Admin";
import MyProfile from "@/components/core/Auth/MyProfile";
import Settings from "@/components/core/Auth/Settings/Settings";
import MyCourses from "@/components/core/LearnersCore/MyCourses";
import EditCourse from "@/components/core/Instructor/EditCourse/EditCourse";
import Instructor from "@/components/core/Instructor/Instructor";
import InstructorDetails from "@/pages/instructor/InstructorDetail";
import PaymentQR from "@/pages/payment/PaymentQR";
import Cart from "@/components/core/LearnersCore/Cart/Cart";
import EnrolledCourses from "@/components/core/LearnersCore/EnrolledCourses";
import AddCourse from "@/components/core/Instructor/AddCourse/AddCourse";
import AllCourses from "@/pages/courses/Courses";
import EnrolledCoursesStats from "@/components/core/Auth/Settings/Dashboard";
import { ACCOUNT_TYPE } from "@/utils/constants";
import Certificates from "@/components/core/Auth/Settings/Certificates";
import AdminPanel from "@/pages/admin-pages/AdminPanel";
import UserManagement from "@/pages/admin-pages/UserManagement";
import CourseApproval from "@/pages/admin-pages/CourseApproval";
import InstructorList from "@/pages/admin-pages/InstructorManagement";
import AdminCategoryManager from "@/pages/admin-pages/CategoryManagement";
import AssignmentSubmit from "@/components/core/Instructor/InstructorCourses/AssignmentSubmit";
import CourseContent from "@/components/core/Instructor/InstructorCourses/CourseContent";
import InstructorRequest from "@/components/core/Auth/InstructorRequest";

function AppRoutes() {
  const { user } = useSelector((state) => state.profile);

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
      <Route path="/catalog/:catalogName" element={<Catalog />} />
      <Route path="/course/:courseId" element={<CourseDetails />} />
      <Route path="/all-courses" element={<AllCourses />} />
      <Route
        path="signup"
        element={
          <OpenRoute>
            <Signup />
          </OpenRoute>
        }
      />
      <Route
        path="login"
        element={
          <OpenRoute>
            <Login />
          </OpenRoute>
        }
      />
      <Route path="/profile/all-instructors" element={<Instructors />} />
      <Route path="/instructor/:instructorId" element={<InstructorDetails />} />

      <Route
        path="forgot-password"
        element={
          <OpenRoute>
            <ForgotPassword />
          </OpenRoute>
        }
      />
      <Route path="/payment" element={<Payment />} />
      <Route path="/payment/qr" element={<PaymentQR />} />

      <Route
        path="verify-email"
        element={
          <OpenRoute>
            <VerifyEmail />
          </OpenRoute>
        }
      />
      <Route
        path="course-workspace/:courseId"
        element={
          <ProtectedRoute>
            <CourseWorkSpace />
          </ProtectedRoute>
        }
      />

      <Route
        path="update-password/:id"
        element={
          <OpenRoute>
            <UpdatePassword />
          </OpenRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard/my-profile" element={<MyProfile />} />
        <Route path="dashboard/settings" element={<Settings />} />
        <Route path="dashboard/cart" element={<Cart />} />
        <Route path="dashboard/request-instructor" element={<InstructorRequest />} />

        {user?.accountType === ACCOUNT_TYPE.STUDENT && (
          <>
            <Route
              path="dashboard/enrolled-courses"
              element={<EnrolledCourses />}
            />
            <Route
              path="dashboard/learning-stats"
              element={<EnrolledCoursesStats />}
            />
            <Route path="dashboard/certificates" element={<Certificates />} />
          </>
        )}
        {user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
          <>
            <Route path="dashboard/instructor" element={<Instructor />} />
            <Route path="dashboard/add-course" element={<AddCourse />} />
            <Route path="dashboard/my-courses" element={<MyCourses />} />
            <Route
              path="dashboard/edit-course/:courseId"
              element={<EditCourse />}
            />
            <Route
              path="dashboard/course/:courseId"
              element={<CourseContent />}
            />
            <Route
              path="dashboard/course/:courseId/assignment/:assignmentId"
              element={<AssignmentSubmit />}
            />
          </>
        )}
      </Route>

      <Route
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      >
        <Route path="admin/admin-panel" element={<AdminPanel />} />
        <Route path="admin/manage-users" element={<UserManagement />} />
        <Route path="admin/approve-courses" element={<CourseApproval />} />
        <Route path="admin/manage-instructors" element={<InstructorList />} />
        <Route
          path="admin/manage-categories"
          element={<AdminCategoryManager />}
        />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

export default AppRoutes;
