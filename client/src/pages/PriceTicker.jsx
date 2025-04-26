import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FiClock,
  FiMapPin,
  FiBarChart2,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";
import { data } from "../constants/data.js";
import apiClient from "../apiClient/ApiClient.js";

const PriceTicker = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    state: "UTTAR PRADESH",
    commodity: "WHEAT",
  });

  const [viewMode, setViewMode] = useState("chart");
  const [sortConfig, setSortConfig] = useState({
    key: "modal_price",
    direction: "desc",
  });

  // Fetch data when filters change
  useEffect(() => {
    const fetchData = async () => {
      if (!filters.state || !filters.commodity) return;

      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get(
          `/market/today-prices-with-markets?state=${encodeURIComponent(
            filters.state
          )}&commodity=${encodeURIComponent(filters.commodity)}`
        );

        setMarketData(response.data);
      } catch (err) {
        console.error("API Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.state, filters.commodity]);

  // Handle loading and error states
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FiLoader className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex items-center">
          <FiAlertCircle className="text-red-500 mr-2" />
          <div>
            <h3 className="font-bold text-red-800">Error loading data</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!marketData) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex items-center">
          <FiAlertCircle className="text-yellow-500 mr-2" />
          <p>No data available for selected filters</p>
        </div>
      </div>
    );
  }

  // Calculate highest and lowest price markets
  const highestPriceMarket = marketData.market_prices.reduce(
    (max, market) => (market.modal_price > max.modal_price ? market : max),
    marketData.market_prices[0]
  );

  const lowestPriceMarket = marketData.market_prices.reduce(
    (min, market) => (market.modal_price < min.modal_price ? market : min),
    marketData.market_prices[0]
  );

  // Sort function
  const sortedMarkets = [...marketData.market_prices].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  // Prepare chart data
  const chartData = sortedMarkets.map((market) => ({
    name: market.apmc,
    min: market.min_price,
    modal: market.modal_price,
    max: market.max_price,
    arrivals: market.commodity_arrivals,
    traded: market.commodity_traded,
  }));
  const stateOptions = [...new Set(data.map((p) => p.state))];
  const commodityOptions = filters.state
    ? [
        ...new Set(
          data
            .filter((item) => item.state === filters.state)
            .flatMap((item) => item.commodities)
        ),
      ]
    : [];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 max-w-7xl mx-auto p-6">
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State:
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={filters.state}
            onChange={(e) =>
              setFilters({ ...filters, state: e.target.value, commodity: "" })
            }
            disabled={loading}
          >
            <option value="">Select State</option>
            {stateOptions.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Commodity:
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            value={filters.commodity}
            onChange={(e) =>
              setFilters({ ...filters, commodity: e.target.value })
            }
            disabled={!filters.state || loading}
          >
            <option value="">Select Commodity</option>
            {commodityOptions.map((commodity) => (
              <option key={commodity} value={commodity}>
                {commodity}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FiMapPin className="mr-2 text-red-500" />
            {marketData.commodity} Prices in {marketData.state}
          </h2>
          <p className="text-gray-500 text-sm mt-1 flex items-center">
            <FiClock className="mr-1" />
            Data for{" "}
            {new Date(marketData.date).toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode("chart")}
            className={`px-3 py-1 rounded-md ${
              viewMode === "chart"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Chart View
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1 rounded-md ${
              viewMode === "table"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Table View
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">State Average</h3>
          <p className="text-2xl font-bold mt-1">
            ₹{marketData.state_averages.modal_price.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Min: ₹{marketData.state_averages.min_price.toFixed(2)} | Max: ₹
            {marketData.state_averages.max_price.toFixed(2)}
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-sm font-medium text-green-700">
            Highest Price Market
          </h3>
          <p className="text-xl font-bold mt-1 flex items-center">
            ₹{highestPriceMarket.modal_price.toFixed(2)}
            <span className="ml-2 text-sm font-normal text-green-600">
              ({highestPriceMarket.apmc})
            </span>
          </p>
          <p className="text-xs text-green-600 mt-1">
            Arrivals: {highestPriceMarket.commodity_arrivals}{" "}
            {highestPriceMarket.unit}
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-700">
            Lowest Price Market
          </h3>
          <p className="text-xl font-bold mt-1 flex items-center">
            ₹{lowestPriceMarket.modal_price.toFixed(2)}
            <span className="ml-2 text-sm font-normal text-blue-600">
              ({lowestPriceMarket.apmc})
            </span>
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Arrivals: {lowestPriceMarket.commodity_arrivals}{" "}
            {lowestPriceMarket.unit}
          </p>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === "chart" ? (
        <div className="space-y-8">
          {/* Price Range Chart */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
              <FiBarChart2 className="mr-2" />
              Price Range Across Markets
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E5E7EB"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tickFormatter={(value) => `₹${value}`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => [`₹${value}`, "Price"]}
                    labelFormatter={(label) => `Market: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="min" fill="#93C5FD" name="Min Price" />
                  <Bar dataKey="modal" fill="#3B82F6" name="Modal Price" />
                  <Bar dataKey="max" fill="#1D4ED8" name="Max Price" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Arrivals vs Traded Chart */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              Arrivals vs Traded Quantities
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E5E7EB"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [
                      `${value} ${
                        marketData.market_prices[0]?.unit || "Quintal"
                      }`,
                      "Quantity",
                    ]}
                    labelFormatter={(label) => `Market: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="arrivals"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Arrivals"
                  />
                  <Line
                    type="monotone"
                    dataKey="traded"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Traded"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("apmc")}
                >
                  APMC Market
                  {sortConfig.key === "apmc" && (
                    <span className="ml-1">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("min_price")}
                >
                  Min Price
                  {sortConfig.key === "min_price" && (
                    <span className="ml-1">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("modal_price")}
                >
                  Modal Price
                  {sortConfig.key === "modal_price" && (
                    <span className="ml-1">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("max_price")}
                >
                  Max Price
                  {sortConfig.key === "max_price" && (
                    <span className="ml-1">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("commodity_arrivals")}
                >
                  Arrivals
                  {sortConfig.key === "commodity_arrivals" && (
                    <span className="ml-1">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("commodity_traded")}
                >
                  Traded
                  {sortConfig.key === "commodity_traded" && (
                    <span className="ml-1">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedMarkets.map((market, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {market.apmc}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{market.min_price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                    ₹{market.modal_price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{market.max_price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {market.commodity_arrivals} {market.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {market.commodity_traded} {market.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-500">
        <p>
          Note: All prices are in ₹ per quintal. Data sourced from agricultural
          markets.
        </p>
      </div>
    </div>
  );
};

export default PriceTicker;
