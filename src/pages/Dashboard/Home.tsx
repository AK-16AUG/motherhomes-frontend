import { useEffect, useState } from "react";
import instance from "../../utils/Axios/Axios";
import PageMeta from "../../components/common/PageMeta";

// New Premium Components
import MasterOverview from "../../components/Dashboard/MasterOverview";
import RevenueIntelligence from "../../components/Dashboard/RevenueIntelligence";
import OccupancyMap from "../../components/Dashboard/OccupancyMap";
import LeadFunnel from "../../components/Dashboard/LeadFunnel";
import TenantHealth from "../../components/Dashboard/TenantHealth";

// Define interface for the new comprehensive stats
interface DashboardStats {
  kpis: {
    revenueThisMonth: number;
    revenueGrowth: number;
    occupancyRate: number;
    newLeads7Days: number;
    leadGrowth: number;
    bookingsConfirmed: number;
    outstandingRent: number;
    totalLeads: number;
    vacantBeds: number;
  };
  revenueIntelligence: {
    trend: any[];
    byType: any[];
    averageRent: number;
  };
  occupancyMap: any[];
  leadFunnel: {
    total: number;
    funnel: any[];
  };
  insights: string[];
  tenantHealth: {
    atRisk: number;
    retention: string;
    resolutionVelocity: string;
  };
  smartQueue: {
    name: string;
    phone: string;
    type: string;
    activity: string;
    temp: 'hot' | 'warm' | 'cold';
    icon: string;
  }[];
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    // Handle mobile view detection
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);
        const statsRes = await instance.get("/dashboard/comprehensive");
        if (statsRes.data) {
          setStats(statsRes.data);
          setLastUpdated(new Date().toLocaleTimeString());
        } else {
          setError("No data received from server.");
        }
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        setError("Unable to load dashboard insights. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
        <div className="h-12 w-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-500 uppercase tracking-widest animate-pulse">Loading Analytics Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-gray-950 p-6 text-center">
        <div className="max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <>
      <PageMeta
        title="Intelligence Dashboard | MotherHome"
        description="Premium Asset Management Insights"
      />

      <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-10">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Overview
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Asset management and operational insights
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:block text-right pr-6 border-r border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400 mb-1">Last updated</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{lastUpdated}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* MOBILE SNAPSHOT MODE (Conditional Rendering) */}
        {isMobile ? (
          <div className="space-y-6">
            <MasterOverview stats={stats.kpis} />
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-xl">
              <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-sm mb-4">Today's Visits</h3>
              <button className="w-full py-4 bg-emerald-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest">
                Quick Call Next Lead
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* MASTER OVERVIEW (KPIs) */}
            <MasterOverview stats={stats.kpis} />

            {/* REVENUE INTELLIGENCE */}
            <RevenueIntelligence data={stats.revenueIntelligence || { trend: [], byType: [], averageRent: 0 }} insights={stats.insights || []} />

            {/* OCCUPANCY GRID */}
            <OccupancyMap rooms={stats.occupancyMap || []} />

            {/* LEAD FUNNEL */}
            <LeadFunnel
              data={stats.leadFunnel || { total: 0, funnel: [] }}
              smartQueue={stats.smartQueue || []}
            />

            {/* TENANT HEALTH & ACTION CENTER */}
            <TenantHealth
              data={stats.tenantHealth || { atRisk: 0, retention: "8.4 Months", resolutionVelocity: "4.2 Hours" }}
              insights={stats.insights || []}
            />
          </>
        )}

      </div>
    </>
  );
}