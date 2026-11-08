
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import RenderCartCourses from "./RenderCartCourses";
import RenderTotalAmount from "./RenderTotalAmount";

export default function Cart() {
  const { totalItems } = useSelector((state) => state.cart);
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-richblack-900 px-4 py-10 text-richblack-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-4">
          <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {t("cart.title")}
          </h1>
          <p className="text-sm text-richblack-300 sm:text-base">
            {t("cart.description")}
          </p>
        </div>

        {/* Cart progress */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-50 text-sm font-bold text-richblack-900">
              1
            </span>
            <span className="text-sm font-medium text-yellow-50">
              {t("pages.payment.step_cart")}
            </span>
          </div>

          <div className="h-px max-w-20 flex-1 bg-richblack-600" />

          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-richblack-500 text-sm text-richblack-400">
              2
            </span>
            <span className="text-sm text-richblack-400">
              {t("pages.payment.step_checkout")}
            </span>
          </div>

          <div className="h-px max-w-20 flex-1 bg-richblack-600" />

          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-richblack-500 text-sm text-richblack-400">
              3
            </span>
            <span className="hidden text-sm text-richblack-400 sm:block">
              {t("pages.payment.step_payment")}
            </span>
          </div>
        </div>

        {/* Cart content */}
        <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-richblack-700 pb-5">
            <div>
              <h2 className="text-xl font-semibold">
                {t("cart.title")}
              </h2>
              <p className="mt-1 text-sm text-richblack-400">
                {t("cart.courses_count", { count: totalItems })}
              </p>
            </div>

            <span className="rounded-full bg-yellow-50/10 px-3 py-1.5 text-xs font-medium text-yellow-100">
              {t("cart.courses_count", { count: totalItems })}
            </span>
          </div>

          {totalItems > 0 ? (
            <div className="flex flex-col-reverse items-start gap-8 lg:flex-row">
              <div className="min-w-0 flex-1">
                <RenderCartCourses />
              </div>

              <div className="w-full shrink-0 lg:sticky lg:top-8 lg:w-[320px]">
                <RenderTotalAmount />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-richblack-700 text-4xl">
                <span>🛒</span>
              </div>

              <h3 className="text-xl font-semibold text-richblack-5">
                {t("cart.empty")}
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-richblack-300">
                {t("cart.empty_description")}
              </p>

              <button
                onClick={() => navigate("/catalog")}
                className="mt-6 rounded-lg bg-yellow-50 px-6 py-3 font-semibold text-richblack-900 transition hover:bg-yellow-100"
              >
                {t("cart.explore_courses")}
              </button>
            </div>
          )}
        </div>

        {/* Footer note */}
        {totalItems > 0 && (
          <p className="mt-5 text-center text-xs text-richblack-400">
            {t("cart.footer_note")}
          </p>
        )}
      </div>
    </div>
  );
}
