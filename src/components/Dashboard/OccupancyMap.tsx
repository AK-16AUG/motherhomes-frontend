import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Info, User as UserIcon } from "lucide-react";

interface Room {
    id: string;
    name: string;
    flatNo: string;
    status: 'vacant' | 'occupied' | 'notice' | 'booked';
    rent: string;
    type: string;
}

interface OccupancyMapProps {
    rooms: Room[];
}

const statusColors = {
    vacant: "bg-emerald-500",
    occupied: "bg-blue-600",
    notice: "bg-amber-400",
    booked: "bg-indigo-500",
};

const OccupancyMap: React.FC<OccupancyMapProps> = ({ rooms }) => {
    const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null);
    const roomList = Array.isArray(rooms) ? rooms : [];

    return (
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <LayoutGrid className="text-indigo-600" size={20} /> Occupancy Map
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Real-time inventory overview</p>
                </div>

                <div className="flex flex-wrap gap-4">
                    {Object.entries(statusColors).map(([status, color]) => (
                        <div key={status} className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{status}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
                {roomList.map((room, idx) => (
                    <motion.div
                        key={room?.id || idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.01 }}
                        onClick={() => setSelectedRoom(room)}
                        className={`
                            aspect-square rounded-lg cursor-pointer relative flex items-center justify-center
                            ${statusColors[room?.status || 'vacant']} border border-black/5
                            hover:scale-105 hover:z-10 transition-transform
                        `}
                    >
                        <span className="text-white font-bold text-sm tracking-tight">{room?.flatNo || "?"}</span>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {selectedRoom && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-8 p-6 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{selectedRoom.name || "Available Unit"}</h4>
                                <p className="text-xs text-gray-500">Unit {selectedRoom.flatNo} • {selectedRoom.type}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-10">
                            <div className="text-right sm:text-left">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Monthly Rent</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">₹{Number(selectedRoom.rent || 0).toLocaleString()}</p>
                            </div>
                            <div className="text-right sm:text-left">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Status</p>
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                    {selectedRoom.status.toUpperCase()}
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedRoom(null)}
                                className="p-2 text-gray-400 hover:text-gray-600"
                            >
                                <Info size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OccupancyMap;
