/* eslint-disable react/prop-types */
import { useState } from "react"
import { Chart, registerables } from "chart.js"
import { Doughnut } from "react-chartjs-2"

Chart.register(...registerables)

export default function InstructorChart({ courses }) {
  const [currChart, setCurrChart] = useState("students")
  const [animating, setAnimating] = useState(false)

  const handleSwitch = (chart) => {
    if (chart === currChart) return
    setAnimating(true)
    setTimeout(() => {
      setCurrChart(chart)
      setAnimating(false)
    }, 250)
  }

  const palette = [
    "#2dd4bf", "#f59e0b", "#818cf8", "#fb7185", "#34d399",
    "#60a5fa", "#e879f9", "#fbbf24", "#a3e635", "#38bdf8",
  ]

  const totalStudents = courses.reduce((acc, curr) => acc + curr.totalStudentsEnrolled, 0)
  const totalIncome = courses.reduce((acc, curr) => acc + curr.totalAmountGenerated, 0)

  const chartData = {
    labels: courses.map((c) => c.courseName),
    datasets: [{
      data: courses.map((c) => currChart === "students" ? c.totalStudentsEnrolled : c.totalAmountGenerated),
      backgroundColor: palette.slice(0, courses.length),
      hoverBackgroundColor: palette.slice(0, courses.length).map(color => color + 'dd'),
      borderColor: "#0f172a",
      borderWidth: 3,
      hoverOffset: 15,
      cutout: "75%", 
      borderRadius: 6,
    }],
  }

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, 
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 14,
        bodyFont: { family: "'DM Sans', sans-serif", size: 13 },
        cornerRadius: 10,
        displayColors: true,
      },
    },
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .chart-card {
          font-family: 'DM Sans', sans-serif;
          background: #0f172a;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          color: #f1f5f9;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
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
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 20px;
          border-radius: 9px;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          color: #94a3b8;
        }

        .tab-btn.active {
          background: #2dd4bf;
          color: #053530;
          box-shadow: 0 4px 15px rgba(45,212,191,0.3);
        }

        .main-layout {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 40px;
          align-items: center;
        }

        .visual-container {
          position: relative;
          height: 320px;
          transition: all 0.3s ease;
        }

        .visual-container.fade {
          opacity: 0.3;
          transform: scale(0.98);
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
          font-size: 32px;
          font-weight: 700;
          color: #fff;
        }

        .center-stats .label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .custom-legend {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 300px;
          overflow-y: auto;
          padding-right: 10px;
        }

        /* Custom Scrollbar */
        .custom-legend::-webkit-scrollbar { width: 4px; }
        .custom-legend::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

        .legend-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: rgba(255,255,255,0.02);
          border-radius: 12px;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }

        .legend-item:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.1);
          transform: translateX(5px);
        }

        .course-info {
          display: flex;
          align-items: center;
          gap: 12px;
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
          color: #2dd4bf;
        }

        @media (max-width: 768px) {
          .main-layout { grid-template-columns: 1fr; }
          .chart-card { padding: 20px; }
        }
      `}</style>

      <div className="chart-card">
        <div className="chart-header">
          <div className="title-wrapper">
            <h3>Course Analytics</h3>
            <p>Performance breakdown across your portfolio</p>
          </div>
          <div className="tab-group">
            <button
              className={`tab-btn ${currChart === "students" ? "active" : ""}`}
              onClick={() => handleSwitch("students")}
            >
              Students
            </button>
            <button
              className={`tab-btn ${currChart === "income" ? "active" : ""}`}
              onClick={() => handleSwitch("income")}
            >
              Income
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
                    : `${totalIncome.toLocaleString()} đ`
                  }
                </span>
                <span className="label">Total {currChart}</span>
              </div>
            </div>

            <div className="custom-legend">
              {courses.map((course, index) => (
                <div key={index} className="legend-item">
                  <div className="course-info">
                    <span className="dot" style={{ backgroundColor: palette[index % palette.length] }}></span>
                    <span className="course-name">{course.courseName}</span>
                  </div>
                  <span className="course-value">
                    {currChart === "students" 
                      ? course.totalStudentsEnrolled 
                      : `₹${course.totalAmountGenerated.toLocaleString()}`
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: "60px 0", textAlign: "center" }}>
            <p style={{ color: "#64748b" }}>Not enough data to generate analytics</p>
          </div>
        )}
      </div>
    </>
  )
}