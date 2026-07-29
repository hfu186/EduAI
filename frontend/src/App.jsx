import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./components/common/Layout/Navbar";
import { HiArrowNarrowUp } from "react-icons/hi";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  const [showArrow, setShowArrow] = useState(false);

  useEffect(() => {
    const handleArrow = () => {
      setShowArrow(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleArrow);
    return () => window.removeEventListener("scroll", handleArrow);
  }, []);

  return (
    <div className="w-full min-h-screen bg-richblack-900 flex flex-col font-inter">
      <Navbar />

      <main className="flex-1 w-full pt-10">
        <AppRoutes />
      </main>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`bg-yellow-25 hover:bg-yellow-50 hover:scale-110 p-3 text-lg text-black rounded-2xl fixed right-3 z-10 duration-500 ease-in-out ${
          showArrow ? "bottom-6" : "-bottom-24"
        }`}
      >
        <HiArrowNarrowUp />
      </button>
    </div>
  );
}

export default App;