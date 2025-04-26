import React, { useState, useEffect, useCallback } from "react";
import apiClient from "../apiClient/ApiClient.js";
import { FaLeaf, FaRupeeSign, FaChartBar } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Formatting utility function
const formatNumber = (num) => {
  if (isNaN(num)) return num;
  return new Intl.NumberFormat("en-IN").format(num);
};

const getDateNDaysAgo = (n) => {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString().split("T")[0];
};

export default function MarketTable() {
  const [enamData, setEnamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayData, setDisplayData] = useState([]);
  const [page, setPage] = useState(1);
  const [commodityFilter, setCommodityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0];
  });

  const itemsPerPage = 20;

  useEffect(() => {
    const fetchEnamData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.post("market/enam/trade-data", {
          language: "en",
          stateName: "-- All --",
          apmcName: "-- Select APMCs --",
          commodityName: "-- Select Commodity --",
          fromDate: dateFilter,
          toDate: dateFilter,
        });
        setEnamData(response.data.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch eNAM data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnamData();
  }, [dateFilter]);

  useEffect(() => {
    let filteredData = enamData;

    if (commodityFilter) {
      filteredData = filteredData.filter((item) =>
        item.commodity.toLowerCase().includes(commodityFilter.toLowerCase())
      );
    }

    if (stateFilter) {
      filteredData = filteredData.filter((item) =>
        item.state.toLowerCase().includes(stateFilter.toLowerCase())
      );
    }

    // Pagination logic
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    setDisplayData(filteredData.slice(startIdx, endIdx));
  }, [enamData, page, commodityFilter, stateFilter]);

  const handleScroll = useCallback(
    (e) => {
      const bottom =
        e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
      if (bottom && !loading && displayData.length < enamData.length) {
        setPage((prevPage) => prevPage + 1);
      }
    },
    [loading, displayData.length, enamData.length]
  );

  const processedData =
    displayData?.map((item) => ({
      ...item,
      priceRange: [
        Number(item.min_price),
        Number(item.modal_price),
        Number(item.max_price),
      ],
      arrivalNumber: Number(item.commodity_arrivals),
      tradedNumber: Number(item.commodity_traded),
    })) || [];

  const getPriceTrendData = (item) => ({
    labels: ["Min", "Modal", "Max"],
    datasets: [
      {
        label: "Price Range",
        data: item.priceRange,
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  });

  const getVolumeData = (item) => ({
    labels: ["Arrivals", "Traded"],
    datasets: [
      {
        label: "Quantity",
        data: [item.arrivalNumber, item.tradedNumber],
        backgroundColor: [
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
        ],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(153, 102, 255, 1)"],
        borderWidth: 1,
      },
    ],
  });

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-8 text-red-500">
        Error loading data: {error}
        <button
          onClick={() => window.location.reload()}
          className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Retry
        </button>
      </div>
    );

  if (!enamData || enamData.length === 0)
    return (
      <div className="text-center py-8">
        No market data available
        <button
          onClick={() => window.location.reload()}
          className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Refresh
        </button>
      </div>
    );

  return (
    <div className="h-screen p-6 bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center text-green-800">
        <FaChartBar className="inline mr-2" />
        eNAM Market
      </h1>

      {/* Filter Inputs */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter by Commodity"
          value={commodityFilter}
          onChange={(e) => setCommodityFilter(e.target.value)}
          className="mr-4 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Filter by State"
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="mr-4 p-2 border rounded"
        />
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="p-2 border rounded"
          min={getDateNDaysAgo(7)}
          max={getDateNDaysAgo(0)}
        />
      </div>

      <div
        className="overflow-y-auto h-full"
        onScroll={handleScroll}
        style={{ maxHeight: "80vh", overflowY: "auto" }}
      >
        <div className="overflow-auto rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-700 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  State
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  APMC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Commodity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  <FaRupeeSign className="inline mr-1" /> Price Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  <FaChartBar className="inline mr-1" /> Volume Analysis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processedData.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-green-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {item.state}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {item.apmc}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaLeaf className="text-green-600 mr-2" />
                      <span className="font-medium">{item.commodity}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-20 w-40">
                      <Bar
                        data={getPriceTrendData(item)}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              callbacks: {
                                label: (context) =>
                                  `₹${context.raw.toLocaleString()}`,
                              },
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: (value) =>
                                  `₹${value.toLocaleString()}`,
                              },
                            },
                          },
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Min: ₹{formatNumber(item.min_price)} | Modal: ₹
                      {formatNumber(item.modal_price)} | Max: ₹
                      {formatNumber(item.max_price)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-20 w-32">
                      <Bar
                        data={getVolumeData(item)}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: (value) => formatNumber(value),
                              },
                            },
                          },
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Arrivals: {formatNumber(item.commodity_arrivals)} |
                      Traded: {formatNumber(item.commodity_traded)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {item.Commodity_Uom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
