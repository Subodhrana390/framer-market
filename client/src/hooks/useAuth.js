import { useState, useEffect } from "react";
import apiClient from "../apiClient/ApiClient";
import { useNavigate } from "react-router-dom";

const validateToken = async (token) => {
  try {
    const response = await apiClient.get("/auth/validate-token", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.isValid;
  } catch (error) {
    return false;
  }
};

export const useAuth = (requiredRole) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (!token || (requiredRole && role !== requiredRole)) {
        setIsLoading(false);
        return;
      }

      try {
        const isValid = await validateToken(token);
        setIsAuthorized(isValid);
      } catch (error) {
        localStorage.clear();
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requiredRole]);

  return { isLoading, isAuthorized };
};
