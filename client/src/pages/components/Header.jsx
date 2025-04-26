import React from "react";
import { useState } from "react";
import {
  FaHome,
  FaChartLine,
  FaSignInAlt,
  FaUserPlus,
  FaBullseye,
  FaBars,
  FaTimes,
  FaChartPie,
} from "react-icons/fa";
import AgroLogo from "../../../public/Agro_Logo.jpg"; // Adjust path as needed

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-indigo-600">
              <img
                src={AgroLogo}
                alt="Agro Logo"
                className="h-20 w-auto hover:opacity-90 transition-opacity"
              />
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <NavLink href="/" icon={<FaHome />} text="Home" />
            <NavLink href="/features" icon={<FaChartLine />} text="Features" />
            <NavLink href="/goals" icon={<FaBullseye />} text="Goals" />
            <NavLink href="/dashboard" icon={<FaChartPie />} text="Dashboard" />
          </nav>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex space-x-3">
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
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 focus:outline-none p-2 rounded-md hover:bg-gray-100 transition"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pb-3 space-y-2">
            <MobileNavLink href="/" icon={<FaHome />} text="Home" />
            <MobileNavLink
              href="/features"
              icon={<FaChartLine />}
              text="Features"
            />
            <MobileNavLink href="/goals" icon={<FaBullseye />} text="Goals" />
            <MobileNavLink
              href="/dashboard"
              icon={<FaChartPie />}
              text="Dashboard"
            />

            <div className="pt-2 border-t border-gray-200 mt-2 space-y-2">
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
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

// Reusable components
const NavLink = ({ href, icon, text }) => (
  <a
    href={href}
    className="flex items-center px-3 py-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium"
  >
    <span className="mr-2">{icon}</span>
    {text}
  </a>
);

const AuthLink = ({ href, icon, text, variant }) => (
  <a
    href={href}
    className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
      variant === "solid"
        ? "bg-indigo-600 text-white hover:bg-indigo-700"
        : "text-gray-700 hover:text-indigo-600 hover:bg-gray-100"
    }`}
  >
    <span className="mr-2">{icon}</span>
    {text}
  </a>
);

const MobileNavLink = ({ href, icon, text }) => (
  <a
    href={href}
    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
  >
    <span className="mr-3">{icon}</span>
    {text}
  </a>
);

const MobileAuthLink = ({ href, icon, text, variant }) => (
  <a
    href={href}
    className={`flex items-center justify-center px-4 py-3 rounded-lg font-medium ${
      variant === "solid"
        ? "bg-indigo-600 text-white hover:bg-indigo-700"
        : "border border-gray-300 text-gray-700 hover:bg-gray-100"
    }`}
  >
    <span className="mr-3">{icon}</span>
    {text}
  </a>
);

export default Header;
