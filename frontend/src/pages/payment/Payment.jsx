import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { formatVND } from "../../utils/formatVND";

export default function Payment() {
  const navigate = useNavigate();
  const { cart, total } = useSelector((state) => state.cart);
  const { t } = useTranslation();

  useEffect(() => {
    if (!cart || cart.length === 0) {
      toast.error(t("pages.payment.empty_cart"));
      navigate("/cart");
    }
  }, [cart, navigate, t]);

  if (!cart || cart.length === 0) return null;

  const handleCheckout = () => {
    navigate("/payment/qr", {
      state: { courses: cart, totalAmount: total },
    });
  };

  return (
    <div className="min-h-screen bg-richblack-900 px-4 py-10 text-richblack-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("pages.payment.checkout")}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-richblack-300 sm:text-base">
            {t("pages.payment.description")}
          </p>
        </div>

        {/* Checkout steps */}
        <div className="mb-10 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-50 text-sm font-bold text-richblack-900">
              1
            </span>
            <span className="text-sm font-medium text-yellow-50">
              {t("pages.payment.step_cart")}
            </span>
          </div>

          <div className="h-px flex-1 bg-richblack-600 sm:max-w-20" />

          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-50 text-sm font-bold text-richblack-900">
              2
            </span>
            <span className="text-sm font-medium text-yellow-50">
              {t("pages.payment.step_checkout")}
            </span>
          </div>

          <div className="h-px flex-1 bg-richblack-600 sm:max-w-20" />

          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-richblack-500 text-sm text-richblack-300">
              3
            </span>
            <span className="hidden text-sm text-richblack-400 sm:block">
              {t("pages.payment.step_payment")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          {/* Course list */}
          <section className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {t("pages.payment.course_summary")}
              </h2>

              <span className="rounded-full bg-richblack-800 px-3 py-1 text-xs font-medium text-richblack-200">
                {t("pages.payment.course_count", { count: cart.length })}
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-richblack-700 bg-richblack-800">
              {cart.map((course, index) => (
                <div
                  key={course._id}
                  className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center ${
                    index !== cart.length - 1
                      ? "border-b border-richblack-700"
                      : ""
                  }`}
                >
                  <img
                    src={course.thumbnail}
                    alt={course.courseName}
                    className="h-32 w-full rounded-lg object-cover sm:h-24 sm:w-40"
                  />

                  <div className="flex flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <span className="mb-2 inline-block rounded bg-yellow-50/10 px-2 py-1 text-xs font-medium text-yellow-100">
                        {t("pages.payment.course")}
                      </span>

                      <h3 className="font-semibold leading-6 text-richblack-5">
                        {course.courseName}
                      </h3>

                      <p className="mt-1 text-sm text-richblack-400">
                        {t("pages.payment.course_access")}
                      </p>
                    </div>

                    <p className="whitespace-nowrap text-lg font-semibold text-yellow-100">
                      {formatVND(course.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Note */}
            <div className="mt-5 flex gap-3 rounded-lg border border-richblack-700 bg-richblack-800/60 p-4">
              <span className="text-lg text-yellow-100">ⓘ</span>
              <p className="text-sm leading-6 text-richblack-300">
                {t("pages.payment.review_note")}
              </p>
            </div>
          </section>

          {/* Order summary */}
          <aside className="lg:sticky lg:top-8">
            <div className="overflow-hidden rounded-xl border border-richblack-700 bg-richblack-800">
              <div className="border-b border-richblack-700 p-6">
                <h2 className="text-xl font-semibold">
                  {t("pages.payment.order_summary")}
                </h2>
                <p className="mt-1 text-sm text-richblack-400">
                  {t("pages.payment.order_details")}
                </p>
              </div>

              <div className="space-y-5 p-6">
                <div className="flex justify-between text-sm">
                  <span className="text-richblack-300">
                    {t("pages.payment.total_courses")}
                  </span>
                  <span className="font-medium">{cart.length}</span>
                </div>

                <div className="border-t border-richblack-600 pt-5">
                  <p className="text-sm text-richblack-300">
                    {t("pages.payment.total_amount")}
                  </p>
                  <p className="flex justify-end items-end text-3xl font-bold tracking-tight text-yellow-100">
                    {formatVND(total)}
                  </p>
                </div>

                <button
                  onClick={handleCheckout}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-50 px-5 py-3 font-semibold text-richblack-900 transition duration-200 hover:bg-yellow-100 active:scale-[0.98]"
                >
                  {t("pages.payment.continue_payment")}
                  <span aria-hidden="true">→</span>
                </button>

                <button
                  onClick={() => navigate("/cart")}
                  className="w-full rounded-lg border border-richblack-600 px-5 py-3 text-sm font-medium text-richblack-200 transition hover:border-richblack-400 hover:bg-richblack-700"
                >
                  {t("pages.payment.back_to_cart")}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
