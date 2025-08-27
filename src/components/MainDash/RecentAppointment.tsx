import { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import instance from "../../utils/Axios/Axios";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
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
    images: string[];
    city: string;
    state: string;
    bed: number;
    bathroom: number;
  };
  status: "Confirmed" | "Pending" | "Canceled";
  createdAt: string;
}

export default function RecentAppointment() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await instance.get("/appointments");
        
        const data = response.data;
        console.log("API Response:", data);
        
        if (data?.appointments && Array.isArray(data.appointments.data)) {
          setAppointments(data.appointments.data);
        } else if (Array.isArray(data)) {
          setAppointments(data);
        } else {
          setError("Invalid data format received from server");
        }
      } catch (err) {
        setError("Failed to fetch appointments");
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Appointments
          </h3>
        </div>

        <div className="flex items-center gap-3">
      <Link to={"/editappointments"}>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            See all
          </button>
          </Link>
        </div>
      </div>
      
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Property
              </TableCell>
              <TableCell className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                User
              </TableCell>
              <TableCell className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Price
              </TableCell>
              <TableCell className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Status
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <TableRow key={appointment._id}>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      {appointment?.property_id?.images?.[0] && (
                        <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                          <img
                            src={appointment.property_id.images[0]}
                            className="h-[50px] w-[50px] object-cover"
                            alt={appointment.property_id.property_name || "Property"}
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {appointment?.property_id?.property_name || "N/A"}
                        </p>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                          {appointment?.property_id?.bed || 0} Beds, {appointment?.property_id?.bathroom || 0} Baths
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {appointment?.user_id?.User_Name || "N/A"}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {appointment?.user_id?.email || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500 text-theme-sm dark:text-gray-400">
                    ₹{appointment?.property_id?.rate || "0"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      size="sm"
                      color={
                        appointment?.status === "Confirmed"
                          ? "success"
                          : appointment?.status === "Pending"
                          ? "primary"
                          : "error"
                      }
                    >
                      {appointment?.status || "Unknown"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="text-center py-6 text-gray-500">
                  No appointments found
                </TableCell>
                
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}