import React, { useEffect, useState } from "react";
import OverviewCard from "../components/OverviewCardAdmin";
import LineChartComp from "../components/LineChartCompAdmin";
import DonutChartComp from "../components/DonutChartCompAdmin";
import Title from "../components/Title";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // States for dynamic data
  const [stats, setStats] = useState({
    newUsers: { value: 0, change: 0 },
    activeUsers: { value: 0, change: 0 }
  });
  const [complaintsLine, setComplaintsLine] = useState({
    labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    thisYear: Array(12).fill(0),
    lastYear: Array(12).fill(0)
  });
  const [donutData, setDonutData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Utility: Count complaints month-wise for a year
  const generateMonthlyCounts = (reports, year) => {
    const counts = Array(12).fill(0);
    reports.forEach(r => {
      const d = new Date(r.createdAt);
      if(d.getFullYear() === year) counts[d.getMonth()] += 1;
    });
    return counts;
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch all reports
      const resReports = await axios.get("http://localhost:4000/api/reports");
      const reports = resReports.data;

      // Stats
      const newUsers = reports.filter(r => {
        const d = new Date(r.createdAt);
        return d >= new Date(new Date().getFullYear(), 0, 1); // Users added this year
      }).length;

      const activeUsers = new Set(reports.map(r => r.reportedUser)).size;

      setStats({
        newUsers: { value: newUsers, change: 0 }, // Change can be calculated if you have last year data
        activeUsers: { value: activeUsers, change: 0 }
      });

      // Line chart
      setComplaintsLine({
        labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
        thisYear: generateMonthlyCounts(reports, new Date().getFullYear()),
        lastYear: generateMonthlyCounts(reports, new Date().getFullYear() - 1)
      });

      // Donut chart: Count by reason
      const reasonCounts = reports.reduce((acc, r) => {
        const reason = r.reason || "other";
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
      }, {});

      setDonutData([
        { label: "Abuse", value: reasonCounts.abuse || 0 },
        { label: "Spam", value: reasonCounts.spam || 0 },
        { label: "Misinformation", value: reasonCounts.misinfo || 0 },
        { label: "Other", value: reasonCounts.other || 0 }
      ]);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <span className="ml-4 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="py-12 min-h-screen p-6 relative overflow-hidden">
      <div className="text-2xl mb-4">
        <Title text1="ADMIN" text2="DASHBOARD" />
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <OverviewCard title="New Users" data={stats.newUsers} />
        <OverviewCard title="Active Users" data={stats.activeUsers} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 bg-green-50 p-4 rounded-xl shadow overflow-hidden">
          <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
            <h3 className="font-semibold text-gray-800">No of Complaints</h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-green-700">
              <span className="w-3 h-3 rounded-full bg-green-900"></span> This year
              <span className="w-3 h-3 rounded-full bg-green-300"></span> Last year
            </div>
          </div>
          <div className="w-full h-80">
            <LineChartComp data={complaintsLine} />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-xl shadow flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-800">Community Complaints</h3>
            <button
              onClick={() => navigate('/communityComplaints')}
              className="bg-black text-white px-4 py-1 rounded-full hover:bg-gray-800 transition"
            >
              See All
            </button>
          </div>
          <div className="w-full h-72 overflow-hidden">
            <DonutChartComp data={donutData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
