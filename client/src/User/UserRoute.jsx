import React from "react";
import { Routes, Route } from "react-router-dom";
import UserLayout from "./UserLayout";
import UserDashboard from "./components/UserDashboard";
import SubmitCrops from "./components/SubmitCrops";
import GradingResults from "./components/GradingResults.jsx";
import CropInventory from "./components/CropInventory";
import UserProtectedRoute from "./UserProtectedRoute.jsx";
import MarketTable from "../pages/MarketTable.jsx";
// import TransactionHistory from './TransactionHistory';

const UserRoute = () => {
  return (
    <Routes>
      <Route element={<UserProtectedRoute />}>
        <Route path="/" element={<UserLayout />}>
          <Route index element={<UserDashboard />} />
          <Route path="submit-crops" element={<SubmitCrops />} />
          <Route path="grading-results" element={<GradingResults />} />
          <Route path="crop-inventory" element={<CropInventory />} />
          <Route path="market-prices" element={<MarketTable />} />
          {/* <Route path="transactions" element={<TransactionHistory />} /> */}
        </Route>
      </Route>
    </Routes>
  );
};

export default UserRoute;
