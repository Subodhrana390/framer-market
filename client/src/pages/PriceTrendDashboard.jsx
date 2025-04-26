import React, { useState, useEffect } from "react";
import {
  LineChart,
  BarChart,
  AreaChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertCircle,
  FiFilter,
  FiDownload,
  FiShare2
} from "react-icons/fi";
import { FaLeaf, FaTractor, FaWarehouse, FaChartLine } from "react-icons/fa";
import { New_Data } from "../constants/data.js";
import apiClient from "../apiClient/ApiClient.js";
import axios from 'axios'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const PriceTrendDashboard = () => {
  const [filters, setFilters] = useState({
    state: "",
    apmc: "",
    commodity: "",
    days: 30
  });
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("price");

  // Get unique states from the data
  const stateOptions = Array.from(new Set(New_Data.map(item => item.state)));

  // Get APMCs for the selected state
  const apmcOptions = filters.state 
    ? New_Data.find(item => item.state === filters.state)?.apmcs || []
    : [];

  // Get commodities for the selected APMC or all commodities in the state
  const commodityOptions = filters.apmc
    ? apmcOptions.find(apmc => apmc.apmc === filters.apmc)?.commodities || []
    : apmcOptions.flatMap(apmc => apmc.commodities);

  useEffect(() => {
    const source = axios.CancelToken.source();

    const fetchTrendData = async () => {
      if (!filters.state || !filters.commodity) return;

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
          cancelToken: source.token
        });

        if (response.data?.data?.trends) {
          setTrendData(response.data.data);
        } else {
          setError("No data available for the selected filters");
          setTrendData(null);
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError(err.response?.data?.message || "Failed to fetch data");
          setTrendData(null);
        }
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchTrendData, 500);
    return () => {
      source.cancel();
      clearTimeout(debounceTimer);
    };
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      ...(name === "state" && { apmc: "", commodity: "" }),
      ...(name === "apmc" && { commodity: "" }),
    }));
  };

  const calculateMetrics = () => {
    if (!trendData?.trends?.length) return null;
    
    const prices = trendData.trends.map(t => t.modal_price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    const totalArrivals = trendData.trends.reduce((sum, t) => sum + (t.commodity_arrivals || 0), 0);
    const totalTraded = trendData.trends.reduce((sum, t) => sum + (t.commodity_traded || 0), 0);
    const utilization = (totalTraded / totalArrivals) * 100;
    
    const priceChange = ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100;
    
    return {
      minPrice,
      maxPrice,
      avgPrice,
      totalArrivals,
      totalTraded,
      utilization,
      priceChange,
      direction: priceChange >= 0 ? "up" : "down"
    };
  };

  const metrics = calculateMetrics();
  const weeklyData = groupByWeekday(trendData?.trends || []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
          <FaLeaf className="mr-2 text-green-600" />
          Agricultural Market Intelligence
        </h1>
        <div className="flex space-x-2">
          <button className="btn btn-outline">
            <FiDownload className="mr-2" />
            Export
          </button>
          <button className="btn btn-outline">
            <FiShare2 className="mr-2" />
            Share
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center mb-4">
          <FiFilter className="text-gray-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-700">Market Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <select
              name="state"
              value={filters.state}
              onChange={handleFilterChange}
              className="select select-bordered w-full"
            >
              <option value="">Select State</option>
              {stateOptions.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Market (APMC)</label>
            <select
              name="apmc"
              value={filters.apmc}
              onChange={handleFilterChange}
              className="select select-bordered w-full"
              disabled={!filters.state}
            >
              <option value="">All Markets</option>
              {apmcOptions.map(apmc => (
                <option key={apmc.apmc} value={apmc.apmc}>{apmc.apmc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commodity</label>
            <select
              name="commodity"
              value={filters.commodity}
              onChange={handleFilterChange}
              className="select select-bordered w-full"
              disabled={!filters.state}
            >
              <option value="">Select Commodity</option>
              {commodityOptions.map((commodity, i) => (
                <option key={`${commodity}-${i}`} value={commodity}>{commodity}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
            <select
              name="days"
              value={filters.days}
              onChange={handleFilterChange}
              className="select select-bordered w-full"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="180">Last 6 Months</option>
              <option value="365">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <FiAlertCircle className="text-xl" />
          <span>{error}</span>
        </div>
      )}

      {/* Dashboard Content */}
      {trendData ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SummaryCard
              title="Current Price"
              value={`₹${trendData.trends[trendData.trends.length - 1].modal_price.toLocaleString()}`}
              change={metrics.priceChange}
              icon={<FaChartLine className="text-blue-500" />}
              color="blue"
            />
            <SummaryCard
              title="Total Arrivals"
              value={`${metrics.totalArrivals.toLocaleString()} ${trendData.unit || ''}`}
              icon={<FaTractor className="text-green-500" />}
              color="green"
            />
            <SummaryCard
              title="Total Traded"
              value={`${metrics.totalTraded.toLocaleString()} ${trendData.unit || ''}`}
              icon={<FaWarehouse className="text-orange-500" />}
              color="orange"
            />
            <SummaryCard
              title="Utilization Rate"
              value={`${metrics.utilization.toFixed(1)}%`}
              change={metrics.utilization - 50} // vs benchmark
              icon={<FiTrendingUp className="text-purple-500" />}
              color="purple"
            />
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button 
              className={`tab tab-bordered ${activeTab === 'price' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('price')}
            >
              Price Trends
            </button> 
            <button 
              className={`tab tab-bordered ${activeTab === 'volume' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('volume')}
            >
              Volume Analysis
            </button>
            <button 
              className={`tab tab-bordered ${activeTab === 'weekly' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('weekly')}
            >
              Weekly Patterns
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            {activeTab === 'price' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FiTrendingUp className="mr-2 text-green-600" />
                  Price Movement Analysis
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData.trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      />
                      <YAxis 
                        tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                        domain={['dataMin - 100', 'dataMax + 100']}
                      />
                      <Tooltip
                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, "Price"]}
                        labelFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
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
                      <ReferenceLine 
                        y={metrics.avgPrice} 
                        stroke="#10B981" 
                        label={`Avg ₹${metrics.avgPrice.toLocaleString('en-IN')}`}
                        strokeDasharray="3 3"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'volume' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FiTrendingUp className="mr-2 text-blue-600" />
                  Market Volume Trends
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData.trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [
                          `${value.toLocaleString('en-IN')} ${trendData.unit}`,
                          name === 'commodity_arrivals' ? 'Arrivals' : 'Traded'
                        ]}
                      />
                      <Legend />
                      <Bar 
                        dataKey="commodity_arrivals" 
                        name="Arrivals" 
                        fill="#8884d8" 
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="commodity_traded" 
                        name="Traded" 
                        fill="#82ca9d" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'weekly' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Weekly Price Pattern</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="weekday" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="avgPrice" 
                          name="Avg Price" 
                          stroke="#ff7300" 
                          fill="#ff7300" 
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-3">Volume Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Arrivals', value: metrics.totalArrivals },
                            { name: 'Traded', value: metrics.totalTraded },
                            { name: 'Wastage', value: metrics.totalArrivals - metrics.totalTraded }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#0088FE" />
                          <Cell fill="#00C49F" />
                          <Cell fill="#FFBB28" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="max-w-md mx-auto">
            <FaLeaf className="text-5xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-500 mb-2">
              {filters.commodity ? "No data available" : "Select a commodity to view market trends"}
            </h3>
            <p className="text-gray-400">
              Choose a state, market and commodity from the filters above to analyze price and volume trends
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const SummaryCard = ({ title, value, change, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-800',
    green: 'bg-green-50 text-green-800',
    orange: 'bg-orange-50 text-orange-800',
    purple: 'bg-purple-50 text-purple-800'
  };

  return (
    <div className={`p-4 rounded-lg ${colorClasses[color]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="p-2 rounded-full bg-white bg-opacity-50">
          {icon}
        </div>
      </div>
      {change !== undefined && (
        <div className={`mt-2 text-sm flex items-center ${
          change >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {change >= 0 ? (
            <FiTrendingUp className="mr-1" />
          ) : (
            <FiTrendingDown className="mr-1" />
          )}
          {Math.abs(change).toFixed(1)}% {change >= 0 ? 'increase' : 'decrease'}
        </div>
      )}
    </div>
  );
};

// Helper function to group data by weekday
function groupByWeekday(data) {
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const grouped = weekdays.map(day => ({ 
    weekday: day, 
    avgPrice: 0, 
    count: 0 
  }));

  data.forEach(item => {
    const day = new Date(item.date).getDay();
    grouped[day].avgPrice += item.modal_price;
    grouped[day].count++;
  });

  return grouped.map(day => ({
    weekday: day.weekday,
    avgPrice: day.count > 0 ? Math.round(day.avgPrice / day.count) : 0
  }));
}

export default PriceTrendDashboard;