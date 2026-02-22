import { useEffect, useState } from "react";
import instance from "../../utils/Axios/Axios";

// Dashboard Cards and Charts
import PerformanceOverview from "../../components/MainDash/PerformanceOverview";
import AnalyticalCharts from "../../components/MainDash/AnalyticalCharts";
import MonthlySalesChart from "../../components/MainDash/MonthlySalesChart";
import MonthlyTarget from "../../components/MainDash/MonthlyTarget";
import RecentAppointment from "../../components/MainDash/RecentAppointment";
import RecentFlats from "../../components/MainDash/RecentFlats";
import RecentTenants from "../../components/MainDash/RecentTenants";
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
    projectedRevenue: number; // New
    occupancyRate: number;
    vacantBeds: number;
    outstandingRent: number;
  };
  revenueIntelligence: {
    trend: any[];
    byType: any[];
  };
  recentFlats: any[];
  recentTenants: any[];
  trends?: any; // For AnalyticalCharts
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        // Fetch new comprehensive stats (optimized backend)
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
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 animate-pulse">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Admin Dashboard | MotherHome"
        description="360 View of Site Performance"
      />

      <div className="space-y-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Real-time property and tenant insights</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              Report
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* KPI CARDS */}
        {stats && (
          <PerformanceOverview
            stats={{
              ...stats.kpis,
              // Use projectedRevenue for total revenue display if preferred by user
              totalRevenue: stats.kpis.projectedRevenue
            }}
          />
        )}

        {/* MAIN ANALYTICS */}
        {stats && (
          <AnalyticalCharts
            trends={stats.trends}
            kpis={{
              totalProperties: stats.kpis.totalProperties,
              occupiedProperties: stats.kpis.occupiedProperties
            }}
          />
        )}

        {/* RECENT LISTS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats && <RecentFlats flats={stats.recentFlats} />}
          {stats && <RecentTenants tenants={stats.recentTenants} />}
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 xl:col-span-7">
            {/* We can pass empty for now or use revenueIntelligence.trend if compatible */}
            <MonthlySalesChart propertyData={[]} />
          </div>

          <div className="col-span-12 xl:col-span-5">
            <MonthlyTarget propertyData={[]} />
          </div>
        </div>

        {/* RECENT APPOINTMENTS */}
        <div className="col-span-12">
          <RecentAppointment />
        </div>
      </div>
    </>
  );
}