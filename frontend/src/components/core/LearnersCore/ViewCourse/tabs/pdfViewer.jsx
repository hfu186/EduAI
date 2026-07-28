/* eslint-disable react/prop-types */
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export default function PDFViewer({ pdfUrl }) {
  const [numPages, setNumPages] = useState(null);

  return (
    <div className="bg-white p-4 flex justify-center">
      <Document
        file={pdfUrl}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading="Loading PDF..."
        error="Can't download PDF"
      >
        {Array.from(new Array(numPages), (_, i) => (
          <Page key={i} pageNumber={i + 1} width={800} />
        ))}
      </Document>
    </div>
  );
}
