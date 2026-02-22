import { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface Appointment {
    _id: string;
    user_id: {
        _id: string;
        User_Name: string;
        phone_no: number;
        email: string;
    };
    property_id: {
        _id: string;
        property_name: string;
        rate: string;
        city: string;
    };
    status: "Confirmed" | "Pending" | "Canceled";
    createdAt: string;
}

interface UpcomingMeetingsProps {
    appointmentsData: any;
}

export default function UpcomingMeetings({ appointmentsData }: UpcomingMeetingsProps) {
    const [upcoming, setUpcoming] = useState<Appointment[]>([]);

    useEffect(() => {
        let appointmentList = [];
        if (appointmentsData?.appointments?.data && Array.isArray(appointmentsData.appointments.data)) {
            appointmentList = appointmentsData.appointments.data;
        } else if (appointmentsData?.appointments && Array.isArray(appointmentsData.appointments)) {
            appointmentList = appointmentsData.appointments;
        } else if (Array.isArray(appointmentsData)) {
            appointmentList = appointmentsData;
        } else if (appointmentsData?.data && Array.isArray(appointmentsData.data)) {
            appointmentList = appointmentsData.data;
        }

        // Filter to show only confirmed or pending future meetings
        // For now we just show Confirmed or Pending and take top 5
        const filtered = appointmentList
            .filter((app: any) => app.status === "Confirmed" || app.status === "Pending")
            .slice(0, 5);

        setUpcoming(filtered);
    }, [appointmentsData]);

    if (upcoming.length === 0) {
        return (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 h-full">
                <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                            <Calendar size={20} className="text-blue-500" />
                            Upcoming Meetings
                        </h3>
                    </div>
                </div>
                <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                    No upcoming meetings
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 h-full">
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                        <Calendar size={20} className="text-blue-500" />
                        Upcoming Meetings
                    </h3>
                </div>
                <Link to="/editappointments" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    View Calendar
                </Link>
            </div>

            <div className="space-y-4 pt-2">
                {upcoming.map((meeting) => (
                    <div
                        key={meeting._id}
                        className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-800"
                    >
                        <div className="flex-shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-800/50">
                                {meeting.user_id?.User_Name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                    Meeting with {meeting.user_id?.User_Name || "User"}
                                </h4>
                                <Badge
                                    size="sm"
                                    color={meeting.status === "Confirmed" ? "success" : "warning"}
                                >
                                    {meeting.status}
                                </Badge>
                            </div>

                            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <MapPin size={12} className="text-gray-400 dark:text-gray-500" />
                                    <span>{meeting.property_id?.property_name || "Any Property"}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock size={12} className="text-gray-400 dark:text-gray-500" />
                                    <span>Created {new Date(meeting.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
