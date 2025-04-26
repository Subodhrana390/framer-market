import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FiUpload,
  FiFileText,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
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

const UserLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    {
      key: "dashboard",
      icon: <FiHome className="text-xl" />,
      label: "Dashboard",
      path: "/user",
    },
    {
      key: "submit-crops",
      icon: <FiUpload className="text-xl" />,
      label: "Submit Crops",
      path: "/user/submit-crops",
    },
    {
      key: "grading-results",
      icon: <FiFileText className="text-xl" />,
      label: "Grading Results",
      path: "/user/grading-results",
    },
    {
      key: "crop-inventory",
      icon: <FiPackage className="text-xl" />,
      label: "Crop Inventory",
      path: "/user/crop-inventory",
    },
    {
      key: "market-prices",
      icon: <FiTrendingUp className="text-xl" />,
      label: "Market Prices",
      path: "/user/market-prices",
    },
    // {
    //   key: "transactions",
    //   icon: <FiClock className="text-xl" />,
    //   label: "Transactions",
    //   path: "/user/transactions",
    // },
  ];

  const handleLogout = () => {
    // Clear localStorage or sessionStorage
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
          className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-green-600 text-white transition-all ${
            mobileMenuOpen ? "left-64 -translate-x-full" : "left-4"
          }`}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`bg-green-800 text-white transition-all duration-300 flex flex-col ${
          isMobile
            ? `fixed inset-y-0 left-0 z-40 w-64 transform ${
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : `${collapsed ? "w-20" : "w-64"}`
        }`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-green-700">
          {(!collapsed || isMobile) && (
            <h1 className="text-xl font-bold">Farmer Portal</h1>
          )}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-full hover:bg-green-700 focus:outline-none"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-2 p-2">
            {menuItems.map((item) => (
              <li key={item.key}>
                <Link
                  to={item.path}
                  className="flex items-center p-3 rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <span className="mr-3">{item.icon}</span>
                  {(!collapsed || isMobile) && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Profile Section */}
        <div
          className={`p-4 border-t border-green-700 ${
            collapsed && !isMobile ? "flex justify-center" : ""
          }`}
        >
          <div
            className={`flex items-center ${
              collapsed && !isMobile ? "flex-col space-y-2" : "space-x-3"
            }`}
          >
            <div className="bg-green-600 p-2 rounded-full">
              <FiUser className="text-white" />
            </div>
            {(!collapsed || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">Farmer User</p>
                <p className="text-xs text-green-200 truncate">
                  farmer@example.com
                </p>
              </div>
            )}
            {(!collapsed || isMobile) && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              title="Logout"
              aria-label="Logout"
            >
              <FiLogOut />
            </button>
          </div>
        )}

        <div className="p-4 md:p-6">
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

export default UserLayout;
