import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts";
import {
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertCircle,
} from "react-icons/fi";
import { New_Data } from "../constants/data.js";
import axios from "axios";
import apiClient from "../apiClient/ApiClient.js";

function groupByWeekday(data) {
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const grouped = weekdays.map((day) => ({
    weekday: day,
    avgArrivals: 0,
    avgTraded: 0,
    count: 0,
  }));

  data.forEach((item) => {
    const day = new Date(item.date).getDay();
    grouped[day].avgArrivals += item.commodity_arrivals;
    grouped[day].avgTraded += item.commodity_traded;
    grouped[day].count++;
  });

  return grouped.map((day) => ({
    weekday: day.weekday,
    avgArrivals: day.count > 0 ? Math.round(day.avgArrivals / day.count) : 0,
    avgTraded: day.count > 0 ? Math.round(day.avgTraded / day.count) : 0,
  }));
}

const PriceTrendDashboard = () => {
  const [filters, setFilters] = useState({
    state: New_Data[0]?.state || "",
    apmc: New_Data[0]?.apmcs[0]?.apmc || "",
    commodity: New_Data[0]?.apmcs[0]?.commodities[0]?.commodities || "",
    days: 7,
  });
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get unique states from the data
  const stateOptions = New_Data.map((item) => item.state);

  // Get APMCs for the selected state
  const apmcOptions =
    New_Data.find((item) => item.state === filters.state)?.apmcs || [];

  // Get commodities for the selected APMC or all commodities in the state if no APMC selected
  const commodityOptions = filters.apmc
    ? apmcOptions.find((apmc) => apmc.apmc === filters.apmc)?.commodities || []
    : apmcOptions.flatMap((apmc) => apmc.commodities);

  useEffect(() => {
    const source = axios.CancelToken.source();

    const fetchTrendData = async () => {
      if (!filters.state || !filters.commodity) {
        setTrendData(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const params = {
          state: filters.state,
          commodity: filters.commodity,
          days: filters.days,
          ...(filters.apmc && { apmc: filters.apmc }),
        };

        const response = await apiClient.get("/market/price-trend", {
          params,
          cancelToken: source.token,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.data?.data?.trends) {
          setTrendData(response.data.data);
        } else {
          setError("No data available for the selected filters");
          setTrendData(null);
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("Error fetching trend data:", err);
          setError(
            err.response?.data?.message || err.message || "Failed to fetch data"
          );
          setTrendData(null);
        }
      } finally {
        setLoading(false);
      }
    };

    // Add debounce to prevent rapid API calls on filter changes
    const debounceTimer = setTimeout(fetchTrendData, 300);

    return () => {
      source.cancel("Component unmounted, request canceled");
      clearTimeout(debounceTimer);
    };
  }, [filters.state, filters.apmc, filters.commodity, filters.days]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "state" && { apmc: "", commodity: "" }), // Reset APMC and commodity when state changes
      ...(name === "apmc" && { commodity: "" }), // Reset commodity when APMC changes
    }));
  };

  const calculateChange = () => {
    if (!trendData || !trendData.trends || trendData.trends.length < 2)
      return null;

    const first = trendData.trends[0].modal_price;
    const last = trendData.trends[trendData.trends.length - 1].modal_price;

    // Handle cases where first price might be zero to avoid division by zero
    if (first === 0) return null;

    const change = ((last - first) / first) * 100;

    return {
      value: Math.abs(change.toFixed(2)),
      direction: change >= 0 ? "up" : "down",
      isSignificant: Math.abs(change) > 1, // Consider changes less than 1% as insignificant
    };
  };

  const change = calculateChange();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading data
              </h3>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm text-red-600 hover:text-red-500 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Price Trend Analysis
        </h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <select
              name="state"
              value={filters.state}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select State</option>
              {stateOptions.map((state) => (
                <option key={state} value={state}>
                  {state
                    .toLowerCase()
                    .split(' ')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              APMC (Optional)
            </label>
            <select
              name="apmc"
              value={filters.apmc}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={!filters.state || apmcOptions.length === 0}
            >
              <option value="">All Markets</option>
              {apmcOptions.map((apmc) => (
                <option key={apmc.apmc} value={apmc.apmc}>
                  {
                    apmc.apmc
                    .toLowerCase()
                    .split(' ')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')
                  }
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commodity
            </label>
            <select
              name="commodity"
              value={filters.commodity}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={!filters.state || commodityOptions.length === 0}
            >
              <option value="">Select Commodity</option>
              {commodityOptions.map((commodity, index) => (
                <option key={`${commodity}-${index}`} value={commodity}>
                  {commodity
                    .toLowerCase()
                    .split(' ')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')
                  }
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Period (Days)
            </label>
            <select
              name="days"
              value={filters.days}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={!filters.state || apmcOptions.length === 0 || !filters.commodity}
            >
              <option value="7">7 Days</option>
              <option value="30">30 Days</option>
              <option value="60">60 Days</option>
              <option value="90">90 Days</option>
              <option value="180">6 Months</option>
              <option value="365">1 Year</option>
            </select>
          </div>
        </div>

        {/* Summary Card */}
        {trendData ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-2 md:mb-0">
                <h2 className="text-lg font-semibold text-blue-800">
                  {trendData.commodity} Prices in {trendData.state}
                  {trendData.apmc && ` (${trendData.apmc})`}
                </h2>
                <p className="text-sm text-blue-600">
                  <FiCalendar className="inline mr-1" />
                  Last {trendData.days} days | Unit: {trendData.unit || "N/A"}
                </p>
              </div>

              {change && change.isSignificant ? (
                <div
                  className={`flex items-center text-lg font-semibold ${
                    change.direction === "up"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {change.direction === "up" ? (
                    <FiTrendingUp className="mr-1" />
                  ) : (
                    <FiTrendingDown className="mr-1" />
                  )}
                  {change.value}% {change.direction}
                </div>
              ) : (
                <div className="flex items-center text-lg font-semibold text-gray-500">
                  Price stable
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-center text-gray-500">
            {filters.commodity
              ? "No data available for the selected filters"
              : "Please select a commodity to view price trends"}
          </div>
        )}
      </div>

      {/* Charts */}
      {trendData && trendData.trends && trendData.trends.length > 0 ? (
        <div className="space-y-8">
          {/* Price Trend Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Price Trend
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData.trends}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })
                    }
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      `₹${value.toLocaleString("en-IN")}`
                    }
                    domain={["dataMin - 100", "dataMax + 100"]}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `₹${value.toLocaleString("en-IN")}`,
                      "Price",
                    ]}
                    labelFormatter={(label) =>
                      new Date(label).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="modal_price"
                    name="Modal Price"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="min_price"
                    name="Min Price"
                    stroke="#10B981"
                    strokeWidth={1}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="max_price"
                    name="Max Price"
                    stroke="#EF4444"
                    strokeWidth={1}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Volume Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Market Volume Analysis
            </h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-sm font-medium text-blue-600">
                  Total Arrivals
                </h3>
                <p className="text-2xl font-bold text-blue-800">
                  {trendData.trends
                    .reduce(
                      (sum, item) => sum + (item.commodity_arrivals || 0),
                      0
                    )
                    .toLocaleString("en-IN")}
                  <span className="text-sm font-normal ml-1 text-blue-600">
                    {trendData.unit}
                  </span>
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h3 className="text-sm font-medium text-green-600">
                  Total Traded
                </h3>
                <p className="text-2xl font-bold text-green-800">
                  {trendData.trends
                    .reduce(
                      (sum, item) => sum + (item.commodity_traded || 0),
                      0
                    )
                    .toLocaleString("en-IN")}
                  <span className="text-sm font-normal ml-1 text-green-600">
                    {trendData.unit}
                  </span>
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h3 className="text-sm font-medium text-purple-600">
                  Utilization Rate
                </h3>
                <p className="text-2xl font-bold text-purple-800">
                  {(
                    (trendData.trends.reduce(
                      (sum, item) => sum + item.commodity_traded,
                      0
                    ) /
                      Math.max(
                        1,
                        trendData.trends.reduce(
                          (sum, item) => sum + item.commodity_arrivals,
                          0
                        )
                      )) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </div>

            {/* Dual Chart View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stacked Bar Chart */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-md font-medium text-gray-700 mb-2">
                  Daily Volume Comparison
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={trendData.trends}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) =>
                          new Date(date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })
                        }
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [
                          `${value.toLocaleString("en-IN")} ${trendData.unit}`,
                          name === "commodity_arrivals" ? "Arrivals" : "Traded",
                        ]}
                        labelFormatter={(date) =>
                          new Date(date).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })
                        }
                      />
                      <Legend />
                      <Bar
                        dataKey="commodity_arrivals"
                        name="Arrivals"
                        stackId="a"
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="commodity_traded"
                        name="Traded"
                        stackId="a"
                        fill="#82ca9d"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Percentage Area Chart */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-md font-medium text-gray-700 mb-2">
                  Trading Efficiency Trend
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trendData.trends.map((item) => ({
                        ...item,
                        efficiency:
                          (item.commodity_traded /
                            Math.max(1, item.commodity_arrivals)) *
                          100,
                      }))}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) =>
                          new Date(date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })
                        }
                      />
                      <YAxis unit="%" />
                      <Tooltip
                        formatter={(value, name) => [
                          name === "efficiency"
                            ? `${value.toFixed(1)}%`
                            : value,
                          name === "efficiency" ? "Utilization Rate" : name,
                        ]}
                        labelFormatter={(date) =>
                          new Date(date).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })
                        }
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="efficiency"
                        name="Utilization Rate"
                        stroke="#ff7300"
                        fill="#ff7300"
                        fillOpacity={0.2}
                      />
                      <ReferenceLine
                        y={50}
                        stroke="#666"
                        strokeDasharray="3 3"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Weekly Pattern Chart */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-medium text-gray-700 mb-2">
                Weekly Volume Pattern
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={groupByWeekday(trendData.trends)}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="weekday" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        `${value.toLocaleString("en-IN")} ${trendData.unit}`,
                        name === "avgArrivals" ? "Avg Arrivals" : "Avg Traded",
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avgArrivals"
                      name="Average Arrivals"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgTraded"
                      name="Average Traded"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        trendData && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
            No trend data available for the selected period
          </div>
        )
      )}
    </div>
  );
};

export default PriceTrendDashboard;
