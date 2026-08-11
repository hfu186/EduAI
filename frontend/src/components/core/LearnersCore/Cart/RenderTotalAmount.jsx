import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import IconBtn from "../../../common/IconBtn";
import { formatVND } from "../../../../utils/formatVND";

export default function RenderTotalAmount() {
  const { total, cart } = useSelector((state) => state.cart);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBuyCourse = () => {
    if (!token) {
      navigate("/login");
      return;
    }

    navigate("/payment/qr", {
      state: { courses: cart },
    });
  };

  return (
    <div className="min-w-[280px] rounded-md border border-richblack-700 bg-richblack-800 p-6">
      <p className="mb-1 text-sm font-medium text-richblack-300">
        {t("pages.payment.total_amount")}:
      </p>

      <p className="mb-6 text-3xl font-medium text-yellow-100">
        {formatVND(total)}
      </p>

      <IconBtn
        text={t("pages.payment.checkout_button")}
        onClick={handleBuyCourse}
        customClasses="w-full justify-center"
      />
    </div>
  );
}