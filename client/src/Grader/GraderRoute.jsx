import React from "react";
import { Routes, Route } from "react-router-dom";
import GraderLayout from "./GraderLayout";
import GraderDashboard from "./components/GraderDashboard";
import UploadDocuments from "./components/UploadDocuments";
import GradingRequests from "./components/GradingRequests";
import SubmitReport from "./components/SubmitReport";
import GradingHistory from "./components/GradingHistory";
import GraderProtectedRoute from "./GraderProtectedRoute";
import GraderAppointments from "./components/GraderAppointments";

const GraderRoute = () => {
  return (
    <Routes>
      <Route element={<GraderProtectedRoute />}>
        <Route path="/" element={<GraderLayout />}>
          <Route index element={<GraderDashboard />} />
          <Route path="upload-documents" element={<UploadDocuments />} />
          <Route path="grading-requests" element={<GradingRequests />} />
          <Route path="submit-report" element={<SubmitReport />} />
          <Route path="grading-history" element={<GradingHistory />} />
          <Route path="appointments" element={<GraderAppointments />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default GraderRoute;
