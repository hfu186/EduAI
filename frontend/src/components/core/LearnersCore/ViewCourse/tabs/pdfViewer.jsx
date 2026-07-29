/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { MdDeleteOutline, MdHighlight, MdOutlineInfo } from "react-icons/md";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export default function PDFViewer({ pdfUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [pendingHighlight, setPendingHighlight] = useState(null);
  const viewerRef = useRef(null);

  const storageKey = useMemo(() => `pdf-highlights:${pdfUrl}`, [pdfUrl]);

  useEffect(() => {
    setPendingHighlight(null);
    try {
      const savedHighlights = JSON.parse(localStorage.getItem(storageKey) || "[]");
      setHighlights(Array.isArray(savedHighlights) ? savedHighlights : []);
    } catch {
      setHighlights([]);
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(highlights));
  }, [highlights, storageKey]);

  const getSelectionRects = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const selectedText = selection.toString().trim();
    if (!selectedText) return null;

    const range = selection.getRangeAt(0);
    const pageElements = Array.from(
      viewerRef.current?.querySelectorAll("[data-pdf-page]") || []
    );

    const rectsByPage = pageElements
      .map((pageEl) => {
        const pageBox = pageEl.getBoundingClientRect();
        const pageNumber = Number(pageEl.dataset.pdfPage);

        const rects = Array.from(range.getClientRects())
          .map((rect) => {
            const left = Math.max(rect.left, pageBox.left);
            const right = Math.min(rect.right, pageBox.right);
            const top = Math.max(rect.top, pageBox.top);
            const bottom = Math.min(rect.bottom, pageBox.bottom);

            if (right <= left || bottom <= top) return null;

            return {
              left: left - pageBox.left,
              top: top - pageBox.top,
              width: right - left,
              height: bottom - top,
            };
          })
          .filter(Boolean);

        return rects.length > 0 ? { pageNumber, rects } : null;
      })
      .filter(Boolean);

    if (rectsByPage.length === 0) return null;

    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text: selectedText,
      pages: rectsByPage,
    };
  };

  const captureSelection = () => {
    const selectedHighlight = getSelectionRects();
    if (selectedHighlight) {
      setPendingHighlight(selectedHighlight);
    }
  };

  const addHighlight = () => {
    const selectedHighlight = getSelectionRects() || pendingHighlight;
    if (!selectedHighlight) return;

    setHighlights((prev) => [...prev, selectedHighlight]);
    setPendingHighlight(null);
    window.getSelection()?.removeAllRanges();
  };

  const clearHighlights = () => {
    setHighlights([]);
    setPendingHighlight(null);
  };

  return (
    <div className="bg-richblack-900">
      <div className="sticky top-0 z-20 flex flex-col gap-3 border-b border-richblack-700 bg-richblack-900/95 px-4 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-richblack-300">
          <MdOutlineInfo className="text-lg text-yellow-50" />
          Select text on the slide, then click Highlight.
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addHighlight}
            disabled={!pendingHighlight}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-yellow-50 px-4 py-2 text-sm font-bold text-richblack-900 transition-all hover:bg-yellow-25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MdHighlight className="text-lg" />
            Highlight
          </button>
          <button
            type="button"
            onClick={clearHighlights}
            disabled={highlights.length === 0}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-richblack-600 bg-richblack-800 px-4 py-2 text-sm font-semibold text-richblack-100 transition-all hover:border-pink-200 hover:text-pink-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MdDeleteOutline className="text-lg" />
            Clear highlights
          </button>
        </div>
      </div>

      <div
        ref={viewerRef}
        onMouseUp={captureSelection}
        onKeyUp={captureSelection}
        className="flex justify-center bg-white p-4"
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading="Loading PDF..."
          error="Can't download PDF"
        >
          {Array.from(new Array(numPages), (_, i) => {
            const pageNumber = i + 1;
            const pageHighlights = highlights.flatMap((highlight) =>
              highlight.pages
                .filter((page) => page.pageNumber === pageNumber)
                .flatMap((page) => page.rects)
            );

            return (
              <div
                key={pageNumber}
                data-pdf-page={pageNumber}
                className="relative mb-4 last:mb-0"
              >
                <Page pageNumber={pageNumber} width={800} />

                <div className="pointer-events-none absolute inset-0 z-10">
                  {pageHighlights.map((rect, rectIndex) => (
                    <span
                      key={`${pageNumber}-${rectIndex}`}
                      className="absolute rounded-[2px] bg-yellow-50/45 mix-blend-multiply"
                      style={{
                        left: rect.left,
                        top: rect.top,
                        width: rect.width,
                        height: rect.height,
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </Document>
      </div>
    </div>
  );
}
