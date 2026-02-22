import React from "react";
import { motion } from "framer-motion";
import { Filter, Users, Flame, Droplets, Snowflake, Phone } from "lucide-react";

interface FunnelStage {
    stage: string;
    value: number;
}

interface LeadFunnelProps {
    data: {
        total: number;
        funnel: FunnelStage[];
    };
}

const LeadFunnel: React.FC<LeadFunnelProps> = ({ data }) => {
    return (
        <div className="grid grid-cols-12 gap-8 mt-10">
            {/* Funnel Visualization */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="col-span-12 lg:col-span-7 bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800"
            >
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                            <Filter className="text-orange-500" /> Conversion Funnel
                        </h3>
                        <p className="text-sm text-gray-500 font-bold mt-1 uppercase tracking-widest">Growth pipeline efficiency</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {data.funnel.map((stage, idx) => {
                        const percentage = (stage.value / data.total) * 100;
                        return (
                            <div key={stage.stage} className="relative">
                                <div className="flex items-center justify-between mb-2 relative z-10 px-6">
                                    <span className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">{stage.stage}</span>
                                    <span className="text-lg font-black text-gray-900 dark:text-white">{stage.value}</span>
                                </div>
                                <div className="h-14 bg-gray-50 dark:bg-gray-800/50 rounded-2xl overflow-hidden relative">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${percentage}%` }}
                                        transition={{ duration: 1, delay: idx * 0.1 }}
                                        className={`h-full bg-gradient-to-r from-orange-400 to-rose-500 opacity-20`}
                                    />
                                    <div className="absolute inset-y-0 left-6 flex items-center">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            {percentage.toFixed(0)}% Conversion
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 p-6 rounded-3xl bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20">
                    <p className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-[0.2em] mb-1">Funnel Insight</p>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        Large drop-off after "Visits". Likely pricing hesitation or room mismatch.
                        <span className="text-rose-600 dark:text-rose-400 ml-2 cursor-pointer hover:underline uppercase text-xs font-black">Run Audit →</span>
                    </p>
                </div>
            </motion.div>

            {/* Lead Quality Scoring */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="col-span-12 lg:col-span-5 bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800"
            >
                <div className="mb-8">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <Users className="text-violet-600" /> High-Intent Leads
                    </h3>
                    <p className="text-sm text-gray-500 font-bold mt-1 uppercase tracking-widest">Smart priority list</p>
                </div>

                <div className="space-y-6">
                    {[
                        { name: "Rahul S.", type: "Single", activity: "3 mins ago", temp: "hot", icon: <Flame className="text-orange-500" /> },
                        { name: "Priya V.", type: "2 Sharing", activity: "1 hour ago", temp: "warm", icon: <Droplets className="text-blue-400" /> },
                        { name: "Amit K.", type: "Single", activity: "5 hours ago", temp: "cold", icon: <Snowflake className="text-indigo-300" /> },
                        { name: "Sanya M.", type: "3 Sharing", activity: "2 days ago", temp: "cold", icon: <Snowflake className="text-indigo-300" /> },
                    ].map((lead, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700 group">
                            <div className="flex items-center gap-4">
                                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-xl group-hover:scale-110 transition-transform">
                                    {lead.icon}
                                </div>
                                <div>
                                    <h4 className="font-black text-gray-900 dark:text-white tracking-tight">{lead.name}</h4>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{lead.type} • {lead.activity}</p>
                                </div>
                            </div>
                            <button className="p-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg shadow-gray-200 dark:shadow-none translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                                <Phone className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                <button className="w-full mt-8 py-4 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-violet-600 hover:text-white transition-all">
                    Open Sales Dashboard
                </button>
            </motion.div>
        </div>
    );
};

export default LeadFunnel;
