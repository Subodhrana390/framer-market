// import React, { useEffect, useState } from "react";
// import { useDispatch } from "react-redux";
// import {
//   updatePrice,
//   setPrices,
//   setTrends,
//   setApmcLocations,
//   setPredictions,
//   addAlert,
// } from "../../redux/marketSlice";
// import axios from "axios";
// import {
//   FiActivity,
//   FiAlertCircle,
//   FiDollarSign,
//   FiMap,
//   FiDownload,
//   FiDatabase,
// } from "react-icons/fi";
// import { BsGraphUp } from "react-icons/bs";

// function Home() {
//   const dispatch = useDispatch();
//   const [loading, setLoading] = useState({
//     main: true,
//     enam: true,
//   });
//   const [error, setError] = useState({
//     main: null,
//     enam: null,
//   });
//   const [connectionStatus, setConnectionStatus] = useState("disconnected");

//   useEffect(() => {
//     // WebSocket for real-time prices and alerts
//     const ws = new WebSocket("ws://localhost:8080");

//     ws.onopen = () => {
//       setConnectionStatus("connected");
//       console.log("WebSocket connected");
//     };

//     ws.onclose = () => {
//       setConnectionStatus("disconnected");
//       console.log("WebSocket disconnected");
//     };

//     ws.onerror = (error) => {
//       setConnectionStatus("error");
//       console.error("WebSocket error:", error);
//     };

//     ws.onmessage = (event) => {
//       const { type, data } = JSON.parse(event.data);
//       if (type === "price") {
//         dispatch(updatePrice(data));
//       } else if (type === "alert") {
//         dispatch(addAlert(data));
//       }
//     };

//     // Initial data fetch
//     const fetchData = async () => {
//       try {
//         setLoading((prev) => ({ ...prev, main: true }));
//         // const [prices, trends, geodata, predictions] = await Promise.all([
//         //   axios.get("http://localhost:3000/api/prices"),
//         //   axios.get("http://localhost:3000/api/trends"),
//         //   axios.get("http://localhost:3000/api/geodata"),
//         //   axios.get("http://localhost:3000/api/predictions"),
//         // ]);

//         const predictions = await axios.get(
//           "http://localhost:3000/api/predictions"
//         );

//         // dispatch(setPrices(prices.data));
//         // dispatch(setTrends(trends.data));
//         // dispatch(setApmcLocations(geodata.data));
//         dispatch(setPredictions(predictions.data.data));
//         setLoading((prev) => ({ ...prev, main: false }));
//       } catch (err) {
//         setError((prev) => ({ ...prev, main: err.message }));
//         setLoading((prev) => ({ ...prev, main: false }));
//         console.error("Failed to fetch data:", err);
//       }
//     };

//     fetchData();

//     return () => ws.close();
//   }, [dispatch]);

//   if (loading.main) {
//     return (
//       <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="mt-4 text-gray-700">Loading market data...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error.main) {
//     return (
//       <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//         <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center">
//           <FiAlertCircle className="text-red-500 text-4xl mx-auto mb-4" />
//           <h2 className="text-xl font-bold text-gray-800 mb-2">
//             Data Loading Error
//           </h2>
//           <p className="text-gray-600 mb-4">{error.main}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <div className="container mx-auto px-4 py-6">
//         <header className="mb-8 text-center">
//           <h1 className="text-4xl font-bold text-gray-800 mb-2">
//             Farmer's Market Intelligence Hub
//           </h1>
//           <div className="flex items-center justify-center space-x-4">
//             <span
//               className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
//                 connectionStatus === "connected"
//                   ? "bg-green-100 text-green-800"
//                   : connectionStatus === "error"
//                   ? "bg-red-100 text-red-800"
//                   : "bg-yellow-100 text-yellow-800"
//               }`}
//             >
//               <span
//                 className={`inline-block w-2 h-2 rounded-full mr-2 ${
//                   connectionStatus === "connected"
//                     ? "bg-green-500"
//                     : connectionStatus === "error"
//                     ? "bg-red-500"
//                     : "bg-yellow-500"
//                 }`}
//               ></span>
//               {connectionStatus === "connected"
//                 ? "Live Data"
//                 : connectionStatus === "error"
//                 ? "Connection Error"
//                 : "Disconnected"}
//             </span>
//             <p className="text-gray-600">
//               Real-time agricultural market analytics
//             </p>
//           </div>
//         </header>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//             <div className="flex items-center mb-4">
//               <FiDollarSign className="text-green-500 text-xl mr-2" />
//               <h2 className="text-xl font-semibold text-gray-800">
//                 Live Price Ticker
//               </h2>
//             </div>
//             {/* <PriceTicker /> */}
//           </div>

//           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//             <div className="flex items-center mb-4">
//               <BsGraphUp className="text-blue-500 text-xl mr-2" />
//               <h2 className="text-xl font-semibold text-gray-800">
//                 Market Trends
//               </h2>
//             </div>
//             <TrendChart />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
//           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
//             <div className="flex items-center mb-4">
//               <FiMap className="text-purple-500 text-xl mr-2" />
//               <h2 className="text-xl font-semibold text-gray-800">
//                 APMC Market Comparison
//               </h2>
//             </div>
//             {/* <APMCComparison /> */}
//           </div>

//           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//             <div className="flex items-center mb-4">
//               <FiDownload className="text-indigo-500 text-xl mr-2" />
//               <h2 className="text-xl font-semibold text-gray-800">
//                 Data Export
//               </h2>
//             </div>
//             {/* <DataExport /> */}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 gap-6">
//           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//             <div className="flex items-center mb-4">
//               <FiActivity className="text-amber-500 text-xl mr-2" />
//               <h2 className="text-xl font-semibold text-gray-800">
//                 Predictive Analytics
//               </h2>
//             </div>
//             <PredictiveAlerts />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Home;

import React from "react";
import PriceTrendDashboard from "./PriceTrendDashboard";
import StatePredictionDashboard from "./StatePredictionDashboard";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";

const Home = () => {
  return (
    <div>
      <Header/>
      <HeroSection/>
      <StatePredictionDashboard />
      <PriceTrendDashboard />
    </div>
  );
};

export default Home;
