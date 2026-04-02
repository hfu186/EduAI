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
    <div className={`flex ${position} my-20 justify-between flex-col lg:gap-10 gap-10`}>
      
      <div className="lg:w-[50%] flex flex-col gap-8">
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

      <div className="lg:w-[500px] flex flex-row relative">
                <div className={`absolute ${backgroundGradient} -z-10`}></div>
        <div className="flex flex-row w-full glass-bg rounded-2xl border border-richblack-700/50 shadow-2xl overflow-hidden backdrop-blur-xl">
          
          <div className="flex flex-col w-[10%] text-center select-none text-richblack-400 font-mono font-bold py-6 border-r border-richblack-700/50 bg-richblack-900/30">
            {Array.from({ length: codeblock.split("\n").length }, (_, i) => (
              <p key={i} className="leading-[24px] text-sm opacity-60">
                {i + 1}
              </p>
            ))}
          </div>

          {/* Code Content with Typing Animation */}
          <div className={`w-[90%] flex flex-col gap-2 font-mono pr-6 py-6 pl-4 ${codeColor}`}>
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
  );
};

export default CodeBlocks;