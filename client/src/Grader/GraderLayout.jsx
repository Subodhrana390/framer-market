import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FiUpload,
  FiList,
  FiFileText,
  FiClock,
  FiHome,
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
} from "react-icons/fi";
import { toast } from "react-toastify";

const GraderLayout = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userData = JSON.parse(localStorage.getItem("user"));

  const checkIsMobile = () => window.innerWidth < 768;
  const [isMobile] = useState(checkIsMobile());

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const graderProfile = user?.graderProfile || {};
    setIsVerified(graderProfile?.isVerified === true);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const menuItems = [
    {
      key: "dashboard",
      icon: <FiHome className="text-xl" />,
      label: "Dashboard",
      path: "/grader",
      requiresVerification: true,
    },
    {
      key: "upload-docs",
      icon: <FiUpload className="text-xl" />,
      label: "Upload Documents",
      path: "/grader/upload-documents",
      requiresVerification: false,
    },
    {
      key: "grading-requests",
      icon: <FiList className="text-xl" />,
      label: "Grading Requests",
      path: "/grader/grading-requests",
      requiresVerification: true,
    },
    {
      key: "submit-report",
      icon: <FiFileText className="text-xl" />,
      label: "Submit Report",
      path: "/grader/submit-report",
      requiresVerification: true,
    },
    {
      key: "grading-history",
      icon: <FiClock className="text-xl" />,
      label: "Grading History",
      path: "/grader/grading-history",
      requiresVerification: true,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("tokenExpiration");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberedEmail");
    localStorage.removeItem("rememberedRole");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={toggleMobileMenu}
          className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-600 text-white transition-all ${
            mobileMenuOpen ? "left-64 -translate-x-full" : "left-4"
          }`}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`bg-blue-800 text-white transition-all duration-300 flex flex-col ${
          isMobile
            ? `fixed inset-y-0 left-0 z-40 w-64 transform ${
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : `${collapsed ? "w-16" : "w-64"}`
        }`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-blue-700">
          {(!collapsed || isMobile) && (
            <h1 className="text-xl font-bold">Grader Panel</h1>
          )}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-full hover:bg-blue-700 focus:outline-none"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-2 p-2">
            {menuItems.map((item) => {
              const isDisabled = item.requiresVerification && !isVerified;
              return (
                <li key={item.key}>
                  <Link
                    to={isDisabled ? "#" : item.path}
                    className={`flex items-center p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-blue-700"
                    }`}
                    onClick={(e) => isDisabled && e.preventDefault()}
                    title={
                      isDisabled ? "Verify documents to access" : item.label
                    }
                  >
                    <span className="mr-3">{item.icon}</span>
                    {(!collapsed || isMobile) && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Profile Section */}
        <div
          className={`p-4 border-t border-blue-700 ${
            collapsed && !isMobile ? "flex justify-center" : ""
          }`}
        >
          <div
            className={`flex items-center ${
              collapsed && !isMobile ? "flex-col space-y-2" : "space-x-3"
            }`}
          >
            <div className="bg-blue-600 p-2 rounded-full">
              <FiUser className="text-white" />
            </div>
            {(!collapsed || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{userData.fullName}</p>
                <p className="text-xs text-blue-200 truncate">
                  {userData.email}
                </p>
              </div>
            )}
            {(!collapsed || isMobile) && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Logout"
                aria-label="Logout"
              >
                <FiLogOut />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          isMobile ? "ml-0" : collapsed ? "ml-20" : "ml-0"
        }`}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div className="sticky top-0 z-30 bg-white shadow-sm p-4 flex justify-between items-center md:hidden">
            <h2 className="text-lg font-semibold">Dashboard</h2>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Logout"
              aria-label="Logout"
            >
              <FiLogOut />
            </button>
          </div>
        )}

        <div className="p-4 md:p-6">
          {!isVerified && location.pathname !== "/grader/upload-documents" && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
              <p className="text-yellow-800">
                Please upload and verify your documents to access all features.{" "}
                <Link
                  to="/grader/upload-documents"
                  className="text-blue-600 hover:underline"
                >
                  Go to Upload Documents
                </Link>
              </p>
            </div>
          )}
          <Outlet />
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}
    </div>
  );
};

export default GraderLayout;
