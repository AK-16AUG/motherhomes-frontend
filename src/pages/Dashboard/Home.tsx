import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import instance from "../../utils/Axios/Axios";

// Dashboard Cards and Charts
import CardMetrics from "../../components/MainDash/DashBoardCards";
import PageMeta from "../../components/common/PageMeta";
const MonthlySalesChart = lazy(() => import("../../components/MainDash/MonthlySalesChart"));
const MonthlyTarget = lazy(() => import("../../components/MainDash/MonthlyTarget"));
const RecentAppointment = lazy(() => import("../../components/MainDash/RecentAppointment"));
const RecentFlats = lazy(() => import("../../components/MainDash/RecentFlats"));
const UpcomingMeetings = lazy(() => import("../../components/MainDash/UpcomingMeetings"));

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
  const [propertyData, setPropertyData] = useState<any[]>([]);
  const [leadsData, setLeadsData] = useState<any[]>([]);
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({});
  const [dashboardStats, setDashboardStats] = useState<any>({});
  const [recentFlats, setRecentFlats] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const fetchDashboardData = async () => {
      const [statsRes, leadsRes, appointmentsRes, propertiesRes] = await Promise.allSettled([
        instance.get("/dashboard/comprehensive"),
        // Fetch minimal leads payload; card only needs count
        instance.get("/leads?page=1&limit=1"),
        // Keep a small list for upcoming meetings and recent appointments
        instance.get("/appointments?page=1&limit=8"),
        // Keep chart payload bounded for faster dashboard load
        instance.get("/property?page=1&limit=200"),
      ]);

      if (!mounted) return;

      if (statsRes.status === "fulfilled") {
        setDashboardStats(statsRes.value.data || {});
        setRecentFlats(statsRes.value.data?.recentFlats || []);
      } else {
        setDashboardStats({});
        setRecentFlats([]);
      }

      if (leadsRes.status === "fulfilled") {
        setLeadsData(leadsRes.value?.data?.results || []);
      } else {
        setLeadsData([]);
      }

      if (appointmentsRes.status === "fulfilled") {
        setAppointmentData(appointmentsRes.value?.data || {});
      } else {
        setAppointmentData({});
      }

      if (propertiesRes.status === "fulfilled") {
        const propResults = propertiesRes.value?.data?.results || [];
        setPropertyData(Array.isArray(propResults) ? propResults : []);
      } else {
        setPropertyData([]);
      }

    };

    fetchDashboardData();
    return () => {
      mounted = false;
    };
  }, []);

  const sectionLoader = useMemo(
    () => (
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-100" />
        <div className="mt-4 h-40 animate-pulse rounded bg-gray-100" />
      </div>
    ),
    []
  );

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
          <Suspense fallback={sectionLoader}>
            <MonthlySalesChart propertyData={propertyData} />
          </Suspense>
        </div>

        <div className="col-span-12 xl:col-span-5">
          <Suspense fallback={sectionLoader}>
            <MonthlyTarget propertyData={propertyData} />
          </Suspense>
        </div>

        {/* Second Row of Data */}
        <div className="col-span-12 xl:col-span-7">
          <Suspense fallback={sectionLoader}>
            <RecentAppointment appointmentsData={appointmentData} />
          </Suspense>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-6">
          <Suspense fallback={sectionLoader}>
            <UpcomingMeetings appointmentsData={appointmentData} />
          </Suspense>
        </div>

        {/* Third Row of Data */}
        <div className="col-span-12 xl:col-span-12 mb-3 sm:mb-6">
          <Suspense fallback={sectionLoader}>
            <RecentFlats flats={recentFlats} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
