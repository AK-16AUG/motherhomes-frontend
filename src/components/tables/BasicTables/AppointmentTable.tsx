import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { useEffect, useState } from "react";
import instance from "../../../utils/Axios/Axios";
import { toast } from "react-toastify";
import Button from "../../ui/button/Button";
import { CheckCheckIcon, Cross, PencilIcon } from "lucide-react";
import { TrashBinIcon } from "../../../icons";
import "react-toastify/dist/ReactToastify.css";

type LoadingState = "idle" | "loading" | "success" | "error";

interface Property {
  property_name?: string;
  city?: string;
  state?: string;
  images?: string[];
}

interface Appointment {
  _id: string;
  property_id?: Property;
  schedule_Time: string;
  status: "Pending" | "Confirmed" | "Cancelled";
  createdAt: string;
}

const STATUS_BADGE_MAP = {
  Pending: { color: "yellow", label: "Pending" },
  Confirmed: { color: "green", label: "Confirmed" },
  Cancelled: { color: "red", label: "Cancelled" },
} as const;

export default function AppointmentTable() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [state, setState] = useState<LoadingState>("idle");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Appointment> | null>(null);

  // Fetch role only once from localStorage:
  const role = localStorage.getItem("role"); // example: 'admin', 'agent', 'user'

  // Helper function to check if appointment can be rescheduled
  const canReschedule = (appointmentDate: string) => {
    const now = new Date();
    const appointment = new Date(appointmentDate);
    const timeDiff = appointment.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    return hoursDiff >= 24;
  };

  // Helper function to get minimum date for date input (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const fetchAppointments = async () => {
    try {
      setState("loading");
      const userId = localStorage.getItem("userid");
      if (!userId) {
        throw new Error("User ID not found");
      }
      const response = await instance.get(`/appointments/user/${userId}`);
      const appointmentsData = Array.isArray(response.data?.appointment)
        ? response.data.appointment
        : [];

      // Sort appointments in descending order by createdAt date
      const sortedAppointments = appointmentsData.sort((a: Appointment, b: Appointment) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      setAppointments(sortedAppointments);
      setState("success");
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load appointments. Please try again later."
      );
      setState("error");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const getStatusBadge = (status: Appointment["status"]) => {
    const badgeConfig = STATUS_BADGE_MAP[status] || {
      color: "gray",
      label: "Unknown",
    };
    return <Badge size="sm">{badgeConfig.label}</Badge>;
  };

  const startEditing = (appointment: Appointment) => {
    if (role === "user" && !canReschedule(appointment.schedule_Time)) {
      toast.error(
        "You can only reschedule appointments at least 24 hours in advance"
      );
      return;
    }

    setEditingId(appointment._id);
    setEditData({
      schedule_Time: appointment.schedule_Time,
      status: appointment.status,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData(null);
  };

  const handleEditChange = (field: keyof Appointment, value: unknown) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateAppointment = async () => {
    if (!editingId || !editData) return;
    try {
      setState("loading");
      await instance.put(`/appointments/${editingId}`, editData);
      toast.success("Appointment updated successfully");
      await fetchAppointments();
      setEditingId(null);
      setEditData(null);
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Failed to update appointment");
      setState("error");
    }
  };

  const confirmDelete = (id: string) => {
    toast.warn(
      <div className="flex flex-col gap-2">
        <span>Are you sure you want to delete this appointment?</span>
        <div className="flex gap-2">
          <button
            onClick={() => handleDeleteAppointment(id)}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => {
              toast.dismiss();
            }}
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
      }
    );
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      setState("loading");
      await instance.delete(`/appointments/${id}`);
      toast.dismiss(); // Dismiss the confirmation toast
      toast.success("Appointment deleted successfully");
      await fetchAppointments();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Failed to delete appointment");
      setState("error");
    }
  };

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    createdDate: "",
    appointmentDate: "",
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus = filters.status ? apt.status === filters.status : true;
    const matchesCreatedDate = filters.createdDate
      ? new Date(apt.createdAt).toLocaleDateString() ===
      new Date(filters.createdDate).toLocaleDateString()
      : true;
    const matchesAppointmentDate = filters.appointmentDate
      ? new Date(apt.schedule_Time).toLocaleDateString() ===
      new Date(filters.appointmentDate).toLocaleDateString()
      : true;
    return matchesStatus && matchesCreatedDate && matchesAppointmentDate;
  });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Filters Section */}
      <div className="p-4 flex gap-4 flex-wrap border-b border-gray-100">
        <select
          className="border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Created:</span>
          <input
            type="date"
            className="border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            value={filters.createdDate}
            onChange={(e) => handleFilterChange("createdDate", e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Appt Date:</span>
          <input
            type="date"
            className="border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            value={filters.appointmentDate}
            onChange={(e) => handleFilterChange("appointmentDate", e.target.value)}
          />
        </div>
        <button
          onClick={() => setFilters({ status: "", createdDate: "", appointmentDate: "" })}
          className="text-sm text-blue-500 hover:text-blue-700 underline"
        >
          Clear Filters
        </button>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table aria-label="Appointments list">
          <TableHeader>
            <TableRow>
              <TableCell isHeader className="text-left px-5 py-3">
                Property
              </TableCell>
              <TableCell isHeader className="text-left px-5 py-3">
                Location
              </TableCell>
              <TableCell isHeader className="text-left px-5 py-3">
                Appointment Date
              </TableCell>
              <TableCell isHeader className="text-left px-5 py-3">
                Status
              </TableCell>
              <TableCell isHeader className="text-left px-5 py-3">
                Booked On
              </TableCell>
              <TableCell isHeader className="text-left px-5 py-3">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredAppointments.map((appointment) => (
              <TableRow key={appointment._id}>
                <TableCell className="text-left px-5 py-3 font-medium">
                  {appointment.property_id?.property_name || "Unknown"}
                </TableCell>
                <TableCell className="text-left px-5 py-3">
                  <div>
                    <span>{appointment.property_id?.city || "N/A"}</span>
                    <span className="block text-gray-400">
                      {appointment.property_id?.state || "N/A"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-left px-5 py-3">
                  {editingId === appointment._id ? (
                    <div className="flex flex-col gap-1">
                      <input
                        type="date"
                        value={editData?.schedule_Time?.split("T")[0] || ""}
                        onChange={(e) =>
                          handleEditChange("schedule_Time", e.target.value)
                        }
                        min={role === "user" ? getMinDate() : undefined}
                        className="border border-gray-300 rounded px-3 py-2 w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        style={{
                          colorScheme: "light",
                          minWidth: "150px",
                        }}
                        onFocus={(e) => e.target.showPicker?.()}
                      />
                      {role === "user" && (
                        <span className="text-xs text-blue-600">
                          Select a date at least 24 hours in advance
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>{formatDate(appointment.schedule_Time)}</span>
                      {role === "user" &&
                        !canReschedule(appointment.schedule_Time) && (
                          <span className="text-xs text-amber-600 whitespace-nowrap">
                            (Cannot reschedule - less than 24hrs)
                          </span>
                        )}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-left px-5 py-3">
                  {editingId === appointment._id ? (
                    role === "user" ? (
                      <div className="px-2 py-1">
                        {getStatusBadge(appointment.status)}
                      </div>
                    ) : (
                      <select
                        value={editData?.status || "Pending"}
                        onChange={(e) =>
                          handleEditChange("status", e.target.value)
                        }
                        className="border rounded px-2 py-1 w-32"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    )
                  ) : (
                    getStatusBadge(appointment.status)
                  )}
                </TableCell>
                <TableCell className="text-left px-5 py-3">
                  {formatDate(appointment.createdAt)}
                </TableCell>
                <TableCell className="text-left px-5 py-3">
                  {editingId === appointment._id ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        color="green"
                        onClick={handleUpdateAppointment}
                      >
                        <CheckCheckIcon className="h-4 w-4" />
                      </Button>
                      <Button size="sm" color="red" onClick={cancelEditing}>
                        <Cross className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      {(role === "admin" || role === "agent") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(appointment)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      )}
                      {role === "user" &&
                        canReschedule(appointment.schedule_Time) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(appointment)}
                            title="Reschedule appointment"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        )}
                      {!(
                        role === "user" && appointment.status === "Confirmed"
                      ) && (
                          <Button
                            size="sm"
                            variant="outline"
                            color="red"
                            onClick={() => confirmDelete(appointment._id)}
                          >
                            <TrashBinIcon className="h-4 w-4" />
                          </Button>
                        )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {state === "loading" && (
          <div className="flex justify-center p-4">
            <span>Loading appointments...</span>
          </div>
        )}
      </div>
    </div>
  );
}
