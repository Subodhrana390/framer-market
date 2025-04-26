import React, { useState } from "react";
import {
  FaHome,
  FaChartLine,
  FaSignInAlt,
  FaUserPlus,
  FaBullseye,
  FaBars,
  FaTimes,
  FaChartPie,
  FaLeaf,
} from "react-icons/fa";
import AgroLogo from "/Agro_Logo.jpg";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Get auth data from storage
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getDashboardPath = () => {
    if (!token) return "/login";

    switch (role) {
      case "admin":
        return "/admin";
      case "grader":
        return "/grader";
      default:
        return "/user";
    }
  };

  const handleLogout = () => {
    // Remove all auth-related items from storage
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiration");
    localStorage.removeItem("role");

    // Optional: Clear any other user-related data
    // localStorage.removeItem('userData');

    // Redirect to login page
    navigate("/login");

    // Optional: Refresh the page to reset the application state
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="absolute inset-0 bg-green-50/80 backdrop-blur-md border-b border-emerald-200/50 shadow-sm"></div>

      <div className="container mx-auto px-4 py-3 relative z-10">
        <div className="flex justify-between items-center">
          {/* Logo with leaf icon */}
          <div className="flex items-center space-x-2">
            <FaLeaf className="text-emerald-600 text-2xl" />
            <a href="/" className="text-2xl font-bold">
              <img
                src={AgroLogo}
                alt="Agro Logo"
                className="h-16 w-auto hover:opacity-90 transition-opacity"
              />
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4">
            <NavLink href="/" icon={<FaHome />} text="Home" />
            <NavLink href="/features" icon={<FaChartLine />} text="Features" />
            <NavLink href="/goals" icon={<FaBullseye />} text="Goals" />
            <NavLink
              href={getDashboardPath()}
              icon={<FaChartPie />}
              text="Dashboard"
            />
          </nav>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex space-x-3">
            {token ? (
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 rounded-lg font-medium transition-colors text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/50 border border-emerald-300"
              >
                <FaSignInAlt className="mr-2" />
                Logout
              </button>
            ) : (
              <>
                <AuthLink
                  href="/login"
                  icon={<FaSignInAlt />}
                  text="Login"
                  variant="outline"
                />
                <AuthLink
                  href="/register"
                  icon={<FaUserPlus />}
                  text="Sign Up"
                  variant="solid"
                />
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-emerald-800 focus:outline-none p-2 rounded-md hover:bg-emerald-100/50 transition"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pb-3 space-y-2">
            <div className="bg-emerald-50/90 backdrop-blur-lg rounded-xl p-4 border border-emerald-200/50 shadow-lg">
              <MobileNavLink href="/" icon={<FaHome />} text="Home" />
              <MobileNavLink
                href="/features"
                icon={<FaChartLine />}
                text="Features"
              />
              <MobileNavLink href="/goals" icon={<FaBullseye />} text="Goals" />
              <MobileNavLink
                href={getDashboardPath()}
                icon={<FaChartPie />}
                text="Dashboard"
              />

              <div className="pt-2 border-t border-emerald-200/50 mt-2 space-y-2">
                {token ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-full px-4 py-3 rounded-lg font-medium border border-emerald-300 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/50"
                  >
                    <FaSignInAlt className="mr-3" />
                    Logout
                  </button>
                ) : (
                  <>
                    <MobileAuthLink
                      href="/login"
                      icon={<FaSignInAlt />}
                      text="Login"
                      variant="outline"
                    />
                    <MobileAuthLink
                      href="/register"
                      icon={<FaUserPlus />}
                      text="Sign Up"
                      variant="solid"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

const NavLink = ({ href, icon, text }) => (
  <a
    href={href}
    className="flex items-center px-3 py-2 text-emerald-800 hover:text-emerald-700 transition-colors font-medium hover:bg-emerald-100/50 rounded-lg"
  >
    <span className="mr-2 text-emerald-600">{icon}</span>
    {text}
  </a>
);

const AuthLink = ({ href, icon, text, variant }) => (
  <a
    href={href}
    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
      variant === "solid"
        ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
        : "text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/50 border border-emerald-300"
    }`}
  >
    <span className="mr-2">{icon}</span>
    {text}
  </a>
);

const MobileNavLink = ({ href, icon, text }) => (
  <a
    href={href}
    className="flex items-center px-4 py-3 text-emerald-800 hover:text-emerald-700 hover:bg-emerald-100/50 rounded-lg transition"
  >
    <span className="mr-3 text-emerald-600">{icon}</span>
    {text}
  </a>
);

const MobileAuthLink = ({ href, icon, text, variant }) => (
  <a
    href={href}
    className={`flex items-center justify-center px-4 py-3 rounded-lg font-medium ${
      variant === "solid"
        ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
        : "border border-emerald-300 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/50"
    }`}
  >
    <span className="mr-3">{icon}</span>
    {text}
  </a>
);

export default Header;
