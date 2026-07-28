import { ACCOUNT_TYPE } from './../src/utils/constants';

export const sidebarLinks = [
  {
    id: 1,
    name: "My Profile",
    path: "/dashboard/my-profile",
    icon: "VscAccount",
  },
  {
    id: 2,
    name: "Dashboard",
    path: "/dashboard/instructor",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscDashboard",
  },
  {
    id: 3,
    name: "My Courses",
    path: "/dashboard/my-courses",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscVm",
  },
  {
    id: 4,
    name: "Add Course",
    path: "/dashboard/add-course",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscAdd",
  },
  {
    id: 5,
    name: "Enrolled Courses",
    path: "/dashboard/enrolled-courses",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscMortarBoard",
  },

  {
    id: 6,
    name: "Learning Stats",
    path: "/dashboard/learning-stats",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscGraphLine",
  },
  {
    id: 12,
    name: "Instructor Request",
    path: "/dashboard/request-instructor",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscAccount",
  },


  {
    id: 7,
    name: "Admin Panel",
    path: "/admin/admin-panel",
    type: ACCOUNT_TYPE.ADMIN,
    icon: "VscDashboard",
  },
  {
    id: 8,
    name: "Manage Users",
    path: "/admin/manage-users",
    type: ACCOUNT_TYPE.ADMIN,
    icon: "VscOrganization",
  },
  {
    id: 9,
    name: "Approve Courses",
    path: "/admin/approve-courses",
    type: ACCOUNT_TYPE.ADMIN,
    icon: "VscChecklist",
  },
  {
    id: 10,
    name: "Manage Instructors",
    path: "/admin/manage-instructors",
    type: ACCOUNT_TYPE.ADMIN,
    icon: "VscAccount",
  },
  {
    id: 11,
    name: "Manage Categories",
    path: "/admin/manage-categories",
    type: ACCOUNT_TYPE.ADMIN,
    icon: "VscAccount",
  },
];
