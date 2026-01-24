import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import AllListing from "./pages/Tables/ListingTable";
import AppointmentTables from "./pages/Tables/AppointmentTable";
import Addlisting from "./pages/Forms/ListingForm";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import HomePage from "./pages/common/Home";
import DataTable from "./pages/Tables/TenantTable";
import DataTableWithStatus from "./pages/Tables/editAppointmentTable";
import ListPage from "./pages/user/listPage";
import SingleListing from "./pages/user/singlePage";
import SingleProperty from "./pages/NestedPages/SingleProperty";
import Services from "./pages/OtherPage/Services";
import About from "./pages/OtherPage/About";
import LeadsTable from "./pages/Tables/LeadsTable";
import TenantProfile from "./pages/NestedPages/TenantProfile";
import { ReactNode } from "react";
import Reset from "./pages/AuthPages/Reset";
import MyFlatsTable from "./pages/Tables/TenantInfoTable";
import AdminTable from "./pages/Tables/AdminTable";
import { LoadingProvider } from "./context/LoadingContext";
import RegisteredUserTable from "./pages/Tables/RegisteredUserTable";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const userRole: string | null = localStorage.getItem("role");

  if (!token) return <Navigate to="/signin" replace />;
  if (!userRole) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(userRole))
    return <Navigate to="/" replace />;

  return children;
};

export default function App() {
  return (
    <LoadingProvider>
      <Router>
        <ScrollToTop />
        <Routes>

          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/resetpass" element={<Reset />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/viewlisting" element={<ListPage />} />
          <Route path="/viewlisting/:id" element={<SingleListing />} />

          {/* Protected Routes */}
          <Route element={<AppLayout />}>
            {/* Common routes for all authenticated users */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["admin", "user", "superadmin"]}>
                  <UserProfiles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/infotenant"
              element={
                <ProtectedRoute allowedRoles={["admin", "user", "superadmin"]}>
                  <MyFlatsTable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <ProtectedRoute allowedRoles={["admin", "user"]}>
                  <AppointmentTables />
                </ProtectedRoute>
              }
            />

            {/* Admin-only routes (now also accessible to superadmin) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <Calendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editappointments"
              element={
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <DataTableWithStatus />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenantinfo"
              element={
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <DataTable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/addlisting"
              element={
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <Addlisting />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-listing/:id"
              element={
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <Addlisting />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads"
              element={
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <LeadsTable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/alllisting"
              element={
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <AllListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/allregistereduser"
              element={
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <RegisteredUserTable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/listing/:id"
              element={
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <SingleProperty />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:id"
              element={
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <TenantProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/line-chart"
              element={
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <LineChart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bar-chart"
              element={
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <BarChart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blank"
              element={
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <Blank />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-management"
              element={
                <ProtectedRoute allowedRoles={["superadmin"]}>
                  <AdminTable />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </LoadingProvider>
  );
}
