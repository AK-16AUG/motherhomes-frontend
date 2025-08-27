
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import axios from "../../utils/Axios/Axios";

// Type definition for property objects
interface Property {
  availability?: boolean;
  category?: string;
  rate?: string | number;
  createdAt?: string;
}

export default function MonthlyTarget({
  propertyData = [],
}: {
  propertyData: Property[];
}) {
  const [target, setTarget] = useState<number>(100000); // Default value until API responds
  const [currentRevenue, setCurrentRevenue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [newTargetValue, setNewTargetValue] = useState<number>(target);

  // For today's revenue only (from propertyData)
  const today = new Date();
  let todayRevenue = 0;
  (propertyData || []).forEach((property) => {
    if (
      property.availability === false &&
      property.category === "rent" &&
      property.createdAt
    ) {
      const dt = new Date(property.createdAt);
      const rate = Number(property.rate) || 0;
      if (
        dt.getDate() === today.getDate() &&
        dt.getMonth() === today.getMonth() &&
        dt.getFullYear() === today.getFullYear()
      ) {
        todayRevenue += rate;
      }
    }
  });

  // Calculate sales count for this month
  const month = today.getMonth();
  const year = today.getFullYear();
  let salesCount = 0;
  (propertyData || []).forEach((property) => {
    if (
      property.availability === false &&
      property.category === "sale" &&
      property.createdAt
    ) {
      const dt = new Date(property.createdAt);
      if (dt.getFullYear() === year && dt.getMonth() === month) {
        salesCount += 1;
      }
    }
  });
  // Get month name
  const monthName = today.toLocaleString('default', { month: 'long' });

  // Fetch target and current revenue from API
  useEffect(() => {
    const fetchMonthlyRevenue = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/dashboard/monthly-revenue");
        if (response.data) {
          setTarget(response.data.target || 0);
          setCurrentRevenue(response.data.monthlyRevenue || 0);
          setNewTargetValue(response.data.target || 0);
        }
      } catch (error) {
        console.error("Failed to fetch monthly revenue/target:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMonthlyRevenue();
  }, []);

  // Update target value
  const updateTarget = async () => {
    try {
      await axios.put("/target/monthlyRevenue", {
        value: newTargetValue,
      });
      setTarget(newTargetValue);
      setIsEditModalOpen(false);
      // Optionally, refetch monthly revenue after update
      setIsLoading(true);
      const response = await axios.get("/dashboard/monthly-revenue");
      if (response.data) {
        setTarget(response.data.target || 0);
        setCurrentRevenue(response.data.monthlyRevenue || 0);
        setNewTargetValue(response.data.target || 0);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to update target:", error);
    }
  };

  // Calculate progress (as a percent, max 100)
  const progress =
    target === 0
      ? 0
      : Math.min(100, Math.round((currentRevenue / target) * 100));

  // Chart expects a single-value series array
  const series = [progress];

  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      type: "radialBar" as const,
      height: 330,
      sparkline: {
        enabled: true,
      },
      fontFamily: "Outfit, sans-serif",
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: (val: number) => val + "%",
          },
        },
      },
    },
    fill: { type: "solid", colors: ["#465FFF"] },
    stroke: { lineCap: "round" },
    labels: ["Progress"],
  };

  const [isOpen, setIsOpen] = useState(false);
  function toggleDropdown() {
    setIsOpen(!isOpen);
  }
  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Monthly Target
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Target you&apos;ve set for each month
            </p>
          </div>
          <div className="relative inline-block">
            <button className="dropdown-toggle" onClick={toggleDropdown}>
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={() => {
                  closeDropdown();
                  setIsEditModalOpen(true);
                }}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Edit Target
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-[330px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="relative">
            <div className="max-h-[330px]" id="chartDarkStyle">
              <Chart
                options={options}
                series={series}
                type="radialBar"
                height={330}
              />
            </div>
            <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
              {progress}%
            </span>
          </div>
        )}

        {/* Summary row for target, current revenue, sales, and today's revenue */}
        <div className="flex flex-col md:flex-row gap-4 mt-6 w-full justify-center">
          <div className="flex-1 min-w-[150px] text-center">
            <div className="text-gray-500 text-sm">Target ({monthName} {year})</div>
            <div className="text-xl font-bold text-purple-700">₹{target.toLocaleString()}</div>
          </div>
          <div className="flex-1 min-w-[150px] text-center">
            <div className="text-gray-500 text-sm">This Month's Revenue</div>
            <div className="text-xl font-bold text-indigo-700">₹{currentRevenue.toLocaleString()}</div>
          </div>
          {/* <div className="flex-1 min-w-[150px] text-center">
            <div className="text-gray-500 text-sm">Sales ({monthName})</div>
            <div className="text-xl font-bold text-pink-700">{salesCount}</div>
          </div> */}
          <div className="flex-1 min-w-[150px] text-center">
            <div className="text-gray-500 text-sm">Today's Revenue</div>
            <div className="text-xl font-bold text-green-700">₹{todayRevenue.toLocaleString()}</div>
          </div>
        </div>

        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          You earned <b>₹{currentRevenue.toLocaleString()}</b> this month. Keep up your
          good work!
        </p>
      </div>
      {/* Edit Target Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Edit Monthly Target
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Target Amount (₹)
              </label>
              <input
                type="number"
                value={newTargetValue}
                onChange={(e) => setNewTargetValue(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                min="0"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={updateTarget}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}