import { useEffect, useState } from "react";
import {
  Search,
  Download,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from "lucide-react";
import instance from "../../utils/Axios/Axios";
import Button from "../../components/ui/button/Button";
import { Link } from "react-router-dom";
import { LoadingSpinner } from "../../components/ui/loading";
import { toast, ToastContainer } from "react-toastify";

interface Appointment {
  _id: string;
  user_id: {
    _id: string;
    User_Name: string;
    email: string;
  };
  property_id: {
    _id: string;
    property_name: string;
    images: string[];
  };
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed" |"Convert to lead";
  schedule_Time: string;
  createdAt: string;
}

export default function DataTableWithStatus() {
  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [page, setPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<Appointment["status"]>("Pending");
  const [editDate, setEditDate] = useState("");

  const fetchAppointments = async (pageNum = 1, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await instance.get(
        `/appointments?page=${pageNum}&limit=${entriesPerPage}&search=${searchTerm}`
      );
      const newAppointments = response.data.appointments.data || [];

      if (pageNum === 1) {
        setData(newAppointments);
      } else {
        setData((prev) => [...prev, ...newAppointments]);
      }

      setHasMore(newAppointments.length === entriesPerPage);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    setPage(1);
    fetchAppointments(1);
  }, [searchTerm, entriesPerPage]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAppointments(nextPage, true);
  };

  const startEditing = (appointment: Appointment) => {
    setEditingId(appointment._id);
    setEditStatus(appointment.status);
    setEditDate(
      new Date(appointment.schedule_Time).toISOString().split("T")[0]
    );
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleUpdate = async (id: string) => {
    try {
      setUpdating(id);
      const updatedData = {
        status: editStatus,
        schedule_Time: editDate,
      };

      await instance.put(`/appointments/${id}`, updatedData);
      
      // Update the local state instead of reloading
      setData(prev => prev.map(appointment => 
        appointment._id === id 
          ? { ...appointment, status: editStatus, schedule_Time: editDate }
          : appointment
      ));
      toast.success("Appointment updated successfully!");
      setEditingId(null);
    } catch (error) {
      toast.error("Unable to update appointment");
      console.error("Error updating appointment:", error);
    } finally {
      setUpdating(null);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      
      const csv = [
        ["User", "Property", "Scheduled Date", "Status"],
        ...data.map((row) => [
          row.user_id.User_Name,
          row?.property_id?.property_name,
          new Date(row.schedule_Time).toLocaleDateString(),
          row.status,
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", "appointments.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading appointments:", error);
    } finally {
      setDownloading(false);
    }
  };

  const filteredData = data.filter((appointment) =>
    Object.values(appointment).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const currentData = filteredData.slice(
    (page - 1) * entriesPerPage,
    page * entriesPerPage
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Loading skeleton component
  const TableSkeleton = () => (
    <div className="animate-pulse">
      {[...Array(5)].map((_, index) => (
        <tr key={index} className="border-b dark:border-gray-700">
          <td className="py-3 px-2 sm:px-4">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            </div>
          </td>
          <td className="py-3 px-2 sm:px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
            </div>
          </td>
          <td className="py-3 px-2 sm:px-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </td>
          <td className="py-3 px-2 sm:px-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
          </td>
          <td className="py-3 px-2 sm:px-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
          </td>
        </tr>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8 lg:p-10">
      <ToastContainer position="bottom-center" />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Appointments
        </h2>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="entries"
              className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap"
            >
              Show
            </label>
            <select
              id="entries"
              className="border dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setPage(1);
              }}
              disabled={loading}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
            <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
              entries
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-48">
              <Search className="absolute top-2 left-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-8 pr-4 py-2 border dark:border-gray-600 rounded text-sm w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                disabled={loading}
              />
            </div>
            <button
              onClick={handleDownload}
              disabled={downloading || loading || data.length === 0}
              className="flex items-center gap-1 px-3 py-2 border dark:border-gray-600 rounded text-sm w-full sm:w-auto justify-center bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <LoadingSpinner size="sm" color="primary" />
                  <span className="hidden sm:inline">Downloading...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Download</span>
                  <Download size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
              <tr>
                <th className="py-3 px-2 sm:px-4 text-left">User</th>
                <th className="py-3 px-2 sm:px-4 text-left">Property</th>
                <th className="py-3 px-2 sm:px-4 text-left">Scheduled Date</th>
                <th className="py-3 px-2 sm:px-4 text-left">Status</th>
                <th className="py-3 px-2 sm:px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton />
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm ? "No appointments found matching your search." : "No appointments available."}
                  </td>
                </tr>
              ) : (
                currentData.map((appointment) => (
                  <tr
                    key={appointment._id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-3 px-2 sm:px-4">
                      <div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">
                          {appointment.user_id?.User_Name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {appointment.user_id?.email}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 sm:px-4">
                      <div className="flex items-center gap-3">
                        {appointment?.property_id?.images[0] && (
                          <div className="w-10 h-10 overflow-hidden rounded-md">
                            <img
                              src={appointment?.property_id?.images[0]}
                              alt={appointment?.property_id?.property_name}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                        <Link
                          to={`/listing/${appointment?.property_id?._id}`}
                          className="text-blue-500 dark:text-blue-400 underline hover:text-blue-600 dark:hover:text-blue-300"
                        >
                          {appointment?.property_id?.property_name}
                        </Link>
                      </div>
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-gray-500 dark:text-gray-400">
                      {editingId === appointment?._id ? (
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="border dark:border-gray-600 rounded p-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          disabled={updating === appointment._id}
                        />
                      ) : (
                        new Date(appointment.schedule_Time).toLocaleDateString()
                      )}
                    </td>
                    <td className="py-3 px-2 sm:px-4">
                      {editingId === appointment._id ? (
                        <select
                          value={editStatus}
                          onChange={(e) =>
                            setEditStatus(e.target.value as Appointment["status"])
                          }
                          className="border dark:border-gray-600 rounded p-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          disabled={updating === appointment._id}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Completed">Completed</option>
                          <option value="Convert to lead"> Convert to lead</option>
                         
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 sm:px-4">
                      {editingId === appointment._id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdate(appointment._id)}
                            disabled={updating === appointment._id}
                            className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Save"
                          >
                            {updating === appointment._id ? (
                              <LoadingSpinner size="sm" color="primary" />
                            ) : (
                              <Check size={16} />
                            )}
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={updating === appointment._id}
                            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditing(appointment)}
                            disabled={updating === appointment._id}
                            className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Load More Loading */}
        {loadingMore && (
          <div className="flex justify-center p-4">
            <LoadingSpinner size="md" color="primary" />
          </div>
        )}

        {/* Pagination and Load More */}
        {!loading && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-400 gap-4">
              <div className="order-2 sm:order-1">
                Showing {Math.min((page - 1) * entriesPerPage + 1, filteredData.length)} to{" "}
                {Math.min(page * entriesPerPage, filteredData.length)} of{" "}
                {filteredData.length} entries
              </div>
              <div className="flex items-center gap-1 order-1 sm:order-2">
                <button
                  className="p-2 rounded border dark:border-gray-600 text-gray-400 dark:text-gray-500 disabled:opacity-50 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      className={`px-3 py-1 rounded border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 ${
                        page === pageNum
                          ? "bg-gray-100 dark:bg-gray-600 font-medium"
                          : ""
                      }`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 5 && page < totalPages - 2 && (
                  <span className="px-1 text-gray-500 dark:text-gray-400">...</span>
                )}

                {totalPages > 5 && page < totalPages - 2 && (
                  <button
                    className="px-3 py-1 rounded border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600"
                    onClick={() => setPage(totalPages)}
                  >
                    {totalPages}
                  </button>
                )}

                <button
                  className="p-2 rounded border dark:border-gray-600 text-gray-400 dark:text-gray-500 disabled:opacity-50 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {hasMore && !loadingMore && (
              <div className="flex justify-center p-4">
                <Button 
                  onClick={loadMore} 
                  variant="outline"
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
