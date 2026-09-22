/* eslint-disable react/prop-types */
import { useState } from "react"
import { Chart, registerables } from "chart.js"
import { Doughnut } from "react-chartjs-2"

Chart.register(...registerables)

const StudentsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const WalletIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1" />
    <path d="M21 12a2 2 0 0 0-2-2h-3a2 2 0 0 0 0 4h3a2 2 0 0 0 2-2Z" />
  </svg>
)

export default function InstructorChart({ courses }) {
  const [currChart, setCurrChart] = useState("students")
  const [animating, setAnimating] = useState(false)

  const handleSwitch = (chart) => {
    if (chart === currChart) return
    setAnimating(true)
    setTimeout(() => {
      setCurrChart(chart)
      setAnimating(false)
    }, 220)
  }

  const palette = [
    "#2dd4bf", "#f59e0b", "#818cf8", "#fb7185", "#34d399",
    "#60a5fa", "#e879f9", "#fbbf24", "#a3e635", "#38bdf8",
  ]

  const totalStudents = courses.reduce((acc, curr) => acc + curr.totalStudentsEnrolled, 0)
  const totalIncome = courses.reduce((acc, curr) => acc + curr.totalAmountGenerated, 0)
  const activeTotal = currChart === "students" ? totalStudents : totalIncome

  // sort courses by the active metric so the legend reads as a ranked breakdown
  const rankedCourses = [...courses]
    .map((c, originalIndex) => ({ ...c, originalIndex }))
    .sort((a, b) => {
      const aVal = currChart === "students" ? a.totalStudentsEnrolled : a.totalAmountGenerated
      const bVal = currChart === "students" ? b.totalStudentsEnrolled : b.totalAmountGenerated
      return bVal - aVal
    })

  const chartData = {
    labels: courses.map((c) => c.courseName),
    datasets: [{
      data: courses.map((c) => currChart === "students" ? c.totalStudentsEnrolled : c.totalAmountGenerated),
      backgroundColor: palette.slice(0, courses.length),
      hoverBackgroundColor: palette.slice(0, courses.length).map(color => color + "dd"),
      borderColor: "#0f172a",
      borderWidth: 3,
      hoverOffset: 15,
      cutout: "76%",
      borderRadius: 6,
    }],
  }

  const options = {
    maintainAspectRatio: false,
    animation: { animateRotate: true, duration: 700, easing: "easeOutQuart" },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 14,
        bodyFont: { family: "'Inter', sans-serif", size: 13 },
        titleFont: { family: "'Inter', sans-serif", size: 12, weight: "600" },
        cornerRadius: 10,
        displayColors: true,
        callbacks: {
          label: (ctx) => {
            const value = ctx.parsed
            if (currChart === "students") return ` ${value.toLocaleString()} students`
            return ` ${value.toLocaleString()} VND`
          },
        },
      },
    },
  }

  return (
    <>
      <style>{`
        .chart-card {
          position: relative;
          font-family: 'Inter', sans-serif;
          background: #0f172a;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          color: #f1f5f9;
          overflow: hidden;
        }

        .chart-card::before {
          content: '';
          position: absolute;
          top: -120px;
          right: -100px;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(45,212,191,0.14), transparent 70%);
          pointer-events: none;
        }

        .chart-header {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .title-wrapper h3 {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(to right, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .title-wrapper p {
          font-size: 13px;
          color: #64748b;
          margin-top: 4px;
        }

        .tab-group {
          display: flex;
          background: rgba(255,255,255,0.05);
          padding: 4px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 18px;
          border-radius: 9px;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          color: #94a3b8;
        }

        .tab-btn:hover:not(.active) {
          color: #cbd5e1;
        }

        .tab-btn.active {
          background: #2dd4bf;
          color: #053530;
          box-shadow: 0 4px 15px rgba(45,212,191,0.3);
        }

        .main-layout {
          position: relative;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 40px;
          align-items: center;
        }

        .visual-container {
          position: relative;
          height: 300px;
          transition: opacity 0.22s ease, transform 0.22s ease;
        }

        .visual-container.fade {
          opacity: 0.25;
          transform: scale(0.97);
        }

        .center-stats {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          pointer-events: none;
        }

        .center-stats .value {
          display: block;
          font-size: 30px;
          font-weight: 700;
          color: #fff;
          line-height: 1.15;
        }

        .center-stats .label {
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
        }

        .custom-legend {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 300px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .custom-legend::-webkit-scrollbar { width: 4px; }
        .custom-legend::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 10px; }

        .legend-item {
          padding: 10px 14px;
          background: rgba(255,255,255,0.02);
          border-radius: 12px;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }

        .legend-item:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.1);
        }

        .legend-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 7px;
        }

        .course-info {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .course-name {
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #cbd5e1;
        }

        .course-value {
          font-size: 13px;
          font-weight: 600;
          color: #f1f5f9;
          flex-shrink: 0;
        }

        .legend-bar-track {
          height: 4px;
          border-radius: 4px;
          background: rgba(255,255,255,0.06);
          overflow: hidden;
        }

        .legend-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.4s ease;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 56px 0 44px;
          text-align: center;
        }

        .empty-state p {
          color: #64748b;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .main-layout { grid-template-columns: 1fr; }
          .chart-card { padding: 20px; }
        }
      `}</style>

      <div className="chart-card">
        <div className="chart-header">
          <div className="title-wrapper">
            <h3>Phân tích khoá học</h3>
            <p>Tổng quan hiệu suất trên toàn bộ danh mục</p>
          </div>
          <div className="tab-group">
            <button
              className={`tab-btn ${currChart === "students" ? "active" : ""}`}
              onClick={() => handleSwitch("students")}
            >
              <StudentsIcon /> Students
            </button>
            <button
              className={`tab-btn ${currChart === "income" ? "active" : ""}`}
              onClick={() => handleSwitch("income")}
            >
              <WalletIcon /> Revenue
            </button>
          </div>
        </div>

        {courses.length > 0 ? (
          <div className="main-layout">
            <div className={`visual-container ${animating ? "fade" : ""}`}>
              <Doughnut data={chartData} options={options} />
              <div className="center-stats">
                <span className="value">
                  {currChart === "students"
                    ? totalStudents.toLocaleString()
                    : `${totalIncome.toLocaleString()} VND`
                  }
                </span>
                <span className="label">
                  {currChart === "students" ? "Total Students" : "Total Revenue"}
                </span>
              </div>
            </div>

            <div className="custom-legend">
              {rankedCourses.map((course) => {
                const value = currChart === "students" ? course.totalStudentsEnrolled : course.totalAmountGenerated
                const share = activeTotal > 0 ? Math.round((value / activeTotal) * 100) : 0
                const color = palette[course.originalIndex % palette.length]
                return (
                  <div key={course.originalIndex} className="legend-item">
                    <div className="legend-row">
                      <div className="course-info">
                        <span className="dot" style={{ backgroundColor: color }}></span>
                        <span className="course-name">{course.courseName}</span>
                      </div>
                      <span className="course-value">
                        {currChart === "students" ? value.toLocaleString() : `${value.toLocaleString()} VND`}
                      </span>
                    </div>
                    <div className="legend-bar-track">
                      <div className="legend-bar-fill" style={{ width: `${share}%`, backgroundColor: color }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>Not enough data to generate analysis report</p>
          </div>
        )}
      </div>
    </>
  )
}