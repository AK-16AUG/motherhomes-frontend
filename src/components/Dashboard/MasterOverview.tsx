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

const colorMap: Record<string, { bg: string, text: string }> = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600 dark:text-emerald-400" },
    blue: { bg: "bg-blue-50", text: "text-blue-600 dark:text-blue-400" },
    purple: { bg: "bg-purple-50", text: "text-purple-600 dark:text-purple-400" },
    amber: { bg: "bg-amber-50", text: "text-amber-600 dark:text-amber-400" },
    rose: { bg: "bg-rose-50", text: "text-rose-600 dark:text-rose-400" },
};

const KPICard: React.FC<KPIProps> = ({ label, value, subtext, icon, color, delay }) => {
    const colors = colorMap[color] || colorMap.blue;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800"
        >
            <div className="flex items-start justify-between">
                <div className="space-y-3">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {label}
                    </p>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {value}
                        </h3>
                        {subtext && (
                            <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                {subtext}
                            </div>
                        )}
                    </div>
                </div>
                <div className={`p-3 rounded-xl ${colors.bg} dark:bg-gray-800 ${colors.text}`}>
                    {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 20 }) : icon}
                </div>
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
                icon={<DollarSign />}
                color="emerald"
                delay={0.1}
            />
            <KPICard
                label="Occupancy Rate"
                value={`${occupancy.toFixed(1)}%`}
                subtext={`${vacant} beds vacant`}
                icon={<Home />}
                color="blue"
                delay={0.2}
            />
            <KPICard
                label="New Leads (7 Days)"
                value={leads}
                subtext={`${leadGrowth >= 0 ? '+' : ''}${leadGrowth.toFixed(1)}% velocity`}
                icon={<Users />}
                color="purple"
                delay={0.3}
            />
            <KPICard
                label="Bookings Confirmed"
                value={bookings}
                subtext="Last 7 days"
                icon={<CheckCircle />}
                color="amber"
                delay={0.4}
            />
            <KPICard
                label="Outstanding Rent"
                value={`₹${outstanding.toLocaleString()}`}
                subtext={outstanding > 0 ? "Action required" : "All clear"}
                icon={<AlertCircle />}
                color="rose"
                delay={0.5}
            />
        </div>
    );
};

export default MasterOverview;
