import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  EventInput,
  DateSelectArg,
  EventClickArg,
  DayCellContentArg,
} from "@fullcalendar/core";
import instance from "../utils/Axios/Axios";
import {
  Check,
  X,
  Calendar as CalendarIcon,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { LoadingButton, LoadingSpinner } from "../components/ui/loading";

interface User {
  _id: string;
  User_Name: string;
  email: string;
  phone_no: number;
}

interface Property {
  _id: string;
  property_name: string;
  images: string[];
}

interface Appointment {
  _id: string;
  user_id: User;
  property_id: Property;
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed";
  schedule_Time?: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  message: string;
  appointments: {
    data: Appointment[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

interface AppointmentCounts {
  [date: string]: number;
}

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] =
    useState<Appointment["status"]>("Pending");
  const [editDate, setEditDate] = useState("");
  const [appointmentCounts, setAppointmentCounts] = useState<AppointmentCounts>(
    {}
  );
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDateAppointments, setSelectedDateAppointments] = useState<
    Appointment[]
  >([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentView, setCurrentView] = useState<string>("dayGridMonth");
  const [currentDate, setCurrentDate] = useState(new Date());
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await instance.get<ApiResponse>("/appointments");
      const fetchedAppointments = response?.data?.appointments?.data || [];
      setAppointments(fetchedAppointments);

      // Calculate appointment counts per date
      const counts: AppointmentCounts = {};
      fetchedAppointments.forEach((appointment) => {
        const date = new Date(
          appointment?.schedule_Time || appointment?.createdAt
        ).toLocaleDateString("en-CA");
        counts[date] = (counts[date] || 0) + 1;
      });
      setAppointmentCounts(counts);

      // Convert appointments to FullCalendar events with view-specific display
      const calendarEvents = fetchedAppointments.map((appointment) => ({
        id: appointment?._id,
        title: getEventTitle(appointment, currentView),
        start: appointment?.schedule_Time || appointment?.createdAt,
        extendedProps: {
          status: appointment?.status,
          user: appointment?.user_id,
          property: appointment?.property_id,
          phone: appointment?.phone,
        },
        backgroundColor: getStatusColor(appointment?.status).bg,
        borderColor: getStatusColor(appointment?.status).border,
        textColor: getStatusColor(appointment?.status).text,
        display: currentView === "dayGridMonth" ? "background" : "block",
        classNames: [`appointment-${appointment?.status?.toLowerCase()}`],
      }));

      setEvents(calendarEvents);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add effect to refetch when view changes
  useEffect(() => {
    fetchAppointments();
  }, [currentView]);

  // Helper function to get event title based on view
  const getEventTitle = (appointment: Appointment, view: string) => {
    const userName = appointment?.user_id?.User_Name || "Unknown User";
    const propertyName =
      appointment?.property_id?.property_name || "Unknown Property";

    switch (view) {
      case "dayGridMonth":
        return `${userName}`;
      case "timeGridWeek":
        return `${userName} - ${propertyName.substring(0, 20)}${
          propertyName.length > 20 ? "..." : ""
        }`;
      case "timeGridDay":
        return `${userName}\n${propertyName}\n${
          appointment?.phone || "No phone"
        }`;
      default:
        return `${userName} - ${propertyName}`;
    }
  };

  // Enhanced navigation functions
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    if (calendarRef.current) {
      calendarRef.current.getApi().today();
    }
  };

  const goToPrevious = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.prev();
      setCurrentDate(calendarApi.getDate());
    }
  };

  const goToNext = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.next();
      setCurrentDate(calendarApi.getDate());
    }
  };

  // Handle view change with better navigation
  const handleViewChange = (view: string) => {
    setCurrentView(view);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(view);
      setCurrentDate(calendarApi.getDate());
    }
  };

  // Get formatted title based on current view and date
  const getViewTitle = () => {
    const options: Intl.DateTimeFormatOptions = {};

    switch (currentView) {
      case "dayGridMonth":
        options.year = "numeric";
        options.month = "long";
        return currentDate.toLocaleDateString(undefined, options);
      case "timeGridWeek":
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        if (weekStart.getMonth() === weekEnd.getMonth()) {
          return `${weekStart.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
          })} ${weekStart.getDate()}-${weekEnd.getDate()}`;
        } else {
          return `${weekStart.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })} - ${weekEnd.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}`;
        }
      case "timeGridDay":
        options.weekday = "long";
        options.year = "numeric";
        options.month = "long";
        options.day = "numeric";
        return currentDate.toLocaleDateString(undefined, options);
      default:
        return currentDate.toLocaleDateString();
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const selectedDate = selectInfo.startStr; // 'YYYY-MM-DD'
    setSelectedDate(selectedDate);

    // Filter appointments for the selected date
    const dateAppointments = appointments.filter((appointment) => {
      const appointmentDate = new Date(
        appointment?.schedule_Time || appointment?.createdAt
      ).toLocaleDateString("en-CA");
      return appointmentDate === selectedDate;
    });

    setSelectedDateAppointments(dateAppointments);

    // Show modal on mobile/tablet, show sidebar on desktop
    if (window.innerWidth < 1024) {
      setShowModal(true);
      setShowSidebar(false);
    } else {
      setShowSidebar(true);
      setShowModal(false);
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const eventId = clickInfo?.event?.id;
    const appointment = appointments.find((a) => a?._id === eventId);
    if (appointment) {
      setEditingId(appointment._id);
      setEditStatus(appointment.status);
      setEditDate(
        new Date(appointment?.schedule_Time || appointment?.createdAt)
          .toISOString()
          .split("T")[0]
      );
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const updatedData = {
        status: editStatus,
        schedule_Time: new Date(editDate).toISOString(),
      };

      const response = await instance.put<{ appointment: Appointment }>(
        `/appointments/${id}`,
        updatedData
      );

      setAppointments((prev) =>
        prev.map((app) => (app?._id === id ? response?.data?.appointment : app))
      );

      // Update the appointment counts
      const newDate = new Date(updatedData.schedule_Time)
        .toISOString()
        .split("T")[0];
      const oldAppointment = appointments.find((a) => a._id === id);
      const oldDate = oldAppointment
        ? new Date(oldAppointment?.schedule_Time || oldAppointment?.createdAt)
            .toISOString()
            .split("T")[0]
        : "";

      if (oldDate !== newDate) {
        setAppointmentCounts((prev) => {
          const updated = { ...prev };
          if (updated[oldDate] > 1) {
            updated[oldDate] -= 1;
          } else {
            delete updated[oldDate];
          }
          updated[newDate] = (updated[newDate] || 0) + 1;
          return updated;
        });
      }

      // Update the calendar event
      setEvents((prev) =>
        prev.map((event) =>
          event?.id === id
            ? {
                ...event,
                start: updatedData.schedule_Time,
                extendedProps: {
                  ...event?.extendedProps,
                  status: updatedData.status,
                },
                backgroundColor: getStatusColor(updatedData.status).bg,
                borderColor: getStatusColor(updatedData.status).border,
                textColor: getStatusColor(updatedData.status).text,
              }
            : event
        )
      );

      setEditingId(null);

      // Update the selected date appointments if the modal is open
      if (showModal) {
        setSelectedDateAppointments((prev) =>
          prev.map((app) =>
            app._id === id ? response?.data?.appointment : app
          )
        );
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return { bg: "#d1fae5", border: "#10b981", text: "#065f46" };
      case "Pending":
        return { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" };
      case "Cancelled":
        return { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" };
      case "Completed":
        return { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" };
      default:
        return { bg: "#e5e7eb", border: "#9ca3af", text: "#4b5563" };
    }
  };

  // Custom day cell content to show appointment counts
  const renderDayCellContent = (arg: DayCellContentArg) => {
    const date = arg.date.toLocaleDateString("en-CA");
    const count = appointmentCounts[date] || 0;
    const isToday = new Date().toLocaleDateString("en-CA") === date;

    // Determine badge color based on count
    let badgeColor = "";
    if (count > 3) {
      badgeColor = "bg-red-100 text-red-800";
    } else if (count > 1) {
      badgeColor = "bg-yellow-100 text-yellow-800";
    } else if (count > 0) {
      badgeColor = "bg-blue-100 text-blue-800";
    }

    return (
      <div className="h-full min-h-[60px] flex flex-col">
        <div
          className={`self-start mb-auto ${
            isToday ? "font-bold text-blue-600" : ""
          }`}
        >
          {arg.dayNumberText}
        </div>
        {count > 0 && (
          <div className="w-full flex justify-center mt-1">
            <div
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}
            >
              {count} {count === 1 ? "appt" : "appts"}
            </div>
          </div>
        )}
      </div>
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderAppointmentCard = (appointment: Appointment) => {
    const isEditing = editingId === appointment._id;
    const statusColor = getStatusColor(appointment.status);

    return (
      <div
        key={appointment._id}
        className={`relative overflow-hidden rounded-lg border transition-all duration-200 ${
          isEditing
            ? "bg-blue-50 border-blue-200 shadow-md"
            : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
        }`}
      >
        {/* Status indicator bar */}
        <div
          className="absolute top-0 left-0 w-1 h-full"
          style={{ backgroundColor: statusColor.border }}
        />

        <div className="p-4 pl-6">
          {isEditing ? (
            <div className="space-y-4">
              {/* Editing header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-blue-700">
                  Editing Appointment
                </span>
              </div>

              {/* Status selector */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value as Appointment["status"])
                  }
                  className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="Pending">🟡 Pending</option>
                  <option value="Confirmed">🟢 Confirmed</option>
                  <option value="Cancelled">🔴 Cancelled</option>
                  <option value="Completed">🔵 Completed</option>
                </select>
              </div>

              {/* Date selector */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Schedule Time
                </label>
                <input
                  type="datetime-local"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 justify-end pt-2 border-t border-blue-200">
                <button
                  onClick={() => handleUpdate(appointment._id)}
                  className="px-4 py-2 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-all duration-200 hover:shadow-sm"
                >
                  <Check size={16} /> Save Changes
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-all duration-200"
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Header with status and time */}
              <div className="flex justify-between items-start">
                <div
                  className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5"
                  style={{
                    backgroundColor: statusColor.bg,
                    color: statusColor.text,
                    border: `1px solid ${statusColor.border}20`,
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: statusColor.border }}
                  />
                  {appointment?.status}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {appointment?.schedule_Time
                      ? formatTime(appointment.schedule_Time)
                      : formatTime(appointment?.createdAt || "")}
                  </div>
                  <div className="text-xs text-gray-500">
                    {appointment?.schedule_Time
                      ? formatDate(appointment.schedule_Time)
                      : formatDate(appointment?.createdAt || "")}
                  </div>
                </div>
              </div>

              {/* Customer information */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CalendarIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900 truncate">
                      {appointment?.user_id?.User_Name || "Unknown User"}
                    </div>
                    <div className="text-xs text-gray-600">Customer</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900">
                      {appointment?.phone ||
                        appointment?.user_id?.phone_no ||
                        "No phone"}
                    </div>
                    <div className="text-xs text-gray-600">Contact</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 truncate">
                      {appointment?.property_id?.property_name ||
                        "Unknown Property"}
                    </div>
                    <div className="text-xs text-gray-600">Property</div>
                  </div>
                </div>
              </div>

              {/* Edit button */}
              <div className="pt-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    setEditingId(appointment._id);
                    setEditStatus(appointment.status);
                    setEditDate(
                      new Date(
                        appointment?.schedule_Time || appointment?.createdAt
                      )
                        .toISOString()
                        .slice(0, 16)
                    );
                  }}
                  className="w-full py-2 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-medium transition-all duration-200 rounded-md border border-transparent hover:border-blue-200"
                >
                  ✏️ Edit Appointment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Add window resize handler
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        if (showSidebar) {
          setShowSidebar(false);
          setShowModal(true);
        }
      } else {
        if (showModal) {
          setShowModal(false);
          setShowSidebar(true);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [showModal, showSidebar]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] h-full flex flex-col">
      {/* Enhanced header with better navigation */}
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="flex flex-col gap-3">
          {/* Title and view switcher row */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold">
              Appointment Calendar
            </h2>

            {/* View switcher */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleViewChange("dayGridMonth")}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all ${
                  currentView === "dayGridMonth"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => handleViewChange("timeGridWeek")}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all ${
                  currentView === "timeGridWeek"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => handleViewChange("timeGridDay")}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all ${
                  currentView === "timeGridDay"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Day
              </button>
            </div>
          </div>

          {/* Navigation controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevious}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Previous"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={goToNext}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Next"
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Today
              </button>
            </div>

            <div className="text-right">
              <h3 className="text-lg font-semibold text-gray-900">
                {getViewTitle()}
              </h3>
              <p className="text-xs text-gray-500">
                {appointments.length} total appointments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Display loading indicator when data is being fetched */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
          <LoadingSpinner size="lg" color="primary" />
        </div>
      )}

      {/* Flex container with improved height calculation for mobile */}
      <div className="flex flex-col lg:flex-row flex-grow min-h-0 overflow-hidden relative">
        {/* Calendar section */}
        <div
          className={`${
            showSidebar ? "lg:w-[70%]" : "w-full"
          } flex-grow min-h-0`}
        >
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={false} // We'll use our custom header
            events={events}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            dayCellContent={
              currentView === "dayGridMonth" ? renderDayCellContent : undefined
            }
            loading={(isLoading) => setLoading(isLoading)}
            height="auto"
            contentHeight="auto"
            aspectRatio={
              currentView === "dayGridMonth"
                ? 1.35
                : currentView === "timeGridWeek"
                ? 1.8
                : 2.2
            }
            eventDisplay={
              currentView === "dayGridMonth" ? "background" : "block"
            }
            dayMaxEvents={currentView === "dayGridMonth" ? false : 3}
            moreLinkClick="popover"
            eventTimeFormat={{
              hour: "numeric",
              minute: "2-digit",
              omitZeroMinute: false,
              meridiem: "short",
            }}
            slotLabelFormat={{
              hour: "numeric",
              minute: "2-digit",
              omitZeroMinute: false,
              meridiem: "short",
            }}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={false}
            nowIndicator={true}
            scrollTime="09:00:00"
            viewDidMount={(arg) => {
              setCurrentView(arg.view.type);
              setCurrentDate(arg.view.currentStart);
            }}
            datesSet={(arg) => {
              setCurrentDate(arg.start);
            }}
          />
        </div>

        {/* Improved sidebar for desktop - clean layout with proper spacing */}
        {showSidebar && (
          <div className="hidden lg:flex lg:flex-col lg:w-[30%] border-l border-gray-200 h-full">
            <div className="sticky top-0 p-4 border-b flex justify-between items-center bg-gray-50 z-10">
              <h2 className="text-lg font-semibold flex items-center">
                <CalendarIcon className="mr-2" size={18} />
                <div className="flex flex-col">
                  <span>{formatDate(selectedDate)}</span>
                  <span className="text-xs text-gray-600">
                    {selectedDateAppointments.length}{" "}
                    {selectedDateAppointments.length === 1
                      ? "appointment"
                      : "appointments"}
                  </span>
                </div>
              </h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* This div should be scrollable */}
            <div className="flex-grow overflow-y-auto p-4">
              {selectedDateAppointments.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <CalendarIcon className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                  <p>No appointments for this date.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateAppointments.map((appointment) =>
                    renderAppointmentCard(appointment)
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Improved modal for mobile and tablet with transparent background */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start sm:items-center justify-center z-[100000] p-2 sm:p-3 md:p-4 overflow-y-auto pt-16 sm:pt-20">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md md:max-w-2xl lg:max-w-4xl max-h-[85vh] my-4 overflow-hidden">
            <div className="sticky top-0 p-3 md:p-4 border-b flex justify-between items-center bg-gray-50 z-10">
              <h2 className="text-base md:text-lg font-semibold flex items-center truncate">
                <CalendarIcon className="mr-2 flex-shrink-0" size={18} />
                <div className="truncate">
                  <div className="truncate">{formatDate(selectedDate)}</div>
                  <div className="text-xs text-gray-600">
                    {selectedDateAppointments.length}{" "}
                    {selectedDateAppointments.length === 1
                      ? "appointment"
                      : "appointments"}
                  </div>
                </div>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors ml-2 flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-3 md:p-4 overflow-y-auto max-h-[calc(85vh-9rem)]">
              {selectedDateAppointments.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <CalendarIcon className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                  <p>No appointments for this date.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {selectedDateAppointments.map((appointment) =>
                    renderAppointmentCard(appointment)
                  )}
                </div>
              )}
            </div>

            <div className="p-3 md:p-4 border-t flex justify-end bg-gray-50">
              <LoadingButton
                onClick={() => setShowModal(false)}
                variant="secondary"
                size="md"
                className="transition-colors"
              >
                Close
              </LoadingButton>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced styling with view-specific improvements */}
      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .fc-scroller::-webkit-scrollbar {
          width: 6px;
        }
        
        .fc-scroller::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        .fc-scroller::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        .fc-scroller::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        .overflow-y-auto::-webkit-scrollbar {
          width: 0px;
        }

        .overflow-y-auto {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Fix calendar container height */
        .fc {
          height: auto !important;
          min-height: 500px;
          width: 100%;
        }

        .fc .fc-view-harness {
          height: auto !important;
          min-height: 500px;
        }

        .fc .fc-view {
          height: auto !important;
        }

        .fc .fc-daygrid {
          height: auto !important;
        }

        .fc .fc-daygrid-body {
          height: auto !important;
        }

        /* Enhanced week and day view styling */
        .fc .fc-timegrid-axis {
          background: #f9fafb;
          border-right: 1px solid #e5e7eb;
        }
        
        .fc .fc-timegrid-slot {
          height: 2.5rem;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .fc .fc-timegrid-slot:nth-child(even) {
          background: rgba(249, 250, 251, 0.5);
        }
        
        .fc .fc-timegrid-col-frame {
          background: white;
        }
        
        .fc .fc-col-header-cell {
          background: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
          font-weight: 600;
          color: #374151;
        }

        /* Day cell styling */
        .fc .fc-daygrid-day {
          cursor: pointer;
          min-height: 80px !important;
          height: auto !important;
        }
        
        .fc .fc-daygrid-day:hover {
          background-color: rgba(229, 231, 235, 0.3);
        }
        
        .fc .fc-daygrid-day-frame {
          min-height: 80px !important;
          height: 100% !important;
        }
        
        .fc .fc-daygrid-day-number {
          padding: 4px;
          float: none !important;
          text-align: center;
        }
        
        /* Ensure month view has adequate row height */
        .fc .fc-daygrid-body tr {
          height: 80px !important;
        }
        
        .fc .fc-daygrid-body td {
          vertical-align: top;
          height: 80px !important;
        }
        
        .fc-theme-standard td,
        .fc-theme-standard th {
          border-color: #e5e7eb;
        }

        /* Enhanced now indicator */
        .fc .fc-timegrid-now-indicator-line {
          border-color: #ef4444;
          border-width: 2px;
        }
        
        .fc .fc-timegrid-now-indicator-arrow {
          border-left-color: #ef4444;
          border-width: 5px 0 5px 6px;
        }

        /* View-specific event styling */
        .fc-timeGridWeek-view .fc-event,
        .fc-timeGridDay-view .fc-event {
          border-radius: 6px;
          padding: 3px 6px;
          font-size: 0.75rem;
          line-height: 1.3;
          font-weight: 500;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-width: 2px;
        }

        .fc-timeGridDay-view .fc-event {
          font-size: 0.8rem;
          padding: 6px 8px;
          line-height: 1.4;
        }
        
        .fc-timeGridWeek-view .fc-event-title,
        .fc-timeGridDay-view .fc-event-title {
          font-weight: 600;
        }

        /* Status-specific event colors in week/day view */
        .appointment-pending {
          background-color: #fef3c7 !important;
          border-color: #f59e0b !important;
          color: #92400e !important;
        }

        .appointment-confirmed {
          background-color: #d1fae5 !important;
          border-color: #10b981 !important;
          color: #065f46 !important;
        }

        .appointment-cancelled {
          background-color: #fee2e2 !important;
          border-color: #ef4444 !important;
          color: #991b1b !important;
        }

        .appointment-completed {
          background-color: #dbeafe !important;
          border-color: #3b82f6 !important;
          color: #1e40af !important;
        }

        /* Hover effects for events */
        .fc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          transition: all 0.2s ease;
        }

        /* Time slot hover effect */
        .fc .fc-timegrid-slot:hover {
          background-color: rgba(59, 130, 246, 0.05);
        }

        /* Responsive calendar */
        @media (max-width: 640px) {
          .fc {
            min-height: 400px !important;
          }
          
          .fc .fc-view-harness {
            min-height: 400px !important;
          }
          
          .fc .fc-daygrid-day {
            min-height: 60px !important;
          }
          
          .fc .fc-daygrid-day-frame {
            min-height: 60px !important;
          }
          
          .fc .fc-daygrid-body tr {
            height: 60px !important;
          }
          
          .fc .fc-daygrid-body td {
            height: 60px !important;
          }
          
          .fc .fc-timegrid-slot {
            height: 2rem;
          }
          
          .fc .fc-col-header-cell-cushion {
            font-size: 0.75rem;
            padding: 4px 2px;
          }
          
          .fc .fc-timegrid-axis-cushion {
            font-size: 0.7rem;
          }
        }

        @media (min-width: 1024px) {
          .fc {
            min-height: 600px !important;
          }
          
          .fc .fc-view-harness {
            min-height: 600px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Calendar;
