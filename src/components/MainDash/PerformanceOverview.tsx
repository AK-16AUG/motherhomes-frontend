import React from "react";
import { Users, Target, TrendingUp, DollarSign } from "lucide-react";

interface KPIProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    trendColor?: string;
    bgColor: string;
}

const KPICard: React.FC<KPIProps> = ({ label, value, icon, trend, trendColor, bgColor }) => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${bgColor}`}>
                {icon}
            </div>
            {trend && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendColor}`}>
                    {trend}
                </span>
            )}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
                {label}
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {value}
            </h3>
        </div>
    </div>
);

interface PerformanceOverviewProps {
    stats: {
        totalUsers: number;
        activeUsers: number;
        totalProperties: number;
        occupiedProperties: number;
        totalLeads: number;
        totalAppointments: number;
        totalRevenue: number;
        occupancyRate: number;
    };
}

const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
                label="Total Revenue"
                value={`₹${(stats.totalRevenue || 0).toLocaleString()}`}
                icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
                trend="+12.5%"
                trendColor="bg-emerald-100 text-emerald-700"
                bgColor="bg-emerald-50 dark:bg-emerald-900/20"
            />
            <KPICard
                label="Active Students"
                value={stats.activeUsers || 0}
                icon={<Users className="w-6 h-6 text-blue-600" />}
                trend="+5.2%"
                trendColor="bg-blue-100 text-blue-700"
                bgColor="bg-blue-50 dark:bg-blue-900/20"
            />
            <KPICard
                label="Occupancy Rate"
                value={`${(stats.occupancyRate || 0).toFixed(1)}%`}
                icon={<TrendingUp className="w-6 h-6 text-amber-600" />}
                trend="High Demand"
                trendColor="bg-amber-100 text-amber-700"
                bgColor="bg-amber-50 dark:bg-amber-900/20"
            />
            <KPICard
                label="Total Leads"
                value={stats.totalLeads || 0}
                icon={<Target className="w-6 h-6 text-purple-600" />}
                trend="+18%"
                trendColor="bg-purple-100 text-purple-700"
                bgColor="bg-purple-50 dark:bg-purple-900/20"
            />
        </div>
    );
};

export default PerformanceOverview;
