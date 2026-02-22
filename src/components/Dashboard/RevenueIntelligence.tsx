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
    const trend = data?.trend || [];
    const byType = data?.byType || [];
    const averageRent = Number(data?.averageRent || 0);
    const insightList = insights || [];

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
            categories: trend.map((t) => t?.month || ""),
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { colors: "#94a3b8", fontWeight: 600 } },
        },
        yaxis: { show: false },
        dataLabels: { enabled: false },
        tooltip: { theme: "dark", x: { show: true } },
    };

    const areaSeries = [{ name: "Revenue", data: trend.map((t) => Number(t?.amount || 0)) }];

    return (
        <div className="grid grid-cols-12 gap-8 mt-10">
            {/* Revenue Trend Chart */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="col-span-12 lg:col-span-8 bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-500/5 border border-gray-100 dark:border-gray-800"
            >
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tighter">
                            <TrendingUp className="text-indigo-600 w-8 h-8" /> Revenue Intelligence
                        </h3>
                        <p className="text-[10px] text-gray-400 font-black mt-2 uppercase tracking-[0.3em]">Predictive yield analysis</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-indigo-500 tracking-[0.2em] uppercase mb-1">Avg. Yield / Unit</p>
                        <h4 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">₹{averageRent.toLocaleString()}</h4>
                    </div>
                </div>

                <div className="h-[320px] -mx-4">
                    <Chart options={areaOptions} series={areaSeries} type="area" height="100%" />
                </div>
            </motion.div>

            {/* Distribution & Insights */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="col-span-12 lg:col-span-4 flex flex-col gap-8"
            >
                {/* Room Type Distribution */}
                <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl shadow-gray-200/50 dark:shadow-none border border-white dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-8">
                        <PieChart className="w-6 h-6 text-indigo-600" />
                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Portfolio Mix</h3>
                    </div>
                    <div className="space-y-6">
                        {byType.map((type, idx) => {
                            const total = byType.reduce((acc, curr) => acc + Number(curr.total || 0), 0);
                            const percent = total > 0 ? (Number(type.total || 0) / total) * 100 : 0;

                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="space-y-2"
                                >
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                        <span>{type?._id || "Other"} sharing</span>
                                        <span className="text-gray-900 dark:text-white">₹{Number(type?.total || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percent}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-indigo-600 rounded-full"
                                        />
                                    </div>
                                </motion.div>
                            );
                        })}
                        {byType.length === 0 && (
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest text-center py-4 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">Synchronizing Mix Data</p>
                        )}
                    </div>
                </div>

                {/* AI Insights Box */}
                <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-500/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Target className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black tracking-tighter uppercase">Strategic AI</h3>
                    </div>
                    <div className="space-y-4 relative z-10">
                        {insightList.length > 0 ? (
                            insightList.map((insight, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <span className="text-indigo-200 mt-1">●</span>
                                    <p className="text-sm font-bold leading-relaxed text-indigo-50">
                                        {insight}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm font-bold text-indigo-100 opacity-80 uppercase tracking-widest">Efficiency metrics within target range.</p>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RevenueIntelligence;
