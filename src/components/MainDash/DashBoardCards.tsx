import { useNavigate } from "react-router-dom";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";

export default function CardMetrics({
  leadsData = [],
  appointmentData = {},
  previousLeadsCount = 0,
  previousAppointmentsCount = 0,
}: {
  leadsData?: any[];
  appointmentData?: any;
  previousLeadsCount?: number;
  previousAppointmentsCount?: number;
}) {
  // Compute counts
  const leadsCount = leadsData?.length || 0;
  const appointmentsCount = appointmentData?.appointments?.totalItems || 0;

  // Calculate differences
  const leadsChange = leadsCount - previousLeadsCount;
  const appointmentsChange = appointmentsCount - previousAppointmentsCount;

  // Determine if increasing or decreasing
  const isLeadsIncreasing = leadsChange >= 0;
  const isAppointmentsIncreasing = appointmentsChange >= 0;
const navigate= useNavigate()
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Leads Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"  onClick={()=>(navigate("/leads"))}>
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Leads
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {leadsCount}
            </h4>
          </div>
          <Badge color={isLeadsIncreasing ? "success" : "error"}>
            {isLeadsIncreasing ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {Math.abs(leadsChange)}
          </Badge>
        </div>
      </div>

      {/* Appointments Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6" onClick={()=>(navigate("/editappointments"))}>
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Appointments
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {appointmentsCount}
            </h4>
          </div>
          <Badge color={isAppointmentsIncreasing ? "success" : "error"}>
            {isAppointmentsIncreasing ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {Math.abs(appointmentsChange)}
          </Badge>
        </div>
      </div>
    </div>
  );
}
