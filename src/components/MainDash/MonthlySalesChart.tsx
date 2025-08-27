import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface Property {
  availability?: boolean;
  category?: string;
  rate?: string | number;
  createdAt?: string;
}

export default function MonthlySalesChart({
  propertyData = [],
}: {
  propertyData: Property[];
}) {
  const saleData = new Array(12).fill(0);
  const rentData = new Array(12).fill(0);

  (propertyData || []).forEach((property) => {
    if (property.availability === false || property.category === "sale") {
      const rate = Number(property.rate) || 0;
      const monthIdx = property.createdAt
        ? new Date(property.createdAt).getMonth()
        : 0;

      if (property.category === "rent") {
        rentData[monthIdx] += rate;
      } else if (property.category === "sale") {
        saleData[monthIdx] += rate;
      }
    }
  });

  const series = [
    { name: "Rent", data: rentData },
    { name: "Sale", data: saleData },
  ];

  const options: ApexOptions = {
    colors: ["#465fff", "#9d57f6"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar" as const,
      height: 180,
      stacked: true,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ["transparent"] },
    xaxis: {
      categories: monthLabels,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: "Income (₹)",
        offsetX: 7, // Move the title to the left
        style: {
          fontSize: "12px",
          fontWeight: 500,
          fontFamily: "Outfit, sans-serif",
          color: "#718096", // Use a color that works in both light/dark mode
        },
      },
      labels: {
        padding: 28, // Add some padding to ensure labels don't get cut off
      },
    },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: {
      y: { formatter: (val: number) => `₹${val}` },
    },
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Monthly Sales
        </h3>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <Chart options={options} series={series} type="bar" height={180} />
        </div>
      </div>
    </div>
  );
}
