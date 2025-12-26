// src/pages/UserDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlantCard from "../compononts/PlantCard";
import AnalyticsCard from "../compononts/AnalyticsCard";
import PerformanceChart from "../compononts/PerformanceChart";
import SavedPlantsSection from "../compononts/SavedPlantsSection";
import { assets } from "../assets/assets";
import Title from '../compononts/Title';
import { Plus, RefreshCw } from 'lucide-react';
import { dashboardAPI, plantsAPI, getUserId } from "../api/axios"; // ✅ Updated import

export default function UserDashboard() {
  const [visibleCount, setVisibleCount] = useState(4);
  const [chartData, setChartData] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [savedPlants, setSavedPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedPlantsLoading, setSavedPlantsLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();
  const userId = getUserId();

  // Dummy data for now - will be replaced with DB data
  // const allPlants = [
  //   { name: "Fiddle-leaf fig", image: assets.plant1 },
  //   { name: "Aloe vera", image: assets.plant2 },
  //   { name: "Strelitzia nicolai", image: assets.plant3 },
  //   { name: "Ficus microcarpa", image: assets.plant4 },
  //   { name: "Bird of Paradise", image: assets.plant1 },
  //   { name: "Peace Lily", image: assets.plant2 },
  //   { name: "Snake Plant", image: assets.plant3 },
  //   { name: "Money Tree", image: assets.plant4 },
  // ];

  // Fetch dashboard data and saved plants
  const fetchDashboardData = async () => {
    if (!userId) {
      console.error('No user ID found');
      setLoading(false);
      setSavedPlantsLoading(false);
      return;
    }

    try {
      setLoading(true);
      setSavedPlantsLoading(true);
      
      // Fetch dashboard data
      const dashboardRes = await dashboardAPI.getDashboardData(userId);
      if (dashboardRes.data) {
        setChartData(dashboardRes.data.chartData || []);
        setAnalytics(dashboardRes.data.analytics || {});
      }
      
      // Fetch saved plants
      const savedPlantsRes = await plantsAPI.getSavedPlants(userId);
      if (savedPlantsRes.data?.success) {
        setSavedPlants(savedPlantsRes.data.plants || []);
      } else {
        // Fallback to localStorage if API fails
        const localStoragePlants = JSON.parse(localStorage.getItem('savedPlants') || '[]');
        const userPlants = localStoragePlants.filter(p => 
          p.userId === userId || p.userId === 'temp' || p.userId === userId.toString()
        );
        setSavedPlants(userPlants);
      }
      
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      
      // Fallback to localStorage for saved plants
      try {
        const localStoragePlants = JSON.parse(localStorage.getItem('savedPlants') || '[]');
        const userPlants = localStoragePlants.filter(p => 
          p.userId === userId || p.userId === 'temp' || p.userId === userId.toString()
        );
        setSavedPlants(userPlants);
      } catch (localError) {
        console.error("LocalStorage error:", localError);
        setSavedPlants([]);
      }
      
    } finally {
      setLoading(false);
      setSavedPlantsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [userId, refresh]);

  // Handle refresh
  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center mb-4 px-6">
        <div className="text-2xl">
          <Title text1="USER" text2="DASHBOARD" />
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="font-sans text-gray-900">
        
        

        <hr className="my-6 border-black" />

        
{/* --- Saved Plants Section (New) --- */}
        <section className="p-6 mb-6">
          <SavedPlantsSection 
            plants={savedPlants} 
            loading={savedPlantsLoading}
            onRefresh={handleRefresh}
          />
        </section>
        <hr className="my-6 border-black" />

        {/* --- Analytics Section --- */}
        <section className="p-6">
          <h2 className="text-3xl font-serif mb-6">Analytics</h2>
          <div className="flex flex-wrap gap-6 justify-center">
            <AnalyticsCard
              title="Water Tracking"
              time={analytics?.watering ? new Date(analytics.watering).toLocaleDateString() : "—"}
              color="#22d3ee"
            />
            <AnalyticsCard
              title="Pruning Tracking"
              time={analytics?.pruning ? new Date(analytics.pruning).toLocaleDateString() : "—"}
              color="#fde047"
            />
            <AnalyticsCard
              title="Fertilizer Tracking"
              time={analytics?.fertilizing ? new Date(analytics.fertilizing).toLocaleDateString() : "—"}
              color="#4ade80"
            />
          </div>
        </section>

        <hr className="my-6 border-black" />

        {/* --- Performance Chart --- */}
        <section className="p-6">
          <h2 className="text-3xl font-serif mb-6">Performance throughout the year</h2>
          <div className="bg-white p-4 shadow rounded-lg">
            <PerformanceChart chartData={chartData} />
          </div>
        </section>

        {/* --- API Status --- */}
        <div className="p-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm">API Connected</span>
            <span className="text-xs opacity-70">• {savedPlants.length} saved plants</span>
          </div>
        </div>
      </div>
    </div>
  );
}