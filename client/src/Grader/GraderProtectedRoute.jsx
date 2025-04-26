import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../constants/roles";

const GraderProtectedRoute = () => {
  const { isLoading, isAuthorized } = useAuth(ROLES.GRADER);

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center space-x-2">
        <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />
        <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]" />
        <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500" />
      </div>
    );

  return isAuthorized ? <Outlet /> : <Navigate to="/login" replace />;
};

export default GraderProtectedRoute;
