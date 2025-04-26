import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "./AdminLayout";
// import Dashboard from './Dashboard';
import ManagingUsers from "./components/ManagingUsers";
import VerifyGraders from "./components/VerifyGraders";
import AdminProtectedRoute from "./AdminProtectedRoute";
// import CropVerification from './CropVerification';
// import Transactions from './Transactions';
// import Settings from './Settings';
// import NotFound from '../NotFound';

const AdminRoute = () => {
  return (
    <Routes>
      <Route element={<AdminProtectedRoute />}>
        <Route path="/" element={<AdminLayout />}>
          {/* <Route index element={<Dashboard />} /> */}
          <Route path="manage-users" element={<ManagingUsers />} />
          <Route path="verify-graders" element={<VerifyGraders />} />
          {/* <Route path="crop-verification" element={<CropVerification />} /> */}
          {/* <Route path="transactions" element={<Transactions />} /> */}
          {/* <Route path="settings" element={<Settings />} /> */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoute;
