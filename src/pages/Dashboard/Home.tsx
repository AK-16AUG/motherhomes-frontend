import { useEffect, useState } from "react";
import instance from "../../utils/Axios/Axios";

// Dashboard Cards and Charts
import CardMetrics from "../../components/MainDash/DashBoardCards";
import MonthlySalesChart from "../../components/MainDash/MonthlySalesChart";
import MonthlyTarget from "../../components/MainDash/MonthlyTarget";
import RecentAppointment from "../../components/MainDash/RecentAppointment";
import PageMeta from "../../components/common/PageMeta";
import RecentFlats from "../../components/MainDash/RecentFlats";
import UpcomingMeetings from "../../components/MainDash/UpcomingMeetings";

// Define interface to match API response
interface AppointmentData {
  currentPage?: number;
  data?: any[];
  totalItems?: number;
  totalPages?: number;
  appointments?: any;
}

export default function Home() {
  // State to hold API data
  const [propertyData, setPropertyData] = useState([]);
  const [leadsData, setLeadsData] = useState([]);
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({});
  const [dashboardStats, setDashboardStats] = useState<any>({});
  const [recentFlats, setRecentFlats] = useState([]);

  useEffect(() => {
    // Fetch properties
    async function fetchProperties() {
      try {
        const response = await instance.get("/property");
        setPropertyData(response.data.results);
      } catch (error) {
        console.error("Property API error:", error);
        setPropertyData([]);
      }
    }

    // Fetch leads
    async function fetchLeads() {
      try {
        const response = await instance.get("/leads");
        setLeadsData(response?.data?.results);
      } catch (error) {
        console.error("Leads API error:", error);
        setLeadsData([]);
      }
    }

    // Fetch appointments
    async function fetchAppointments() {
      try {
        const response = await instance.get("/appointments");
        setAppointmentData(response.data);
      } catch (error) {
        console.error("Appointments API error:", error);
        setAppointmentData({});
      }
    }

    // Fetch comprehensive stats
    async function fetchStats() {
      try {
        const response = await instance.get("/dashboard/comprehensive");
        setDashboardStats(response.data);
        if (response.data.recentFlats) {
          setRecentFlats(response.data.recentFlats);
        }
      } catch (error) {
        console.error("Dashboard Stats API error:", error);
      }
    }

    fetchProperties();
    fetchLeads();
    fetchAppointments();
    fetchStats();
  }, []);

  return (
    <>
      <PageMeta
        title="MotherHome"
        description="Mother Home PG and Rental place"
      />
      <div className="grid grid-cols-12 gap-3 sm:gap-4 md:gap-6">
        <div className="col-span-12 space-y-6">
          <CardMetrics
            leadsData={leadsData}
            appointmentData={appointmentData}
            stats={dashboardStats}
          />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <MonthlySalesChart propertyData={propertyData} />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget propertyData={propertyData} />
        </div>

        {/* Second Row of Data */}
        <div className="col-span-12 xl:col-span-7">
          <RecentAppointment />
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-6">
          <UpcomingMeetings appointmentsData={appointmentData} />
        </div>

        {/* Third Row of Data */}
        <div className="col-span-12 xl:col-span-12 mb-3 sm:mb-6">
          <RecentFlats flats={recentFlats} />
        </div>

      </div>
    </>
  );
}
