import React, { useState, useEffect, useCallback } from "react";
import {
  FiInfo,
  FiFilter,
  FiArrowUp,
  FiArrowDown,
  FiAlertTriangle,
  FiRefreshCw,
  FiDownload,
} from "react-icons/fi";
import { data } from "../constants/data.js";
import apiClient from "../apiClient/ApiClient.js";
import { debounce } from "lodash";

const StatePredictionDashboard = () => {
  const [filters, setFilters] = useState({
    state: "",
    commodity: "",
    days: 10,
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Extract unique states and commodities
  const stateOptions = [...new Set(data.map((p) => p.state))].sort();
  const commodityOptions = filters.state
    ? [
        ...new Set(
          data
            .filter((item) => item.state === filters.state)
            .flatMap((item) => item.commodities)
        ),
      ].sort()
    : [];

  // Debounced fetch function
  const fetchPrediction = useCallback(
    debounce(async (state, commodity, days) => {
      if (!state || !commodity) return;

      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get(
          `/market/predict-by-state?state=${encodeURIComponent(
            state
          )}&commodity=${encodeURIComponent(commodity)}&days=${days}`
        );
        setPrediction(response.data.data);
      } catch (err) {
        console.error("Prediction error:", err);
        setError(err.message || "Failed to fetch market prediction");
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  // Fetch prediction when filters change
  useEffect(() => {
    fetchPrediction(filters.state, filters.commodity, filters.days);
  }, [filters.state, filters.commodity, filters.days, fetchPrediction]);

  // Handle filter changes
  const handleStateChange = (e) => {
    setFilters({
      ...filters,
      state: e.target.value,
      commodity: "",
    });
  };

  const handleCommodityChange = (e) => {
    setFilters({
      ...filters,
      commodity: e.target.value,
    });
  };

  const handleDaysChange = (e) => {
    setFilters({
      ...filters,
      days: parseInt(e.target.value),
    });
  };

  const handleRefresh = () => {
    fetchPrediction(filters.state, filters.commodity, filters.days);
  };

  // Export prediction data as CSV
  const handleExport = () => {
    if (!prediction) return;
    const csvContent = [
      ["Commodity", "State", "Expected Price", "Min Price", "Max Price", "Confidence", "Prediction Date"],
      [
        prediction.commodity,
        prediction.state,
        prediction.modal_price.toFixed(2),
        prediction.min_price.toFixed(2),
        prediction.max_price.toFixed(2),
        prediction.confidence,
        prediction.prediction_date,
      ],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${prediction.commodity}_${prediction.state}_prediction.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Agricultural Market Price Prediction
        </h1>
        {prediction && (
          <div className="flex space-x-2">
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <FiRefreshCw className="mr-2" />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <FiDownload className="mr-2" />
              Export CSV
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <FiFilter className="text-gray-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-800">
            Filter Market Predictions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label
              htmlFor="state"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              State
            </label>
            <select
              id="state"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              value={filters.state}
              onChange={handleStateChange}
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
            <label
              htmlFor="commodity"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Commodity
            </label>
            <select
              id="commodity"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              value={filters.commodity}
              onChange={handleCommodityChange}
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

          <div>
            <label
              htmlFor="days"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Forecast Period
            </label>
            <select
              id="days"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              value={filters.days}
              onChange={handleDaysChange}
              disabled={loading}
            >
              <option value="7">7 Days</option>
              <option value="10">10 Days</option>
              <option value="14">14 Days</option>
              <option value="30">30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-center">
            <FiAlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Prediction Card */}
      {prediction ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {prediction.commodity} Price Forecast
                </h3>
                <p className="text-gray-600 mt-1">
                  Statewide Average for {prediction.state}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  prediction.confidence === "high"
                    ? "bg-green-100 text-green-800"
                    : prediction.confidence === "medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {prediction.confidence.toUpperCase()} CONFIDENCE
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-4 border rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Minimum Price</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  ₹{prediction.min_price.toFixed(2)}
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-blue-50 shadow-sm">
                <p className="text-sm text-blue-600">Expected Price</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">
                  ₹{prediction.modal_price.toFixed(2)}
                </p>
              </div>
              <div className="p-4 border rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Maximum Price</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  ₹{prediction.max_price.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Prediction Confidence
                </span>
                <span className="text-sm font-medium">
                  {prediction.confidence === "high"
                    ? "80%"
                    : prediction.confidence === "medium"
                    ? "60%"
                    : "40%"}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    prediction.confidence === "high"
                      ? "bg-green-600"
                      : prediction.confidence === "medium"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    width:
                      prediction.confidence === "high"
                        ? "80%"
                        : prediction.confidence === "medium"
                        ? "60%"
                        : "40%",
                  }}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center">
              {prediction.modal_price > prediction.min_price ? (
                <span className="inline-flex items-center text-green-600">
                  <FiArrowUp className="mr-1" />
                  <span>
                    +
                    {(
                      ((prediction.modal_price - prediction.min_price) /
                        prediction.min_price) *
                      100
                    ).toFixed(1)}
                    % from minimum
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center text-red-600">
                  <FiArrowDown className="mr-1" />
                  <span>
                    {(
                      ((prediction.modal_price - prediction.min_price) /
                        prediction.min_price) *
                      100
                    ).toFixed(1)}
                    % from minimum
                  </span>
                </span>
              )}
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start">
                <FiInfo className="flex-shrink-0 text-gray-500 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">{prediction.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Based on {prediction.data_points_used} days of historical data •
                    Forecast for {prediction.prediction_date}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <div className="flex items-center">
              <FiInfo className="h-5 w-5 text-yellow-400 mr-2" />
              <p className="text-sm text-yellow-700">
                {filters.state && filters.commodity
                  ? "No forecast data available for the selected filters"
                  : "Please select a state and commodity to view market forecasts"}
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default StatePredictionDashboard;