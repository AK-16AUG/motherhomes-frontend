import React from "react";
import { motion } from "framer-motion";
import { HeartPulse, Zap, AlertTriangle, ShieldCheck, CheckSquare, BellRing } from "lucide-react";

interface TenantHealthProps {
    atRisk: number;
    insights: string[];
}

const TenantHealth: React.FC<TenantHealthProps> = ({ atRisk, insights }) => {
    return (
        <div className="grid grid-cols-12 gap-8 mt-10 pb-10">
            {/* Tenant Health Panel */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="col-span-12 lg:col-span-6 bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800"
            >
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                            <HeartPulse className="text-rose-500" /> Tenant Health & Risk
                        </h3>
                        <p className="text-sm text-gray-500 font-bold mt-1 uppercase tracking-widest">Community wellness tracking</p>
                    </div>
                    <div className="px-4 py-2 bg-rose-50 dark:bg-rose-500/10 rounded-2xl border border-rose-100 dark:border-rose-500/20">
                        <span className="text-rose-600 dark:text-rose-400 font-black text-lg">{atRisk}</span>
                        <span className="text-[10px] font-black text-rose-500/70 uppercase tracking-widest ml-2">At Risk</span>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-4 mb-3">
                            <AlertTriangle className="text-amber-500 w-5 h-5" />
                            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Renewal Warning</h4>
                        </div>
                        <p className="text-sm font-bold text-gray-600 dark:text-gray-400 leading-relaxed">
                            3 tenants in Sector 62 haven't confirmed renewal after their notice period.
                            <span className="text-blue-600 ml-2 cursor-pointer font-black text-xs uppercase tracking-widest">Notify Manager →</span>
                        </p>
                    </div>

                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                            <ShieldCheck className="text-emerald-500" />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Average Stay Duration</span>
                        </div>
                        <span className="text-lg font-black text-gray-900 dark:text-white">8.4 Months</span>
                    </div>
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                            <BellRing className="text-indigo-500" />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Complaint Resolution Time</span>
                        </div>
                        <span className="text-lg font-black text-gray-900 dark:text-white">4.2 Hours</span>
                    </div>
                </div>
            </motion.div>

            {/* Smart Action Center */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="col-span-12 lg:col-span-6 bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-500/20"
            >
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h3 className="text-2xl font-black flex items-center gap-3">
                            <Zap className="text-yellow-400 fill-yellow-400" /> Smart Action Center
                        </h3>
                        <p className="text-sm text-indigo-300 font-bold mt-1 uppercase tracking-widest">AI-Driven Daily Suggestions</p>
                    </div>
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                        <Zap className="text-white w-6 h-6" />
                    </div>
                </div>

                <div className="space-y-4">
                    {insights.map((insight, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ x: 10 }}
                            className="group flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl cursor-pointer transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-2 rounded-full bg-yellow-400 group-hover:animate-ping" />
                                <p className="text-sm font-bold leading-relaxed">{insight}</p>
                            </div>
                            <CheckSquare className="w-5 h-5 text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    ))}

                    <motion.div
                        whileHover={{ x: 10 }}
                        className="group flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl cursor-pointer transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            <p className="text-sm font-bold leading-relaxed">Follow up with 5 hot leads today.</p>
                        </div>
                        <CheckSquare className="w-5 h-5 text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                </div>

                <div className="mt-10 pt-8 border-t border-white/10 flex justify-between items-center text-xs font-black uppercase tracking-[0.2em] text-indigo-300">
                    <span>Automation Active</span>
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Performance Monitor
                    </span>
                </div>
            </motion.div>
        </div>
    );
};

export default TenantHealth;
