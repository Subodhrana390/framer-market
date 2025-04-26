import React, { useState, useEffect } from "react";
import {
  FiInfo,
  FiFilter,
  FiArrowUp,
  FiArrowDown,
  FiAlertTriangle,
  FiRefreshCw,
} from "react-icons/fi";
import { data } from "../constants/data.js";
import apiClient from "../apiClient/ApiClient.js";

const StatePredictionDashboard = () => {
  const [filters, setFilters] = useState({
    state: "",
    commodity: "",
    days: 10,
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const fetchPrediction = async () => {
    if (!filters.state || !filters.commodity) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(
        `/market/predict-by-state?state=${encodeURIComponent(
          filters.state
        )}&commodity=${encodeURIComponent(filters.commodity)}&days=${
          filters.days
        }`
      );
      setPrediction(response.data.data);
    } catch (err) {
      console.error("Prediction error:", err);
      setError(err.message || "Failed to fetch prediction");
    } finally {
      setLoading(false);
    }
  };

  // Fetch prediction when filters are valid and change
  useEffect(() => {
    fetchPrediction();
  }, [filters.state, filters.commodity, filters.days]);

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
    fetchPrediction();
  };

  if (loading && !prediction) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FiFilter className="text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-800">
              State Commodity Prediction
            </h2>
          </div>
          {prediction && (
            <button
              onClick={handleRefresh}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <FiRefreshCw className="mr-1" />
              Refresh
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State:
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commodity:
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Days to Consider:
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              value={filters.days}
              onChange={handleDaysChange}
              disabled={loading}
            >
              <option value="7">7 days</option>
              <option value="10">10 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Prediction Card */}
      {prediction ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {prediction.commodity} Price Prediction
                </h3>
                <p className="text-gray-600 mt-1">
                  Statewide average for {prediction.state}
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

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-500">Minimum Price</p>
                <p className="text-2xl font-bold mt-1">
                  ₹{prediction.min_price.toFixed(2)}
                </p>
              </div>

              <div className="p-4 border rounded-lg bg-blue-50">
                <p className="text-sm text-blue-600">Expected Price</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">
                  ₹{prediction.modal_price.toFixed(2)}
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-500">Maximum Price</p>
                <p className="text-2xl font-bold mt-1">
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
                      ? "bg-green-500"
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
                ></div>
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
                    Based on {prediction.data_points_used} days of data •
                    Prediction for {prediction.prediction_date}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiInfo className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  {filters.state && filters.commodity
                    ? "No prediction data available for the selected filters"
                    : "Please select a state and commodity to view predictions"}
                </p>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default StatePredictionDashboard;
