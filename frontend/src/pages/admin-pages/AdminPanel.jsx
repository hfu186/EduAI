/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  getRevenue30Days,
  getTopCourses,
  getInstructorEarnings,
  getEnrollmentGrowth,
  getAverageOrderValue,
} from "@/services/operations/adminAPI";
import { toast } from "react-hot-toast";

// ── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, prefix = "", suffix = "" }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(15,15,25,0.95)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: "10px 16px",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}>
        <p style={{ color: "#666", fontSize: 11, marginBottom: 4, fontFamily: "monospace" }}>{label}</p>
        <p style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>
          {prefix}{Number(payload[0].value).toLocaleString()}{suffix}
        </p>
      </div>
    );
  }
  return null;
};

// ── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, accent, sub }) => (
  <div style={{
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 20,
    padding: "24px 28px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    position: "relative",
    overflow: "hidden",
    transition: "border-color 0.2s",
  }}
    onMouseEnter={e => e.currentTarget.style.borderColor = accent + "55"}
    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
  >
    {/* glow blob */}
    <div style={{
      position: "absolute", top: -40, right: -40,
      width: 120, height: 120, borderRadius: "50%",
      background: accent, opacity: 0.08, filter: "blur(40px)",
      pointerEvents: "none",
    }} />
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: accent + "22", border: `1px solid ${accent}44`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 18,
    }}>{icon}</div>
    <div>
      <p style={{ color: "#555", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{label}</p>
      <p style={{ color: "#fff", fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>{value}</p>
      {sub && <p style={{ color: accent, fontSize: 12, marginTop: 4 }}>{sub}</p>}
    </div>
  </div>
);

// ── Chart Card ──────────────────────────────────────────────────────────────
const ChartCard = ({ title, badge, children }) => (
  <div style={{
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 24,
    padding: "28px 32px",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
      <h2 style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: 0 }}>{title}</h2>
      {badge && (
        <span style={{
          background: "rgba(255,255,255,0.06)", color: "#888",
          fontSize: 11, padding: "3px 10px", borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.08)",
        }}>{badge}</span>
      )}
    </div>
    <div style={{ height: 280, width: "100%", minWidth: 0 }}>
      {children}
    </div>
  </div>
);

// ── Bar Colors ───────────────────────────────────────────────────────────────
const BAR_COLORS = ["#6EE7B7", "#67E8F9", "#A5B4FC", "#FCA5A5", "#FCD34D"];

export default function AdminAnalytics() {
  const { token } = useSelector((state) => state.auth);

  const [revenue, setRevenue]                   = useState([]);
  const [topCourses, setTopCourses]             = useState([]);
  const [instructorEarnings, setInstructorEarnings] = useState([]);
  const [enrollGrowth, setEnrollGrowth]         = useState([]);
  const [avgOrder, setAvgOrder]                 = useState(0);
  const [loading, setLoading]                   = useState(true);

  const fetchData = async () => {
    if (!token) {
      setLoading(false);
      toast.error("Missing auth token. Please login again.");
      return;
    }

    setLoading(true);
    try {
      const [revenueData, courseData, instructorData, enrollData, avgData] =
        await Promise.allSettled([
          getRevenue30Days(token),
          getTopCourses(token),
          getInstructorEarnings(token),
          getEnrollmentGrowth(token),
          getAverageOrderValue(token),
        ]);

      setRevenue(revenueData.status === "fulfilled" ? revenueData.value || [] : []);
      setTopCourses(courseData.status === "fulfilled" ? courseData.value || [] : []);
      setInstructorEarnings(
        instructorData.status === "fulfilled" ? instructorData.value || [] : []
      );
      setEnrollGrowth(enrollData.status === "fulfilled" ? enrollData.value || [] : []);
      const avgValue = avgData.status === "fulfilled" ? avgData.value : 0;
      setAvgOrder(typeof avgValue === "number" ? avgValue : avgValue?.avgOrderValue ?? 0);
    } catch (error) {
      toast.error("Failed to load admin analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); });

  const totalRevenue = revenue.reduce((s, d) => s + (d.revenue || 0), 0);
  const totalStudents = enrollGrowth.reduce((s, d) => s + (d.students || 0), 0);
  const topCourse = topCourses[0]?.course ?? "—";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080810",
      color: "#fff",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: "40px 48px",
    }}>

      {/* ── Google Font ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 3px; }
        .recharts-cartesian-axis-tick-value { font-size: 11px !important; fill: #444 !important; }
        .recharts-legend-item-text { color: #666 !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#6EE7B7",
            boxShadow: "0 0 12px #6EE7B7",
          }} />
          <span style={{ color: "#6EE7B7", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Live Dashboard
          </span>
        </div>
        <h1 style={{
          fontSize: 30, fontWeight: 800, margin: 0,
          letterSpacing: "-0.03em",
          background: "linear-gradient(135deg, #fff 40%, #555)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Analytics Overview
        </h1>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.08)",
            borderTopColor: "#6EE7B7",
            animation: "spin 0.8s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <>
          {/* ── KPI Cards ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 32,
          }}>
            <StatCard
              label="30-Day Revenue"
              value={`₫${(totalRevenue / 1e6).toFixed(1)}M`}
              icon="💰"
              accent="#6EE7B7"
              sub="From paid orders"
            />
            <StatCard
              label="Avg Order Value"
              value={`₫${Math.round(avgOrder).toLocaleString()}`}
              icon="🎯"
              accent="#67E8F9"
              sub="Per transaction"
            />
            <StatCard
              label="New Enrollments"
              value={totalStudents.toLocaleString()}
              icon="🎓"
              accent="#A5B4FC"
              sub="Last 30 days"
            />
            <StatCard
              label="Top Course"
              value={topCourse.length > 18 ? topCourse.slice(0, 18) + "…" : topCourse}
              icon="🏆"
              accent="#FCD34D"
            />
          </div>

          {/* ── Revenue + Enrollment (2 col) ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginBottom: 20,
          }}>
            <ChartCard title="Revenue" badge="Last 30 days">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenue} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6EE7B7" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6EE7B7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: "#444", fontSize: 10 }} tickLine={false} axisLine={false}
                    tickFormatter={d => d?.slice(5)} />
                  <YAxis tick={{ fill: "#444", fontSize: 10 }} tickLine={false} axisLine={false}
                    tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip prefix="₫" />} />
                  <Area type="monotone" dataKey="revenue" stroke="#6EE7B7" strokeWidth={2}
                    fill="url(#gRevenue)" dot={false} activeDot={{ r: 5, fill: "#6EE7B7", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Enrollment Growth" badge="All time">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={enrollGrowth} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gEnroll" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A5B4FC" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#A5B4FC" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: "#444", fontSize: 10 }} tickLine={false} axisLine={false}
                    tickFormatter={d => d?.slice(5)} />
                  <YAxis tick={{ fill: "#444", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip suffix=" students" />} />
                  <Area type="monotone" dataKey="students" stroke="#A5B4FC" strokeWidth={2}
                    fill="url(#gEnroll)" dot={false} activeDot={{ r: 5, fill: "#A5B4FC", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}>
            <ChartCard title="Top Selling Courses" badge="By units sold">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCourses} margin={{ top: 4, right: 4, left: -10, bottom: 0 }} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="course" tick={{ fill: "#444", fontSize: 10 }} tickLine={false} axisLine={false}
                    tickFormatter={v => v?.length > 12 ? v.slice(0, 12) + "…" : v} />
                  <YAxis tick={{ fill: "#444", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip suffix=" sales" />} />
                  <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
                    {topCourses.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Instructor Earnings" badge="Top 5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={instructorEarnings} layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 0 }} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#444", fontSize: 10 }} tickLine={false} axisLine={false}
                    tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="instructor" tick={{ fill: "#888", fontSize: 11 }}
                    tickLine={false} axisLine={false} width={90}
                    tickFormatter={v => v?.length > 12 ? v.slice(0, 12) + "…" : v} />
                  <Tooltip content={<CustomTooltip prefix="₫" />} />
                  <Bar dataKey="earnings" radius={[0, 6, 6, 0]}>
                    {instructorEarnings.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}