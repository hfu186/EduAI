import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { QRCodeCanvas } from "qrcode.react";
import { resetCart } from "../../slices/cartSlice";
import { apiConnector } from "../../services/apiConnector";
import { studentEndpoints } from "../../services/apis";

export default function PaymentQR() {
  const { CREATE_QR_PAYMENT_API, CHECK_QR_PAYMENT_STATUS_API } = studentEndpoints;

  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  const courses = state?.courses || [];
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);

  const intervalRef = useRef(null);

  const totalAmount = courses.reduce((sum, c) => sum + Number(c.price || 0), 0);

  useEffect(() => {
    if (!courses.length) {
      toast.error(t("pages.payment_qr.no_courses_selected"));
      navigate("/");
      return;
    }
    createPayOS();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const createPayOS = async () => {
    try {
      const res = await apiConnector(
        "POST",
        CREATE_QR_PAYMENT_API,
        { coursesId: courses.map((c) => c._id) },
        { Authorization: `Bearer ${token}` }
      );

      setPaymentData(res.data);
    } catch (err) {
      console.error("PAYMENT ERROR:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || t("pages.payment_qr.create_error"));
      navigate("/dashboard/cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paymentData && paymentData.orderCode) {
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
            toast.success(t("pages.payment_qr.payment_success"));
            dispatch(resetCart());
            navigate("/dashboard/enrolled-courses");
          }
        } catch (error) {
          console.error("Error checking payment status:", error.message);
        }
      }, 3000);
    }
  }, [paymentData, navigate, token, dispatch, t]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-richblack-900">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-richblack-700"></div>
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-richblack-100 text-lg font-medium tracking-wide">
            {t("pages.payment_qr.creating_gateway")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-richblack-900 via-richblack-900 to-richblack-800 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="relative rounded-2xl bg-richblack-800 border border-richblack-700 shadow-2xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500" />

          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-7">
              <h1 className="text-2xl sm:text-3xl font-bold text-richblack-5 tracking-tight">
                {t("pages.payment_qr.title")}
              </h1>
              <p className="mt-2 text-sm text-richblack-300 leading-relaxed max-w-xs mx-auto">
                {t("pages.payment_qr.description")}
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-7">
              <div className="relative bg-white p-4 rounded-2xl shadow-lg shadow-black/20">
                {paymentData?.qrCode ? (
                  <QRCodeCanvas
                    value={paymentData.qrCode}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="M"
                    includeMargin={false}
                  />
                ) : (
                  <div className="w-[200px] h-[200px] flex items-center justify-center text-richblack-600 text-sm">
                    {t("pages.payment_qr.loading")}
                  </div>
                )}

                {/* Subtle corner accents */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-yellow-400 rounded-tl-md" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-yellow-400 rounded-tr-md" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-yellow-400 rounded-bl-md" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-yellow-400 rounded-br-md" />
              </div>
            </div>

            {/* Amount */}
            <div className="text-center mb-8">
              <p className="text-xs uppercase tracking-widest text-richblack-400 mb-1.5">
                {t("pages.payment_qr.total_amount")}
              </p>
              <p className="text-3xl sm:text-4xl font-bold text-yellow-300 tracking-tight">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(totalAmount)}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <a
                href={paymentData?.checkoutUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center w-full py-3.5 rounded-xl bg-yellow-400 text-richblack-900 font-semibold text-[15px] hover:bg-yellow-300 active:scale-[0.98] transition-all duration-200 shadow-md shadow-yellow-400/20"
              >
                {t("pages.payment_qr.open_payment")}
              </a>

              <button
                onClick={() => navigate("/dashboard/cart")}
                className="w-full py-3.5 rounded-xl border border-richblack-600 text-richblack-100 font-medium text-[15px] hover:bg-richblack-700 hover:border-richblack-500 active:scale-[0.98] transition-all duration-200"
              >
                {t("pages.payment_qr.cancel")}
              </button>
            </div>

            {/* Waiting status */}
            <div className="mt-7 flex items-center justify-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-xs text-richblack-300 font-medium">
                {t("pages.payment_qr.waiting")}
              </span>
            </div>
          </div>
        </div>

        {/* Optional helper text under card */}
        <p className="mt-5 text-center text-xs text-richblack-500">
          Quét mã QR bằng ứng dụng ngân hàng để thanh toán
        </p>
      </div>
    </div>
  );
}