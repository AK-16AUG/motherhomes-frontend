import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { motion } from "framer-motion";
import { TrendingUp, Target, PieChart } from "lucide-react";

interface RevenueTrend {
    month: string;
    amount: number;
}

interface RevenueByType {
    _id: string;
    total: number;
    count: number;
}

interface RevenueIntelligenceProps {
    data: {
        trend: RevenueTrend[];
        byType: RevenueByType[];
        averageRent: number;
    };
    insights: string[];
}

const RevenueIntelligence: React.FC<RevenueIntelligenceProps> = ({ data, insights }) => {
    const areaOptions: ApexOptions = {
        colors: ["#6366f1"],
        chart: {
            type: "area",
            fontFamily: "Outfit, sans-serif",
            toolbar: { show: false },
            sparkline: { enabled: false },
        },
        stroke: { curve: "smooth", width: 4 },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.1,
                stops: [0, 90, 100],
            },
        },
        grid: { show: false },
        xaxis: {
            categories: data.trend.map((t) => t.month),
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { colors: "#94a3b8", fontWeight: 600 } },
        },
        yaxis: { show: false },
        dataLabels: { enabled: false },
        tooltip: { theme: "dark", x: { show: true } },
    };

    const areaSeries = [{ name: "Revenue", data: data.trend.map((t) => t.amount) }];

    return (
        <div className="grid grid-cols-12 gap-8 mt-10">
            {/* Revenue Trend Chart */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="col-span-12 lg:col-span-8 bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-500/5 border border-gray-100 dark:border-gray-800"
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="text-indigo-500" /> Revenue Intelligence
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">Monthly performance tracking</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-indigo-500 tracking-widest uppercase">Avg. Rent / Bed</p>
                        <h4 className="text-2xl font-black text-gray-900 dark:text-white">₹{data.averageRent.toLocaleString()}</h4>
                    </div>
                </div>

                <div className="h-[300px] -mx-4">
                    <Chart options={areaOptions} series={areaSeries} type="area" height="100%" />
                </div>
            </motion.div>

            {/* Distribution & Insights */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="col-span-12 lg:col-span-4 flex flex-col gap-6"
            >
                {/* Room Type Distribution */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-500/20">
                    <div className="flex items-center gap-2 mb-6">
                        <PieChart className="w-5 h-5 text-indigo-200" />
                        <h3 className="text-lg font-bold">Revenue by Room Type</h3>
                    </div>
                    <div className="space-y-4">
                        {data.byType.map((type, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <span className="capitalize font-medium text-indigo-100">{type._id} sharing</span>
                                <span className="font-black">₹{type.total.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Insights Box */}
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-[2rem] p-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-emerald-600" />
                        <h3 className="text-lg font-extrabold text-emerald-900 dark:text-emerald-400">Smart Insights</h3>
                    </div>
                    <div className="space-y-3">
                        {insights.length > 0 ? (
                            insights.map((insight, idx) => (
                                <p key={idx} className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 leading-relaxed">
                                    " {insight} "
                                </p>
                            ))
                        ) : (
                            <p className="text-sm font-medium text-emerald-600">Operations running optimally.</p>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RevenueIntelligence;
