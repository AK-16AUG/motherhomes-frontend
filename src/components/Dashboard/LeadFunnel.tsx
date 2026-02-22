import React from "react";
import { motion } from "framer-motion";
import { Filter, Users, Flame, Droplets, Snowflake, Phone } from "lucide-react";

interface FunnelStage {
    stage: string;
    value: number;
}

interface Lead {
    name: string;
    phone: string;
    type: string;
    activity: string;
    temp: 'hot' | 'warm' | 'cold';
    icon: string;
}

interface LeadFunnelProps {
    data: {
        total: number;
        funnel: FunnelStage[];
    };
    smartQueue?: Lead[];
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
        <div className="grid grid-cols-12 gap-8 mt-8">
            {/* Funnel Visualization */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="col-span-12 lg:col-span-7 bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800"
            >
                <div className="mb-10">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Filter className="text-orange-500" size={20} /> Asset Funnel
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Conversion pipeline performance</p>
                </div>

                <div className="space-y-6">
                    {funnelStages.map((stage, idx) => {
                        const stageValue = Number(stage?.value || 0);
                        const percentage = totalLeads > 0 ? (stageValue / totalLeads) * 100 : 0;
                        return (
                            <div key={stage?.stage || idx} className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{stage?.stage || "Unknown"}</span>
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">{stageValue}</span>
                                </div>
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${percentage}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1, delay: idx * 0.1 }}
                                        className="h-full bg-indigo-600 rounded-full"
                                    />
                                </div>
                            </div>
                        );
                    })}
                    {funnelStages.length === 0 && (
                        <div className="py-12 text-center border border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
                            <p className="text-sm text-gray-400">No funnel data available</p>
                        </div>
                    )}
                </div>

                <div className="mt-10 p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">Operational Insight</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {totalLeads < 8 ? "Lead volume is currently low. Collect more data for trend analysis." : "Funnel efficiency is stable. Review the conversion steps to identify potential optimizations."}
                    </p>
                </div>
            </motion.div>

            {/* Lead Quality Scoring */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="col-span-12 lg:col-span-5 bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800"
            >
                <div className="mb-10">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="text-indigo-600" size={20} /> Smart Queue
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Priority lead interactions</p>
                </div>

                <div className="space-y-3">
                    {smartQueue.length > 0 ? smartQueue.map((lead, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between p-4 rounded-xl border border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800`}>
                                    {getIcon(lead.icon)}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{lead.name}</h4>
                                    <p className="text-xs text-gray-500">{lead.type} • {lead.activity}</p>
                                </div>
                            </div>
                            <a href={`tel:${lead.phone}`} className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
                                <Phone size={16} />
                            </a>
                        </div>
                    )) : (
                        <div className="py-12 text-center border border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
                            <p className="text-sm text-gray-400">No active leads</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default LeadFunnel;
