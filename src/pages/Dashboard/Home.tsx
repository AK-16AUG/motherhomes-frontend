import { useEffect, useState } from "react";
import instance from "../../utils/Axios/Axios";

// Dashboard Cards and Charts
import PerformanceOverview from "../../components/MainDash/PerformanceOverview";
import AnalyticalCharts from "../../components/MainDash/AnalyticalCharts";
import MonthlySalesChart from "../../components/MainDash/MonthlySalesChart";
import MonthlyTarget from "../../components/MainDash/MonthlyTarget";
import RecentAppointment from "../../components/MainDash/RecentAppointment";
import PageMeta from "../../components/common/PageMeta";

// Define interface for comprehensive stats
interface DashboardStats {
  kpis: {
    totalUsers: number;
    activeUsers: number;
    totalProperties: number;
    occupiedProperties: number;
    totalLeads: number;
    totalAppointments: number;
    totalRevenue: number;
    occupancyRate: number;
  };
  trends: {
    users: any[];
    leads: any[];
    properties: any[];
  };
}

export default function Home() {
  const [propertyData, setPropertyData] = useState([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        // Fetch original property data for backward compatibility in smaller components if needed
        const propRes = await instance.get("/property");
        setPropertyData(propRes.data.results);

        // Fetch new comprehensive stats
        const statsRes = await instance.get("/dashboard/comprehensive");
        setStats(statsRes.data);
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Admin Dashboard | MotherHome"
        description="360 View of Site Performance"
      />

      <div className="space-y-8">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Overview</h1>
            <p className="text-gray-500 dark:text-gray-400">Total metrics and site health analysis</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              Download Report
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
              Refresh Data
            </button>
          </div>
        </div>

        {/* KPI CARDS */}
        {stats && <PerformanceOverview stats={stats.kpis} />}

        {/* MAIN ANALYTICS */}
        {stats && <AnalyticalCharts trends={stats.trends} kpis={stats.kpis} />}

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 xl:col-span-7">
            <MonthlySalesChart propertyData={propertyData} />
          </div>

          <div className="col-span-12 xl:col-span-5">
            <MonthlyTarget propertyData={propertyData} />
          </div>

          <div className="col-span-12 xl:col-span-12">
            <RecentAppointment />
          </div>
        </div>
      </div>
    </>
  );
}