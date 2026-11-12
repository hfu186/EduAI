import { useEffect, useState } from "react";
import { VscSignOut } from "react-icons/vsc";
import { HiMenuAlt1 } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { sidebarLinks } from "../../../../data/dashboard-links";
import { logout } from "../../../services/operations/authAPI";
import ConfirmationModal from "../../common/ConfirmationModal";
import SidebarLink from "./SidebarLink";
import Loading from "../../common/Loading";

import { setOpenSideMenu, setScreenSize } from "../../../slices/sidebarSlice";

export default function Sidebar() {
  const { user, loading: profileLoading } = useSelector(
    (state) => state.profile,
  );

  const { loading: authLoading } = useSelector((state) => state.auth);

  const { openSideMenu, screenSize } = useSelector((state) => state.sidebar);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [confirmationModal, setConfirmationModal] = useState(null);

  const isMobile = screenSize <= 640;

  useEffect(() => {
    const handleResize = () => {
      dispatch(setScreenSize(window.innerWidth));
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  useEffect(() => {
    dispatch(setOpenSideMenu(!isMobile));
  }, [isMobile, dispatch]);

  const handleLogout = () => {
    setConfirmationModal({
      text1: t("sidebar.logout_confirm"),
      text2: t("sidebar.logout_message"),
      btn1Text: t("sidebar.logout"),
      btn2Text: t("common.cancel"),
      btn1Handler: () => {
        setConfirmationModal(null);
        dispatch(logout(navigate));
      },
      btn2Handler: () => setConfirmationModal(null),
    });
  };

  const handleCloseSidebar = () => {
    if (isMobile) {
      dispatch(setOpenSideMenu(false));
    }
  };

  if (profileLoading || authLoading) {
    return (
      <div className="flex h-screen w-[260px] items-center justify-center border-r border-richblack-700 bg-richblack-900">
        <Loading />
      </div>
    );
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        aria-label={openSideMenu ? "Close sidebar" : "Open sidebar"}
        onClick={() => dispatch(setOpenSideMenu(!openSideMenu))}
        className="fixed left-4 top-4 z-[1100] flex h-10 w-10 items-center justify-center rounded-lg border border-richblack-600 bg-richblack-800 text-richblack-5 shadow-lg transition hover:bg-richblack-700 sm:hidden"
      >
        {openSideMenu ? <IoMdClose size={23} /> : <HiMenuAlt1 size={23} />}
      </button>

      {/* Mobile overlay */}
      {isMobile && openSideMenu && (
        <div
          onClick={handleCloseSidebar}
          className="fixed inset-0 z-[998] bg-black/60 backdrop-blur-[2px] sm:hidden"
        />
      )}

      {/* Sidebar */}
      {openSideMenu && (
        <aside
  className={`
    fixed left-0 top-[var(--navbar-height)] z-[999]
    flex h-[calc(100dvh-var(--navbar-height))] w-[260px]
    flex-col border-r border-richblack-700
    bg-richblack-900 shadow-xl
    sm:sticky sm:top-[var(--navbar-height)]
    sm:h-[calc(100dvh-var(--navbar-height))]
    sm:shadow-none
    ${isMobile ? "translate-x-0" : ""}
  `}
>
          {/* Brand */}
          {/* <div className="mt-4 flex h-[76px] items-center gap-3 border-b border-richblack-700 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 text-lg font-bold text-richblack-900">
              E
            </div>

            <div>
              <h2 className="text-lg font-bold tracking-wide text-richblack-5">
                EduSpace
              </h2>
              <p className="text-xs text-richblack-400">Learning Management</p>
            </div>
          </div> */}

          {/* User information */}
          <div className="mx-4 mt-8 flex items-center gap-3 rounded-xl bg-richblack-800 p-3">
            <img
              src={user?.image}
              alt="User avatar"
              className="h-10 w-10 rounded-full border border-richblack-600 object-cover"
            />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-richblack-5">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="truncate text-xs text-richblack-400">
                {user?.accountType}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-7 flex-1 overflow-y-auto px-3">
            <p className="mb-3 px-4 text-[11px] font-semibold uppercase tracking-[1.5px] text-richblack-500">
              Main Menu
            </p>

            <div className="flex flex-col gap-1">
              {sidebarLinks.map((link) => {
                const hasType = Array.isArray(link.type);

                if (
                  link.type &&
                  (hasType
                    ? !link.type.includes(user?.accountType)
                    : user?.accountType !== link.type)
                ) {
                  return null;
                }

                return (
                  <SidebarLink
                    key={link.id}
                    link={link}
                    iconName={link.icon}
                    setOpenSenu={handleCloseSidebar}
                  />
                );
              })}
            </div>
          </nav>

          {/* Bottom actions */}
          <div className="border-t border-richblack-700 px-3 py-5">
            <p className="mb-3 px-4 text-[11px] font-semibold uppercase tracking-[1.5px] text-richblack-500">
              Preferences
            </p>
            <div className="flex flex-col gap-1">
              <SidebarLink
                link={{
                  name: "settings",
                  path: "/dashboard/settings",
                }}
                iconName="VscSettingsGear"
                setOpenSenu={handleCloseSidebar}
              />
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="group mt-1 flex w-full items-center gap-2 rounded-lg px-8 py-3 text-sm font-medium text-richblack-300 transition-all duration-200 hover:bg-pink-900/20 hover:text-pink-200"
              >
                <VscSignOut className="text-xl transition-transform group-hover:-translate-x-1" />
                <span>{t("sidebar.logout")}</span>
              </button>

              <p className="mt-4 mb-3 px-4 text-[11px] text-richblack-600">
                © {new Date().getFullYear()} EduSpace
              </p>
            </div>
        </aside>
      )}

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  );
}
