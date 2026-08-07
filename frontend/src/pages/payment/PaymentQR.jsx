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
            { Authorization: `Bearer ${token}` },
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
      <div className="min-h-screen flex items-center justify-center bg-richblack-900 text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">{t("pages.payment_qr.creating_gateway")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-richblack-900 via-richblack-800 to-richblack-900 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-richblack-800/80 backdrop-blur-md border border-richblack-700 shadow-xl p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400/50 animate-pulse"></div>
        <h1 className="text-2xl font-bold mb-2">{t("pages.payment_qr.title")}</h1>
        <p className="text-richblack-300 mb-6 text-sm">
          {t("pages.payment_qr.description")}
        </p>
        <div className="bg-white p-4 rounded-xl inline-block shadow-lg mb-6 relative">
          {paymentData?.qrCode ? (
            <QRCodeCanvas
              value={paymentData.qrCode}
              size={220}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          ) : (
            <div className="w-[220px] h-[220px] flex items-center justify-center text-black">
              {t("pages.payment_qr.loading")}
            </div>
          )}
        </div>
        <p className="text-richblack-400 text-sm mb-1">{t("pages.payment_qr.total_amount")}</p>{" "}
        <p className="text-3xl font-bold text-yellow-300 mb-6">
          {" "}
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(totalAmount)}{" "}
        </p>
        <a
          href={paymentData?.checkoutUrl}
          target="_blank"
          rel="noreferrer"
          className="block w-full py-3 mb-3 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition shadow-md"
        >
          {t("pages.payment_qr.open_payment")}
        </a>
        <button
          onClick={() => navigate("/dashboard/cart")}
          className="w-full py-3 rounded-lg border border-richblack-600 hover:bg-richblack-700 transition"
        >
          {t("pages.payment_qr.cancel")}
        </button>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-richblack-300 bg-richblack-800 py-2 px-4 rounded-full border border-richblack-700">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
          {t("pages.payment_qr.waiting")}
        </div>
      </div>
    </div>
  );
}
