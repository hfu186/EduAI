
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { QRCodeCanvas } from "qrcode.react";

import { resetCart } from "../../slices/cartSlice";
import { apiConnector } from "../../services/apiConnector";
import { studentEndpoints } from "../../services/apis";
import { formatVND } from "../../utils/formatVND";

export default function PaymentQR() {
  const {
    CREATE_QR_PAYMENT_API,
    CHECK_QR_PAYMENT_STATUS_API,
  } = studentEndpoints;

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const { t } = useTranslation();

  const coursesId =
    location.state?.coursesId?.length > 0
      ? location.state.coursesId
      : cart.map((course) => course._id);

  const courses = cart.filter((course) =>
    coursesId.includes(course._id)
  );

  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingPayment, setCheckingPayment] = useState(true);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!coursesId.length) {
      toast.error(t("pages.payment_qr.no_courses_selected"));
      navigate("/dashboard/cart", { replace: true });
      return;
    }

    const createPayOS = async () => {
      try {
        const res = await apiConnector(
          "POST",
          CREATE_QR_PAYMENT_API,
          { coursesId },
          { Authorization: `Bearer ${token}` }
        );

        const data = res.data;

        if (!data?.checkoutUrl || !data?.qrCode) {
          throw new Error("Invalid payment response");
        }

        setPaymentData(data);
      } catch (err) {
        console.error(
          "PAYMENT ERROR:",
          err.response?.data || err.message
        );

        toast.error(
          err.response?.data?.message ||
          t("pages.payment_qr.create_error")
        );

        navigate("/dashboard/cart", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    createPayOS();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!paymentData?.orderCode) return;

    intervalRef.current = setInterval(async () => {
      try {
        const statusRes = await apiConnector(
          "GET",
          `${CHECK_QR_PAYMENT_STATUS_API}/${paymentData.orderCode}`,
          null,
          { Authorization: `Bearer ${token}` }
        );

        const { status } = statusRes.data;

        if (status === "PAID" || status === "SUCCESS") {
          clearInterval(intervalRef.current);
          setCheckingPayment(false);

          toast.success(t("pages.payment_qr.payment_success"));

          dispatch(resetCart());
          navigate("/dashboard/enrolled-courses", {
            replace: true,
          });
        }
      } catch (error) {
        console.error(
          "Error checking payment status:",
          error.response?.data || error.message
        );
      }
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    paymentData,
    navigate,
    token,
    dispatch,
    t,
    CHECK_QR_PAYMENT_STATUS_API,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-richblack-900 px-4">
        <div className="flex flex-col items-center gap-5">
          <div className="relative h-14 w-14">
            <div className="h-14 w-14 rounded-full border-4 border-richblack-700" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-yellow-50 border-t-transparent" />
          </div>

          <p className="text-sm font-medium text-richblack-200">
            {t("pages.payment_qr.creating_gateway")}
          </p>
        </div>
      </div>
    );
  }

  if (!paymentData) return null;

  return (
    <div className="min-h-screen bg-richblack-900 px-4 py-10 text-richblack-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("pages.payment_qr.title")}
          </h1>

          <p className="mt-3 text-sm text-richblack-300 sm:text-base">
            {t("pages.payment_qr.description")}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6 flex items-center gap-3">
          {[
            t("pages.payment.step_cart"),
            t("pages.payment.step_checkout"),
            t("pages.payment.step_payment"),
          ].map(
            (step, index) => (
              <div key={step} className="flex flex-1 items-center gap-2">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    index < 2
                      ? "bg-yellow-50 text-richblack-900"
                      : "bg-yellow-50 text-richblack-900"
                  }`}
                >
                  {index + 1}
                </span>

                <span className="hidden text-sm font-medium text-yellow-50 sm:block">
                  {step}
                </span>

                {index < 2 && (
                  <div className="h-px flex-1 bg-richblack-600" />
                )}
              </div>
            )
          )}
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">

          {/* QR payment */}
          <section className="lg:col-span-2">
            <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-6 sm:p-8">

              <div className="mb-7 border-b border-richblack-700 pb-5">
                <h2 className="text-xl font-semibold">
                  {t("pages.payment_qr.title")}
                </h2>

                <p className="mt-2 text-sm text-richblack-400">
                  {t("pages.payment_qr.scan_description")}
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="rounded-2xl border border-richblack-700 bg-white p-4 shadow-xl">
                  <QRCodeCanvas
                    value={paymentData.qrCode}
                    size={220}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="M"
                    includeMargin={false}
                  />
                </div>

                <p className="mt-5 text-sm font-medium text-richblack-200">
                  {t("pages.payment_qr.qr_caption")}
                </p>

                <p className="mt-2 max-w-sm text-center text-xs leading-5 text-richblack-400">
                  {t("pages.payment_qr.qr_instructions")}
                </p>
              </div>

              <div className="mt-8 rounded-lg border border-richblack-700 bg-richblack-900/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-richblack-400">
                    {t("pages.payment_qr.order_code")}
                  </span>

                  <span className="break-all text-sm font-semibold text-richblack-100">
                    {paymentData.orderCode}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Payment summary */}
          <aside className="lg:sticky lg:top-8">
            <div className="overflow-hidden rounded-xl border border-richblack-700 bg-richblack-800">

              <div className="border-b border-richblack-700 p-6">
                <h2 className="text-xl font-semibold">
                  {t("pages.payment.order_summary")}
                </h2>

                <p className="mt-1 text-sm text-richblack-400">
                  {t("pages.payment_qr.payment_details")}
                </p>
              </div>

              <div className="space-y-5 p-6">
                <div className="flex justify-between text-sm">
                  <span className="text-richblack-300">
                    {t("pages.payment.total_courses")}
                  </span>

                  <span>
                    {t("pages.payment.course_count", {
                      count: courses.length || coursesId.length,
                    })}
                  </span>
                </div>

                <div className="border-t border-richblack-700 pt-5">
                  <p className="mb-2 text-sm text-richblack-300">
                    {t("pages.payment_qr.total_amount")}
                  </p>

                  <p className="text-3xl font-bold text-yellow-100">
                    {formatVND(paymentData.amount ?? courses.reduce(
                      (sum, course) => sum + Number(course.price || 0),
                      0
                    ))}
                  </p>
                </div>

                <a
                  href={paymentData.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-50 px-5 py-3 font-semibold text-richblack-900 transition hover:bg-yellow-100 active:scale-[0.98]"
                >
                  {t("pages.payment_qr.open_payment")}
                  <span aria-hidden="true">↗</span>
                </a>

                <button
                  onClick={() => navigate("/cart")}
                  className="w-full rounded-lg border border-richblack-600 px-5 py-3 text-sm font-medium text-richblack-200 transition hover:border-richblack-400 hover:bg-richblack-700"
                >
                  {t("pages.payment_qr.cancel")}
                </button>

                <div className="flex items-center justify-center gap-2 border-t border-richblack-700 pt-5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                  </span>

                  <span className="text-xs font-medium text-richblack-300">
                    {checkingPayment
                      ? t("pages.payment_qr.waiting")
                      : t("pages.payment_qr.payment_success")}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
