import { Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import UpdatePassword from "../pages/UpdatePassword";
import VerifyEmail from "../pages/VerifyEmail";
import About from "../pages/About";
import Contact from "../pages/Contact";
import PageNotFound from "../pages/PageNotFound";
import CourseDetails from "../pages/CourseDetails";
import Catalog from "../pages/Catalog";
import Payment from "../pages/Payment";
import CourseWorkSpace from "../pages/CourseWorkSpace";
import OpenRoute from "../components/core/Auth/OpenRoute";
import ProtectedRoute from "../components/core/Auth/ProtectedRoute";
import AdminRoute from "../components/core/Auth/AdminRoute";
import Instructors from "../pages/Instructors";
import Dashboard from "../pages/Dashboard";
import Admin from "../pages/Admin";
import MyProfile from "../components/core/Dashboard/MyProfile";
import Settings from "../components/core/Dashboard/Settings/Settings";
import MyCourses from "../components/core/Dashboard/MyCourses";
import EditCourse from "../components/core/Dashboard/EditCourse/EditCourse";
import Instructor from "../components/core/Dashboard/Instructor";
import InstructorDetails from "../pages/InstructorDetail";
import PaymentQR from "../pages/PaymentQR";
import Cart from "../components/core/Dashboard/Cart/Cart";
import EnrolledCourses from "../components/core/Dashboard/EnrolledCourses";
import AddCourse from "../components/core/Dashboard/AddCourse/AddCourse";
import AllCourses from "../pages/Courses";
import EnrolledCoursesStats from "../components/core/Dashboard/Settings/Dashboard";
import { ACCOUNT_TYPE } from "../utils/constants";
import Certificates from "../components/core/Dashboard/Settings/Certificates";
import AdminPanel from "../components/core/Dashboard/Admin/AdminPanel";
import UserManagement from "../components/core/Dashboard/Admin/UserManagement";
import CourseApproval from "../components/core/Dashboard/Admin/CourseApproval";
import InstructorList from "../components/core/Dashboard/Admin/InstructorManagement";
import AdminCategoryManager from "../components/core/Dashboard/Admin/CategoryManagement";
import AssignmentSubmit from "../components/core/Dashboard/InstructorCourses/AssignmentSubmit";
import CourseContent from "../components/core/Dashboard/InstructorCourses/CourseContent";

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
