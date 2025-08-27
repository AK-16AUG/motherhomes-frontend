import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import ChartTab from "../common/ChartTab";

interface Property {
  availability?: boolean;
  category?: string;
  rate?: string | number;
  createdAt?: string;
}

interface Lead {
  createdAt?: string;
}

export default function StatisticsChart({
  propertyData = [],
  leadsData = [],
}: {
  propertyData?: Property[];
  leadsData?: Lead[];
}) {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // --- Data arrays ---
  const salesCount = new Array(12).fill(0);
  const rentRevenue = new Array(12).fill(0);
  const leadsCount = new Array(12).fill(0);

  // Count sales & rent revenue from properties
  (propertyData || []).forEach((property) => {
    const created = property.createdAt ? new Date(property.createdAt) : null;
    if (created) {
      const idx = created.getMonth();
      if (property.category === "sale") salesCount[idx] += 1;
      if (property.category === "rent" && property.availability === false) {
        rentRevenue[idx] += Number(property.rate) || 0;
      }
    }
  });

  // Count leads per month
  (leadsData || []).forEach((lead) => {
    const created = lead.createdAt ? new Date(lead.createdAt) : null;
    if (created) {
      const idx = created.getMonth();
      leadsCount[idx] += 1;
    }
  });

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#465FFF", "#9CB9FF", "#F59E42"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area" as const,
      toolbar: { show: false },
    },
    stroke: {
      curve: "straight",
      width: [2, 2, 2],
    },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.55, opacityTo: 0 },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val: number, opts?: any) =>
          opts?.seriesIndex === 0
            ? `${val} Sales`
            : opts?.seriesIndex === 1
            ? `₹${val.toLocaleString()}`
            : `${val} Leads`,
      },
      x: { show: false },
    },
    xaxis: {
      type: "category",
      categories: months,
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: "12px", colors: ["#6B7280"] },
      },
      title: { text: "", style: { fontSize: "0px" } },
    },
  };

  const series = [
    {
      name: "Sales (Count)",
      data: salesCount,
    },
    {
      name: "Rent Revenue (₹)",
      data: rentRevenue,
    },
    {
      name: "Leads",
      data: leadsCount,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistics
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Target you&apos;ve set for each month
          </p>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
          <ChartTab />
        </div>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </div>
  );
}
