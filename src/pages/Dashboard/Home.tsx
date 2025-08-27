import { useEffect, useState } from "react";
import instance from "../../utils/Axios/Axios";

// Dashboard Cards and Charts
import CardMetrics from "../../components/MainDash/DashBoardCards";
import MonthlySalesChart from "../../components/MainDash/MonthlySalesChart";
// import StatisticsChart from "../../components/MainDash/StatisticsChart";
import MonthlyTarget from "../../components/MainDash/MonthlyTarget";
import RecentAppointment from "../../components/MainDash/RecentAppointment";
// import DemographicCard from "../../components/MainDash/DemographicCard";
import PageMeta from "../../components/common/PageMeta";

// Define interface to match API response
interface AppointmentData {
  currentPage?: number;
  data?: any[];
  totalItems?: number;
  totalPages?: number;
}

export default function Home() {
  // State to hold API data
  const [propertyData, setPropertyData] = useState([]);
  const [leadsData, setLeadsData] = useState([]);
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({});

  useEffect(() => {
    // Fetch properties
    async function fetchProperties() {
      try {
        const response = await instance.get("/property");
        console.log("Property API response:", response.data);
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
        console.log("Leads API response:", response.data);
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
        console.log("Appointments API response:", response.data);
        // Store the whole object with currentPage, data, totalItems, etc.
        setAppointmentData(response.data);
      } catch (error) {
        console.error("Appointments API error:", error);
        setAppointmentData({}); // default empty object
      }
    }

    fetchProperties();
    fetchLeads();
    fetchAppointments();
  }, []);

  return (
    <>
      <PageMeta
        title="MotherHome"
        description="Mother Home PG and Rental place"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <CardMetrics
            leadsData={leadsData}
            appointmentData={appointmentData}
          />

          <MonthlySalesChart propertyData={propertyData} />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget propertyData={propertyData} />
        </div>

        {/* <div className="col-span-12">
          <StatisticsChart propertyData={propertyData} leadsData={leadsData} />
        </div> */}

        <div className="col-span-12 xl:col-span-7">
          <RecentAppointment />
        </div>
      </div>
    </>
  );
}