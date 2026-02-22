import { Link } from "react-router-dom";
import Badge from "../ui/badge/Badge";

interface Flat {
    id: string;
    name: string;
    flatNo: string;
    status: string;
    price: string;
}

interface RecentFlatsProps {
    flats: Flat[];
}

export default function RecentFlats({ flats }: RecentFlatsProps) {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 h-full">
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Recent Flats
                    </h3>
                </div>
                <Link to="/alllisting" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    View All
                </Link>
            </div>

            <div className="space-y-4">
                {flats && flats.length > 0 ? (
                    flats.map((flat) => (
                        <Link
                            key={flat.id}
                            to={`/listing/${flat.id}`}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-800 dark:text-white/90 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {flat.name}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        Flat No: {flat.flatNo || "N/A"}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    ₹{flat.price}
                                </span>
                                <Badge
                                    size="sm"
                                    color={flat.status === 'Occupied' ? 'success' : 'warning'}
                                >
                                    {flat.status}
                                </Badge>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                        No recent flats found
                    </div>
                )}
            </div>
        </div>
    );
}
