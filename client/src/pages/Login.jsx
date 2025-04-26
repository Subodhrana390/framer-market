import React, { useState, useEffect, useCallback } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../apiClient/ApiClient";
import { ROLES } from "../constants/roles"
import { validateEmail } from "../utils/validators";

const FramerMarketLogin = () => {
  const [selectedRole, setSelectedRole] = useState(ROLES.USER);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  // Load remembered credentials safely
  useEffect(() => {
    try {
      const rememberedEmail = localStorage.getItem("rememberedEmail");
      const rememberedRole = localStorage.getItem("rememberedRole");

      if (rememberedEmail && validateEmail(rememberedEmail)) {
        setEmail(rememberedEmail);
        setRememberMe(true);
      }

      if (rememberedRole && Object.values(ROLES).includes(rememberedRole)) {
        setSelectedRole(rememberedRole);
      }
    } catch (error) {
      console.error("Error loading remembered credentials:", error);
      // Clear potentially corrupted data
      localStorage.removeItem("rememberedEmail");
      localStorage.removeItem("rememberedRole");
    }
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    const toastId = toast.loading("Authenticating...");

    try {
      // Clear previous errors
      setErrors({ email: "", password: "" });

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedRole", selectedRole);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedRole");
      }

      const response = await apiClient.post("/auth/login-user", {
        email,
        password,
        role: selectedRole,
      });

      const { token, user, role, tokenExpiration } = response.data.data;

      // Secure token storage with expiration
      const expirationTime = new Date().getTime() + tokenExpiration * 1000;
      localStorage.setItem("token", token);
      localStorage.setItem("tokenExpiration", expirationTime.toString());
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", role);

      toast.update(toastId, {
        render: "Login successful! Redirecting...",
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });

      // Role-based navigation with timeout for better UX
      setTimeout(() => {
        navigate(
          role === ROLES.ADMIN
            ? "/admin"
            : role === ROLES.GRADER
            ? "/grader"
            : "/user",
          { replace: true }
        );
      }, 1000);
    } catch (error) {
      console.error("Authentication error:", error);

      let errorMessage = "Authentication failed. Please try again.";
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Invalid credentials";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }

      toast.update(toastId, {
        render: errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });

      // Clear password field on error
      setPassword("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-8 sm:p-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Framer Market Portal
            </h1>
            <p className="text-sm text-gray-600">
              Sign in to access your account
            </p>
          </div>

          {/* Role Selection */}
          <div className="flex justify-center space-x-2 mt-6">
            {Object.values(ROLES).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                  selectedRole === role
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                aria-label={`Login as ${role}`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`block w-full pl-10 pr-3 py-2.5 border ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors`}
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`block w-full pl-10 pr-3 py-2.5 border ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                />
              </div>
              {errors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700 cursor-pointer"
                >
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a
                  href="/forgot-password"
                  className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4">
                      <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />
                      <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]" />
                      <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500" />
                    </div>
                    Signing in...
                  </>
                ) : (
                  `Sign in as ${selectedRole}`
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Don't have an account?{" "}
              <a
                href="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
              >
                Register here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(FramerMarketLogin);
