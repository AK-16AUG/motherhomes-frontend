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
    occupancyRate: number;
    newLeads7Days: number;
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
  };
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    // Handle mobile view detection
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    async function fetchDashboardData() {
      try {
        setLoading(true);
        const statsRes = await instance.get("/dashboard/comprehensive");
        setStats(statsRes.data);
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-indigo-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-violet-500 animate-spin-reverse" />
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <>
      <PageMeta
        title="PG Intelligence Dashboard | MotherHome"
        description="Premium Management Insights"
      />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-10">
          <div>
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-2 block">
              Global Operations
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
              Business Intelligence
            </h1>
            <p className="text-lg text-gray-500 font-medium mt-2">
              Management & scaling automation for your PG network.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-4 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-gray-300 transition-all">
              Export Audit
            </button>
            <button className="px-6 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all">
              System Refresh
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
            <RevenueIntelligence data={stats.revenueIntelligence} insights={stats.insights} />

            {/* OCCUPANCY GRID */}
            <OccupancyMap rooms={stats.occupancyMap} />

            {/* LEAD FUNNEL */}
            <LeadFunnel data={stats.leadFunnel} />

            {/* TENANT HEALTH & ACTION CENTER */}
            <TenantHealth atRisk={stats.tenantHealth.atRisk} insights={stats.insights} />
          </>
        )}
      </div>
    </>
  );
}