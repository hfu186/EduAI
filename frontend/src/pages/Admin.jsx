import { useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import Sidebar from "../components/core/Dashboard/Sidebar";
import Loading from "../components/common/Loading";

const Admin = () => {
  const { loading: authLoading } = useSelector((state) => state.auth);
  const { loading: profileLoading } = useSelector((state) => state.profile);
  const contentRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [location.pathname]);

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
      <div ref={contentRef} className="overflow-auto w-full">
        <div className="mx-auto w-11/12 max-w-[1000px] py-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Admin;
