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
    smartQueue?: {
        name: string;
        type: string;
        activity: string;
        temp: string;
        icon: string;
    }[];
}

const LeadFunnel: React.FC<LeadFunnelProps> = ({ data, smartQueue = [] }) => {
    const funnelStages = Array.isArray(data?.funnel) ? data.funnel : [];
    const totalLeads = Number(data?.total || 0);

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case "Flame": return <Flame className="text-orange-500 w-5 h-5" />;
            case "Droplets": return <Droplets className="text-blue-400 w-5 h-5" />;
            case "Snowflake": return <Snowflake className="text-indigo-300 w-5 h-5" />;
            default: return <Snowflake className="text-indigo-300 w-5 h-5" />;
        }
    };

    return (
        <div className="grid grid-cols-12 gap-8 mt-10">
            {/* Funnel Visualization */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="col-span-12 lg:col-span-7 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-[3rem] p-10 shadow-2xl shadow-gray-200/50 dark:shadow-none border border-white dark:border-gray-800"
            >
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tighter uppercase font-outline">
                            <Filter className="text-orange-500 w-8 h-8" /> Asset Funnel
                        </h3>
                        <p className="text-[10px] text-gray-400 font-black mt-2 uppercase tracking-[0.3em]">Conversion pipeline velocity</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {funnelStages.map((stage, idx) => {
                        const stageValue = Number(stage?.value || 0);
                        const percentage = totalLeads > 0 ? (stageValue / totalLeads) * 100 : 0;
                        return (
                            <div key={stage?.stage || idx} className="relative group">
                                <div className="flex items-center justify-between mb-3 relative z-10 px-8">
                                    <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">{stage?.stage || "Unknown"}</span>
                                    <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{stageValue}</span>
                                </div>
                                <div className="h-16 bg-gray-50 dark:bg-gray-800/50 rounded-[1.25rem] overflow-hidden relative border border-gray-100 dark:border-gray-700/50 shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${percentage}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.5, type: "spring", stiffness: 50, delay: idx * 0.1 }}
                                        className={`h-full bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-600 opacity-20 relative`}
                                    >
                                        <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors" />
                                    </motion.div>
                                    <div className="absolute inset-y-0 left-8 flex items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1 w-1 rounded-full bg-orange-500 animate-pulse" />
                                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                                {percentage.toFixed(0)}% Retention
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {funnelStages.length === 0 && (
                        <div className="py-16 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2.5rem]">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Calibrating Pipeline Metrics</p>
                        </div>
                    )}
                </div>

                <div className="mt-10 p-8 rounded-[2rem] bg-orange-50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/20 shadow-inner">
                    <p className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-[0.3em] mb-2">Automated Audit</p>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed">
                        {totalLeads < 8 ? "Cumulative lead volume low. Statistical significance pending for bottleneck analysis." : "Noticeable leakage detected in conversion steps. Review follow-up speed recommended."}
                        <span className="text-orange-600 dark:text-orange-400 ml-3 cursor-pointer hover:tracking-widest transition-all uppercase text-[10px] font-black">Generate Report →</span>
                    </p>
                </div>
            </motion.div>

            {/* Lead Quality Scoring */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="col-span-12 lg:col-span-5 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-[3rem] p-10 shadow-2xl shadow-indigo-500/5 dark:shadow-none border border-white dark:border-gray-800"
            >
                <div className="mb-12">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tighter uppercase">
                        <Users className="text-indigo-600 w-7 h-7" /> Smart Queue
                    </h3>
                    <p className="text-[10px] text-gray-400 font-black mt-2 uppercase tracking-[0.3em]">AI-prioritized reach outs</p>
                </div>

                <div className="space-y-4">
                    {smartQueue.length > 0 ? smartQueue.map((lead, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ x: 10, backgroundColor: "rgba(249, 250, 251, 0.5)" }}
                            className="flex items-center justify-between p-5 rounded-3xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-800 group relative overflow-hidden"
                        >
                            <div className="flex items-center gap-5 relative z-10">
                                <div className={`p-3 rounded-2xl bg-white dark:bg-gray-800 shadow-sm transition-transform group-hover:scale-110 ${lead.temp === 'hot' ? 'animate-pulse ring-2 ring-orange-500/20' : ''}`}>
                                    {getIcon(lead.icon)}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-lg">{lead.name}</h4>
                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{lead.type} • {lead.activity}</p>
                                </div>
                            </div>
                            <button className="p-3.5 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 opacity-0 group-hover:opacity-100 transition-all active:scale-90 relative z-10">
                                <Phone className="w-4 h-4" />
                            </button>
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${lead.temp === 'hot' ? 'bg-orange-500' : lead.temp === 'warm' ? 'bg-blue-400' : 'bg-indigo-300'}`} />
                        </motion.div>
                    )) : (
                        <div className="py-10 text-center border border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">No active leads in queue</p>
                        </div>
                    )}
                </div>

                <button className="w-full mt-10 py-5 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-[1.5rem] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/30 active:scale-[0.98]">
                    Launch Acquisition Lab
                </button>
            </motion.div>
        </div>
    );
};

export default LeadFunnel;
