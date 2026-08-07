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
      navigate("/dashboard/cart");
    }
  }, [cart, navigate, t]);

  if (!cart || cart.length === 0) return null;

  return (
    <div className="min-h-screen bg-richblack-900 text-richblack-5 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold">{t("pages.payment.checkout")}</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl bg-richblack-800 p-6">
            <h2 className="mb-4 text-xl font-semibold">
              {t("pages.payment.course_summary")}
            </h2>

            <div className="flex flex-col gap-4">
              {cart.map((course) => (
                <div
                  key={course._id}
                  className="flex gap-4 rounded-lg bg-richblack-700 p-4"
                >
                  <img
                    src={course.thumbnail}
                    alt={course.courseName}
                    className="h-20 w-32 rounded-md object-cover"
                  />

                  <div className="flex flex-1 flex-col justify-between">
                    <p className="text-lg font-semibold">{course.courseName}</p>

                    <p className="text-right text-yellow-100">{formatVND(course.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-richblack-800 p-6">
            <h2 className="mb-4 text-xl font-semibold">{t("pages.payment.order_summary")}</h2>

            <div className="flex justify-between">
              <span>{t("pages.payment.total_courses")}</span>
              <span>{cart.length}</span>
            </div>

            <div className="my-4 border-t border-richblack-600"></div>

            <div className="flex justify-between text-lg font-semibold">
              <span>{t("pages.payment.total_amount")}</span>
              <span className="text-yellow-100">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(total)}
              </span>
            </div>

            <button
              onClick={() =>
                navigate("/payment/qr", {
                  state: { courses: cart },
                })
              }
              className="yellowButton mt-6 w-full"
            >
              {t("pages.payment.checkout_button")}
            </button>

            <button
              onClick={() => navigate("/dashboard/cart")}
              className="mt-3 w-full rounded-lg border border-richblack-600 py-2"
            >
              {t("pages.payment.back_to_cart")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
