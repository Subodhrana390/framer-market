import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AdminRoute from "./Admin/AdminRoute";
import GraderRoute from "./Grader/GraderRoute";
import UserRoute from "./User/UserRoute";
import Login from "./pages/Login";
import CreateAccountPage from "./pages/CreateAccountPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/user/*" element={<UserRoute />} />
        <Route path="/grader/*" element={<GraderRoute />} />
        <Route path="/admin/*" element={<AdminRoute />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<CreateAccountPage />} />
      </Routes>
    </Router>
  );
};

export default App;
