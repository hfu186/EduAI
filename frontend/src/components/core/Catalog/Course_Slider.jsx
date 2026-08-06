/* eslint-disable react/prop-types */

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";

import Course_Card from "./Course_Card";

function Course_Slider({ Courses }) {
  return (
    <>
      {Courses?.length ? (
        <Swiper
          slidesPerView={1}
          spaceBetween={25}
          loop={Courses.length >= 3} 
          breakpoints={{
            1024: {
              slidesPerView: 3,
            },
          }}
          className="max-h-[32rem] px-1 pb-4 pt-2"
        >
          {Courses?.map((course, i) => (
            <SwiperSlide key={i}>
              <Course_Card course={course} Height={"h-[250px]"} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="flex flex-col sm:flex-row gap-6 ">
          <p className=" h-[201px] w-full rounded-lg  skeleton"></p>
          <p className=" h-[201px] w-full rounded-lg hidden lg:flex skeleton"></p>
          <p className=" h-[201px] w-full rounded-lg hidden lg:flex skeleton"></p>
        </div>
      )}
    </>
  );
}

export default Course_Slider;
