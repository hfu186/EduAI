/* eslint-disable react/prop-types */
import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function CertificateTemplate({ userName, courseName, certCode, date }) {
  const certificateRef = useRef();

  const downloadPDF = () => {
    const input = certificateRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4"); // Landscape
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${courseName}-Certificate.pdf`);
    });
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div 
        ref={certificateRef}
        className="relative w-[800px] h-[560px] p-10 bg-white border-[20px] border-double border-richblack-800 text-black text-center"
      >
        <div className="border-4 border-yellow-500 h-full w-full p-8 flex flex-col justify-between">
          <h1 className="text-5xl font-serif text-richblack-800">CERTIFICATE</h1>
          <p className="text-xl italic">OF COMPLETION</p>
          
          <div>
            <p className="text-sm uppercase tracking-widest">This is to certify that</p>
            <h2 className="text-4xl font-bold border-b-2 border-black inline-block px-10 py-2 my-4">
               {userName}
            </h2>
          </div>

          <p className="text-lg">has successfully completed the course</p>
          <h3 className="text-2xl font-bold text-blue-600">{courseName}</h3>

          <div className="flex justify-between mt-10 px-10">
            <div className="text-left">
              <p className="font-bold border-t border-black pt-1">Date: {date}</p>
            </div>
            <div className="text-right">
              <p className="font-bold border-t border-black pt-1 italic">ID: {certCode}</p>
            </div>
          </div>
        </div>
      </div>

      <button onClick={downloadPDF} className="bg-yellow-50 text-black px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-all">
        Download Certificate (PDF)
      </button>
    </div>
  );
}
