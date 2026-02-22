import React from "react";
import { DollarSign, Home, Users, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface KPIProps {
    label: string;
    value: string | number;
    subtext?: string;
    icon: React.ReactNode;
    color: string;
    delay: number;
}

const colorMap: Record<string, { bg: string, text: string, ring: string, blur: string }> = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500/10", blur: "bg-emerald-500" },
    blue: { bg: "bg-blue-50", text: "text-blue-600 dark:text-blue-400", ring: "ring-blue-500/10", blur: "bg-blue-500" },
    purple: { bg: "bg-purple-50", text: "text-purple-600 dark:text-purple-400", ring: "ring-purple-500/10", blur: "bg-purple-500" },
    amber: { bg: "bg-amber-50", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-500/10", blur: "bg-amber-500" },
    rose: { bg: "bg-rose-50", text: "text-rose-600 dark:text-rose-400", ring: "ring-rose-500/10", blur: "bg-rose-500" },
};

const KPICard: React.FC<KPIProps> = ({ label, value, subtext, icon, color, delay }) => {
    const colors = colorMap[color] || colorMap.blue;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay }}
            className="group relative overflow-hidden bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl shadow-gray-200/50 dark:shadow-none border border-white dark:border-gray-800"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-10 blur-3xl group-hover:opacity-30 transition-opacity ${colors.blur}`} />

            <div className="flex items-start justify-between relative z-10">
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                        {label}
                    </p>
                    <div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                            {value}
                        </h3>
                        {subtext && (
                            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                {subtext}
                            </div>
                        )}
                    </div>
                </div>
                <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    className={`p-4 rounded-2xl ${colors.bg} dark:bg-gray-800 ${colors.text} ring-1 ring-inset ${colors.ring} shadow-lg shadow-gray-200/20 dark:shadow-none`}
                >
                    {icon}
                </motion.div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/50">
                <button className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 group-hover:tracking-widest transition-all uppercase">
                    View Intelligence Summary →
                </button>
            </div>
        </motion.div>
    );
};

interface MasterOverviewProps {
    stats: {
        revenueThisMonth: number;
        revenueGrowth: number;
        occupancyRate: number;
        newLeads7Days: number;
        leadGrowth: number;
        bookingsConfirmed: number;
        outstandingRent: number;
        vacantBeds: number;
    };
}

const MasterOverview: React.FC<MasterOverviewProps> = ({ stats }) => {
    const revenue = Number(stats?.revenueThisMonth || 0);
    const revenueGrowth = Number(stats?.revenueGrowth || 0);
    const occupancy = Number(stats?.occupancyRate || 0);
    const leads = Number(stats?.newLeads7Days || 0);
    const leadGrowth = Number(stats?.leadGrowth || 0);
    const bookings = Number(stats?.bookingsConfirmed || 0);
    const outstanding = Number(stats?.outstandingRent || 0);
    const vacant = Number(stats?.vacantBeds || 0);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <KPICard
                label="Revenue This Month"
                value={`₹${revenue.toLocaleString()}`}
                subtext={`${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}% vs last month`}
                icon={<DollarSign className="w-6 h-6" />}
                color="emerald"
                delay={0.1}
            />
            <KPICard
                label="Occupancy Rate"
                value={`${occupancy.toFixed(1)}%`}
                subtext={`${vacant} beds vacant`}
                icon={<Home className="w-6 h-6" />}
                color="blue"
                delay={0.2}
            />
            <KPICard
                label="New Leads (7 Days)"
                value={leads}
                subtext={`${leadGrowth >= 0 ? '+' : ''}${leadGrowth.toFixed(1)}% velocity`}
                icon={<Users className="w-6 h-6" />}
                color="purple"
                delay={0.3}
            />
            <KPICard
                label="Bookings Confirmed"
                value={bookings}
                subtext="Last 7 days"
                icon={<CheckCircle className="w-6 h-6" />}
                color="amber"
                delay={0.4}
            />
            <KPICard
                label="Outstanding Rent"
                value={`₹${outstanding.toLocaleString()}`}
                subtext={outstanding > 0 ? "Action required" : "All clear"}
                icon={<AlertCircle className="w-6 h-6" />}
                color="rose"
                delay={0.5}
            />
        </div>
    );
};

export default MasterOverview;
