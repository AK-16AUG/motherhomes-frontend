import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
    type: string;
    activity: string;
    temp: string;
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
        <div className="relative mb-8">
          <div className="h-32 w-32 rounded-full border-t-4 border-indigo-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 rounded-full border-b-4 border-violet-500 animate-spin-reverse opacity-50" />
          </div>
        </div>
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">MotherHome Intelligence</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest animate-pulse">Synchronizing Global Asset Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-gray-950 p-6 text-center">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-12 rounded-[3.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 max-w-lg">
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <span className="text-rose-600 text-4xl font-black italic">!</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter uppercase">Neural Link Interrupted</h2>
          <p className="text-gray-500 font-medium mb-10 leading-relaxed text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/30"
          >
            Reconnect Terminal
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

      <div className="max-w-[1700px] mx-auto px-6 sm:px-10 lg:px-12 py-12 space-y-16">
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 border-b border-gray-100 dark:border-gray-800 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em]">
                Live Analytics Terminal
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tightest leading-tight">
              Operational <br /> Intelligence
            </h1>
            <div className="flex items-center gap-4 text-gray-400 font-bold text-xs uppercase tracking-widest pt-2">
              <p>Network: PG-GLOBAL-NODE-01</p>
              <span>•</span>
              <p>Status: Optimized</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="text-right sm:pr-8 sm:border-r border-gray-100 dark:border-gray-800">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Last Update</p>
              <p className="text-lg font-black text-gray-900 dark:text-white tracking-tighter">{lastUpdated}</p>
            </div>
            <div className="flex gap-4">
              <button className="group px-8 py-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:border-indigo-600 transition-all text-gray-600 dark:text-gray-300 shadow-xl shadow-gray-100/50 dark:shadow-none">
                Export Audit <span className="inline-block transform group-hover:translate-y-[-2px] transition-transform">↓</span>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 shadow-2xl shadow-indigo-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Refresh System
              </button>
            </div>
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

        {/* PREMIUM QUICK ACTION DIAL */}
        <div className="fixed bottom-12 right-12 z-50 flex flex-col items-center gap-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-end gap-3 mb-4"
          >
            {[
              { label: "New Lead", color: "bg-orange-500", icon: "󱗿" },
              { label: "Add Property", color: "bg-indigo-600", icon: "󰙅" },
              { label: "Global Audit", color: "bg-emerald-500", icon: "󰒔" }
            ].map((action, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3 group"
              >
                <span className="px-4 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity border border-gray-100 dark:border-gray-800">
                  {action.label}
                </span>
                <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center text-white text-xl shadow-2xl shadow-gray-200/50 dark:shadow-none hover:rotate-12 transition-transform`}>
                  {action.icon}
                </div>
              </motion.button>
            ))}
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="h-20 w-20 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[2rem] flex items-center justify-center text-4xl font-light shadow-2xl shadow-indigo-500/20"
          >
            +
          </motion.button>
        </div>
      </div>
    </>
  );
}