import React from "react";
import { motion } from "framer-motion";
import { HeartPulse, Zap, AlertTriangle, ShieldCheck, CheckSquare, BellRing } from "lucide-react";

interface TenantHealthProps {
    data: {
        atRisk: number;
        retention: string;
        resolutionVelocity: string;
    };
    insights: string[];
}

const TenantHealth: React.FC<TenantHealthProps> = ({ data, insights }) => {
    const atRiskCount = Number(data?.atRisk || 0);
    const insightList = Array.isArray(insights) ? insights : [];
    const retention = data?.retention || "8.4 Months";
    const resolutionVelocity = data?.resolutionVelocity || "4.2 Hours";

    return (
        <div className="grid grid-cols-12 gap-8 mt-10 pb-16">
            {/* Tenant Health Panel */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="col-span-12 lg:col-span-6 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-[3rem] p-10 shadow-2xl shadow-gray-200/50 dark:shadow-none border border-white dark:border-gray-800"
            >
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tighter uppercase">
                            <HeartPulse className="text-rose-600 w-8 h-8" /> Community Health
                        </h3>
                        <p className="text-[10px] text-gray-400 font-black mt-2 uppercase tracking-[0.3em]">Wellness & risk mitigation</p>
                    </div>
                    <div className="px-6 py-3 bg-rose-600 rounded-[1.5rem] shadow-xl shadow-rose-500/30 flex items-center gap-4">
                        <span className="text-white font-black text-2xl tracking-tighter">{atRiskCount}</span>
                        <div className="h-4 w-[1px] bg-white/30" />
                        <span className="text-[10px] font-black text-rose-100 uppercase tracking-widest leading-none">High<br />Risk</span>
                    </div>
                </div>

                <div className="space-y-6">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-8 rounded-[2rem] bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 bg-rose-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <AlertTriangle className="text-rose-600 w-6 h-6" />
                            <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Priority Intervention</h4>
                        </div>
                        <p className="text-sm font-bold text-gray-600 dark:text-gray-300 leading-relaxed relative z-10">
                            {atRiskCount > 0
                                ? `${atRiskCount} tenants exhibit anomalous activity signals. Immediate retention protocol recommended.`
                                : "No high-risk tenant anomalies detected. Community sentiment remains optimal."}
                            {atRiskCount > 0 && (
                                <button className="block mt-4 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest hover:tracking-[0.2em] transition-all">Execute Outreach →</button>
                            )}
                        </p>
                    </motion.div>

                    <div className="flex items-center justify-between px-8 py-6 bg-gray-50/50 dark:bg-gray-800/30 rounded-3xl">
                        <div className="flex items-center gap-5">
                            <ShieldCheck className="text-indigo-600 w-6 h-6" />
                            <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Global Retention</span>
                        </div>
                        <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">{retention}</span>
                    </div>
                    <div className="flex items-center justify-between px-8 py-6 bg-gray-50/50 dark:bg-gray-800/30 rounded-3xl">
                        <div className="flex items-center gap-5">
                            <BellRing className="text-emerald-500 w-6 h-6" />
                            <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Resolution Velocity</span>
                        </div>
                        <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">{resolutionVelocity}</span>
                    </div>
                </div>
            </motion.div>

            {/* Smart Action Center */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="col-span-12 lg:col-span-6 bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-500/30 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-[500px] h-[500px] -mr-64 -mt-64 bg-white/5 rounded-full blur-[100px]" />

                <div className="flex items-center justify-between mb-12 relative z-10">
                    <div>
                        <h3 className="text-3xl font-black flex items-center gap-3 tracking-tighter uppercase">
                            <Zap className="text-yellow-400 fill-yellow-400 w-8 h-8" /> Action Terminal
                        </h3>
                        <p className="text-[10px] text-indigo-200 font-black mt-2 uppercase tracking-[0.3em]">AI-Synthesized daily protocols</p>
                    </div>
                    <div className="px-6 py-3 bg-white/10 backdrop-blur-xl rounded-[1.5rem] border border-white/20">
                        <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                    </div>
                </div>

                <div className="space-y-4 relative z-10">
                    {insightList.map((insight, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ x: 12, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                            className="group flex items-center justify-between p-7 bg-white/5 backdrop-blur-md border border-white/5 rounded-[2rem] cursor-pointer transition-all"
                        >
                            <div className="flex items-center gap-5">
                                <div className="h-2 w-2 rounded-full bg-yellow-400 group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                                <p className="text-sm font-bold leading-relaxed text-indigo-50">{insight}</p>
                            </div>
                            <CheckSquare className="w-6 h-6 text-indigo-300 opacity-20 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    ))}

                    {insightList.length === 0 && (
                        <motion.div
                            whileHover={{ x: 12, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                            className="group flex items-center justify-between p-7 bg-white/5 backdrop-blur-md border border-white/5 rounded-[2rem] cursor-pointer transition-all"
                        >
                            <div className="flex items-center gap-5">
                                <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                <p className="text-sm font-bold leading-relaxed text-indigo-50">Calibrate yield metrics for next quarter.</p>
                            </div>
                            <CheckSquare className="w-6 h-6 text-indigo-300 opacity-20 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    )}
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-50" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Neural Sync: Optimal</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TenantHealth;
