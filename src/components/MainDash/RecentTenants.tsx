import { Link } from "react-router-dom";

interface Tenant {
    id: string;
    name: string;
    flatNo: string;
    rent: string;
    propertyId: string;
}

interface RecentTenantsProps {
    tenants: Tenant[];
}

export default function RecentTenants({ tenants }: RecentTenantsProps) {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 h-full">
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Recent Tenants
                    </h3>
                </div>
                <Link to="/tenantinfo" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    View All
                </Link>
            </div>

            <div className="space-y-4">
                {tenants && tenants.length > 0 ? (
                    tenants.map((tenant) => (
                        <Link
                            key={tenant.id}
                            to={`/tenant/${tenant.id}`}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                    {tenant.name.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-800 dark:text-white/90 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {tenant.name}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        Flat No: {tenant.flatNo || "N/A"}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    ₹{tenant.rent}/mo
                                </span>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">Active</p>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                        No recent tenants found
                    </div>
                )}
            </div>
        </div>
    );
}
