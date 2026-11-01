import {  useRef } from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";

import Sidebar from "@/components/common/Layout/Sidebar";
import Loading from "@/components/common/Loading";

const Dashboard = () => {
  const { loading: authLoading } = useSelector((state) => state.auth);
  const { loading: profileLoading } = useSelector((state) => state.profile);
  const contentRef = useRef(null);


  if (profileLoading || authLoading) {
    return (
      <div className="mt-10">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex w-full bg-[#000814] text-richblack-5">
      <Sidebar />
      <div ref={contentRef} className="min-w-0 flex-1 overflow-auto">
        <div className="mx-auto w-11/12 py-5">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
