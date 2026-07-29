/* eslint-disable react/prop-types */
import { TypeAnimation } from "react-type-animation";
import CTAButton from "./Button";
import { FaArrowRight } from "react-icons/fa";

const CodeBlocks = ({
  position,
  heading,
  subheading,
  ctabtn1,
  ctabtn2,
  codeblock,
  backgroundGradient,
  codeColor,
}) => {
  return (
    <div className={`flex ${position} my-16 justify-between flex-col lg:gap-12 gap-10`}>
      
      <div className="lg:w-[48%] flex flex-col gap-8">
        <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-richblack-5 leading-tight">
          {heading}
        </div>

        <div className="text-richblack-300 text-base md:text-lg leading-relaxed">
          {subheading}
        </div>

        <div className="flex gap-5 mt-7 flex-wrap">
          <CTAButton active={ctabtn1.active} linkto={ctabtn1.linkto}>
            <div className="flex items-center gap-2">
              {ctabtn1.btnText}
              <FaArrowRight />
            </div>
          </CTAButton>
          <CTAButton active={ctabtn2.active} linkto={ctabtn2.linkto}>
            {ctabtn2.btnText}
          </CTAButton>
        </div>
      </div>

      <div className="relative flex flex-row lg:w-[520px]">
        {typeof backgroundGradient === "string" ? (
          <div className={`absolute ${backgroundGradient} -z-10`}></div>
        ) : (
          backgroundGradient
        )}
        <div className="w-full overflow-hidden rounded-lg border border-richblack-600 bg-richblack-900 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
          <div className="flex items-center justify-between border-b border-richblack-700 bg-richblack-800 px-4 py-3">
            <div className="flex gap-2">
              <span className="h-3 w-3 rounded-full bg-pink-200"></span>
              <span className="h-3 w-3 rounded-full bg-yellow-50"></span>
              <span className="h-3 w-3 rounded-full bg-caribbeangreen-100"></span>
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-richblack-400">main.js</span>
          </div>
          <div className="flex flex-row w-full">
          
          <div className="flex w-[12%] select-none flex-col border-r border-richblack-700 bg-richblack-800/40 py-5 text-center font-mono font-bold text-richblack-400">
            {Array.from({ length: codeblock.split("\n").length }, (_, i) => (
              <p key={i} className="leading-[24px] text-sm opacity-60">
                {i + 1}
              </p>
            ))}
          </div>

          <div className={`flex w-[88%] flex-col gap-2 overflow-x-hidden py-5 pl-4 pr-5 font-mono ${codeColor}`}>
            <TypeAnimation
              sequence={[codeblock, 2000, ""]}
              cursor={true}
              repeat={Infinity}
              style={{
                whiteSpace: "pre-line",
                display: "block",
                fontSize: "15px",
                lineHeight: "26px",
                fontWeight: "500",
              }}
              omitDeletionAnimation={true}
            />
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeBlocks;
