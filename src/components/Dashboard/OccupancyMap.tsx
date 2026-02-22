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

    return (
        <div className="mt-10 bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <LayoutGrid className="text-blue-600" /> Occupancy & Inventory Map
                    </h3>
                    <p className="text-sm text-gray-500 font-bold mt-1 uppercase tracking-widest">Real-time status grid</p>
                </div>

                <div className="flex flex-wrap gap-4">
                    {Object.entries(statusColors).map(([status, color]) => (
                        <div key={status} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                            <span className={`w-3 h-3 rounded-full ${color}`} />
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 capitalize">{status}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                {rooms.map((room, idx) => (
                    <motion.div
                        key={room.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        onClick={() => setSelectedRoom(room)}
                        className={`
              aspect-square rounded-2xl cursor-pointer relative group flex flex-col items-center justify-center
              ${statusColors[room.status]} shadow-lg shadow-${statusColors[room.status].split('-')[1]}-500/20
            `}
                    >
                        <span className="text-white font-black text-lg">{room.flatNo || room.name.charAt(0)}</span>
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                            <Info className="text-white w-5 h-5" />
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {selectedRoom && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mt-10 p-8 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-8"
                    >
                        <div className="flex items-center gap-6">
                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white ${statusColors[selectedRoom.status]} shadow-xl shadow-opacity-20`}>
                                <UserIcon className="w-10 h-10" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{selectedRoom.name}</h4>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Unit {selectedRoom.flatNo} • {selectedRoom.type}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-10">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Monthly Rent</p>
                                <p className="text-xl font-black text-gray-900 dark:text-white tracking-widest">₹{selectedRoom.rent}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Status</p>
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${statusColors[selectedRoom.status]}`}>
                                    {selectedRoom.status}
                                </span>
                            </div>
                            <button className="px-8 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-gray-900 dark:hover:border-gray-400 transition-all">
                                Management Console
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OccupancyMap;
