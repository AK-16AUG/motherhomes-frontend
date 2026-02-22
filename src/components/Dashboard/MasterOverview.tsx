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

const KPICard: React.FC<KPIProps> = ({ label, value, subtext, icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="relative overflow-hidden group bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800"
    >
        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity bg-${color}-500`} />

        <div className="flex items-start justify-between relative z-10">
            <div className="space-y-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {label}
                </p>
                <div>
                    <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        {value}
                    </h3>
                    {subtext && (
                        <p className="mt-1 text-xs font-semibold text-emerald-500 flex items-center gap-1">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {subtext}
                        </p>
                    )}
                </div>
            </div>
            <div className={`p-4 rounded-2xl bg-${color}-50 dark:bg-${color}-500/10 text-${color}-600 dark:text-${color}-400 ring-1 ring-inset ring-${color}-500/10`}>
                {icon}
            </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800/50">
            <button className="text-xs font-bold text-gray-400 group-hover:text-gray-600 dark:hover:text-gray-200 transition-colors uppercase tracking-widest">
                View Details →
            </button>
        </div>
    </motion.div>
);

interface MasterOverviewProps {
    stats: {
        revenueThisMonth: number;
        occupancyRate: number;
        newLeads7Days: number;
        bookingsConfirmed: number;
        outstandingRent: number;
        vacantBeds: number;
    };
}

const MasterOverview: React.FC<MasterOverviewProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <KPICard
                label="Revenue This Month"
                value={`₹${stats.revenueThisMonth.toLocaleString()}`}
                subtext="+12% vs last month"
                icon={<DollarSign className="w-6 h-6" />}
                color="emerald"
                delay={0.1}
            />
            <KPICard
                label="Occupancy Rate"
                value={`${stats.occupancyRate.toFixed(1)}%`}
                subtext={`${stats.vacantBeds} beds vacant`}
                icon={<Home className="w-6 h-6" />}
                color="blue"
                delay={0.2}
            />
            <KPICard
                label="New Leads (7 Days)"
                value={stats.newLeads7Days}
                subtext="18 high-intent"
                icon={<Users className="w-6 h-6" />}
                color="purple"
                delay={0.3}
            />
            <KPICard
                label="Bookings Confirmed"
                value={stats.bookingsConfirmed}
                subtext="23% conversion rate"
                icon={<CheckCircle className="w-6 h-6" />}
                color="amber"
                delay={0.4}
            />
            <KPICard
                label="Outstanding Rent"
                value={`₹${stats.outstandingRent.toLocaleString()}`}
                icon={<AlertCircle className="w-6 h-6" />}
                color="rose"
                delay={0.5}
            />
        </div>
    );
};

export default MasterOverview;
