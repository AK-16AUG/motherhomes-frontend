import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface TrendData {
    month: string;
    count: number;
}

interface AnalyticalChartsProps {
    trends: {
        users: TrendData[];
        leads: TrendData[];
        properties: TrendData[];
    };
    kpis: {
        totalProperties: number;
        occupiedProperties: number;
    };
}

const AnalyticalCharts: React.FC<AnalyticalChartsProps> = ({ trends, kpis }) => {
    const categories = trends.users.map((t) => t.month);

    const areaOptions: ApexOptions = {
        colors: ["#465fff", "#9d57f6"],
        chart: {
            type: "area",
            fontFamily: "Outfit, sans-serif",
            toolbar: { show: false },
        },
        dataLabels: { enabled: false },
        stroke: { curve: "smooth", width: 3 },
        xaxis: {
            categories: categories,
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                style: { colors: "#718096" }
            }
        },
        grid: { borderColor: "#f1f1f1" },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [20, 100, 100, 100],
            },
        },
        legend: { position: "top", horizontalAlign: "left" },
    };

    const areaSeries = [
        { name: "New Students", data: trends.users.map((t) => t.count) },
        { name: "New Leads", data: trends.leads.map((t) => t.count) },
    ];

    const donutOptions: ApexOptions = {
        colors: ["#465fff", "#e5e7eb"],
        chart: { type: "donut", fontFamily: "Outfit, sans-serif" },
        labels: ["Occupied", "Available"],
        legend: { position: "bottom" },
        plotOptions: {
            pie: {
                donut: {
                    size: "75%",
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: "Occupancy",
                            formatter: () => `${((kpis.occupiedProperties / kpis.totalProperties) * 100 || 0).toFixed(0)}%`,
                        },
                    },
                },
            },
        },
        dataLabels: { enabled: false },
        stroke: { show: false },
    };

    const donutSeries = [kpis.occupiedProperties, kpis.totalProperties - kpis.occupiedProperties];

    return (
        <div className="grid grid-cols-12 gap-6 mt-6">
            <div className="col-span-12 lg:col-span-8 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Growth & Conversion Trends</h3>
                <Chart options={areaOptions} series={areaSeries} type="area" height={300} />
            </div>

            <div className="col-span-12 lg:col-span-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Inventory Status</h3>
                <div className="flex flex-col items-center justify-center h-[300px]">
                    <Chart options={donutOptions} series={donutSeries} type="donut" width="100%" />
                </div>
            </div>
        </div>
    );
};

export default AnalyticalCharts;
