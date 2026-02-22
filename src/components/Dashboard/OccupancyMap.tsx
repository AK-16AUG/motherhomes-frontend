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
        <div className="mt-10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-[3rem] p-10 shadow-2xl shadow-gray-200/50 dark:shadow-none border border-white dark:border-gray-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
                <div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tighter">
                        <LayoutGrid className="text-indigo-600 w-8 h-8" /> Occupancy Map
                    </h3>
                    <p className="text-[10px] text-gray-400 font-black mt-2 uppercase tracking-[0.3em]">Real-time inventory intelligence</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    {Object.entries(statusColors).map(([status, color]) => (
                        <div key={status} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                            <span className={`w-2 h-2 rounded-full ${color} ${status === 'vacant' ? 'animate-pulse' : ''}`} />
                            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{status}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-5">
                {roomList.map((room, idx) => (
                    <motion.div
                        key={room?.id || idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: idx * 0.01
                        }}
                        whileHover={{
                            y: -8,
                            rotateX: 10,
                            rotateY: 10,
                            scale: 1.1,
                            transition: { duration: 0.2 }
                        }}
                        onClick={() => setSelectedRoom(room)}
                        className={`
                            aspect-square rounded-[1.5rem] cursor-pointer relative group flex flex-col items-center justify-center
                            ${statusColors[room?.status || 'vacant']} shadow-xl shadow-${(statusColors[room?.status || 'vacant'] || 'gray').split('-')[1]}-500/30
                            transition-shadow hover:shadow-2xl
                        `}
                    >
                        <span className="text-white font-black text-xl tracking-tighter">{room?.flatNo || room?.name?.charAt(0) || "?"}</span>
                        {room?.status === 'vacant' && (
                            <span className="absolute top-2 right-2 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                        )}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem] flex items-center justify-center">
                            <Info className="text-white w-6 h-6" />
                        </div>
                    </motion.div>
                ))}
                {roomList.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-gray-50/50 dark:bg-gray-800/30 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px]">Inventory Currently Synchronizing</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedRoom && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className="mt-12 p-10 rounded-[2.5rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-500/30 flex flex-col lg:flex-row items-center justify-between gap-10"
                    >
                        <div className="flex items-center gap-8">
                            <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-inner">
                                <UserIcon className="w-12 h-12 text-white" />
                            </div>
                            <div className="space-y-2 text-center lg:text-left">
                                <h4 className="text-3xl font-black tracking-tighter uppercase">{selectedRoom.name || "System Unit"}</h4>
                                <p className="text-xs font-black text-indigo-100 uppercase tracking-[0.3em]">Module {selectedRoom.flatNo || "N/A"} • Category {selectedRoom.type || "PG"}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center lg:justify-end gap-12 lg:gap-16">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.3em] mb-2">Monthly yield</p>
                                <p className="text-3xl font-black tracking-tighter">₹{Number(selectedRoom.rent || 0).toLocaleString()}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.3em] mb-2">Lifecycle State</p>
                                <span className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-white text-indigo-600 shadow-lg">
                                    {selectedRoom.status || "vacant"}
                                </span>
                            </div>
                            <button className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95">
                                Full Control Console
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OccupancyMap;
