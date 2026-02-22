import React from "react";
import { motion } from "framer-motion";
import { HeartPulse, Zap, AlertTriangle, ShieldCheck, CheckSquare } from "lucide-react";

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
        <div className="grid grid-cols-12 gap-8 mt-8 pb-12">
            {/* Tenant Health Panel */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="col-span-12 lg:col-span-6 bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800"
            >
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <HeartPulse className="text-rose-600" size={20} /> Community Health
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Tenant retention and risk monitoring</p>
                    </div>
                    <div className="px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl flex items-center gap-3 border border-rose-100 dark:border-rose-900/30">
                        <span className="font-bold text-xl">{atRiskCount}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider leading-tight">High<br />Risk</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="p-5 rounded-xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20">
                        <div className="flex items-center gap-3 mb-2">
                            <AlertTriangle size={16} className="text-rose-600" />
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Attention Required</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {atRiskCount > 0
                                ? `${atRiskCount} tenants require follow-up due to outstanding queries or late payments.`
                                : "All community metrics are within normal parameters. No immediate interventions needed."}
                        </p>
                    </div>

                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div className="flex items-center gap-4">
                            <ShieldCheck size={18} className="text-indigo-600" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Retention</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{retention}</span>
                    </div>
                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div className="flex items-center gap-4">
                            <Zap size={18} className="text-emerald-500" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolution Velocity</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{resolutionVelocity}</span>
                    </div>
                </div>
            </motion.div>

            {/* Action Center */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="col-span-12 lg:col-span-6 bg-indigo-600 rounded-2xl p-8 text-white shadow-lg shadow-indigo-500/20"
            >
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <CheckSquare className="text-white" size={20} /> Task Manager
                        </h3>
                        <p className="text-sm text-indigo-100 mt-1">Daily operational checklist</p>
                    </div>
                    <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Active
                    </div>
                </div>

                <div className="space-y-3">
                    {insightList.map((insight, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/15 border border-white/5 rounded-xl cursor-pointer transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-1.5 w-1.5 rounded-full bg-white/60" />
                                <p className="text-sm font-medium text-white">{insight}</p>
                            </div>
                        </div>
                    ))}

                    {insightList.length === 0 && (
                        <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                            <p className="text-sm text-indigo-100">All tasks completed for today.</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">System Sync Active</span>
                </div>
            </motion.div>
        </div>
    );
};

export default TenantHealth;
