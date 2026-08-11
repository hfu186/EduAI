import { useSelector } from "react-redux"

import RenderCartCourses from "./RenderCartCourses"
import RenderTotalAmount from "./RenderTotalAmount"
import {useTranslation} from "react-i18next"


export default function Cart() {
  const {  totalItems } = useSelector((state) => state.cart)
  const {t} = useTranslation();
  return (
    <div className=" min-h-[calc(100vh-2.5rem-5rem)] flex-1 items-center justify-center">
      <h1 className="mb-5 text-3xl font-bold text-richblack-5  text-center sm:text-left ">{t("cart.title")}</h1>
      <p className="border-b border-b-richblack-400 pb-2 font-semibold text-richblack-400">
        {totalItems} {t("cart.courses_in_cart")}
      </p>
      {totalItems > 0 ? (
        <div className="mt-8 flex flex-col-reverse items-start gap-x-10 gap-y-6 lg:flex-row">
          <RenderCartCourses />
          <RenderTotalAmount />
        </div>
      ) : (
        <p className="mt-14 text-center text-3xl text-richblack-100">
          {t("cart.empty")}
        </p>
      )}
    </div>
  )
}