import React, { useState } from "react";
import {
  Phone,
  User,
  Menu,
  X,
  LogOut,
  Home,
  Info,
  Settings,
  List,
  Gauge,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/home-icon.png";

interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check login status
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  // Navigation items with icons
  const leftMenuItems: MenuItem[] = [
    { name: "Home", path: "/", icon: <Home className="w-4 h-4" /> },
    { name: "About", path: "/about", icon: <Info className="w-4 h-4" /> },
    {
      name: "Services",
      path: "/services",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const rightMenuItems: MenuItem[] = [
    {
      name: "Listing",
      path: "/viewlisting?city=all",
      icon: <List className="w-4 h-4" />,
    },
    ...(isLoggedIn
      ? [
          {
            name: "Dashboard",
            path: "/dashboard",
            icon: <Gauge className="w-4 h-4" />,
          },
        ]
      : []),
  ];

  // Bottom navigation items for mobile
  const bottomNavItems: MenuItem[] = [
    { name: "Home", path: "/", icon: <Home className="w-5 h-5" /> },
    {
      name: "Listing",
      path: "/viewlisting?city=all",
      icon: <List className="w-5 h-5" />,
    },
    { name: "About", path: "/about", icon: <Info className="w-5 h-5" /> },
    {
      name: "Services",
      path: "/services",
      icon: <Settings className="w-5 h-5" />,
    },
    ...(isLoggedIn
      ? [
          {
            name: "Dashboard",
            path: "/dashboard",
            icon: <Gauge className="w-5 h-5" />,
          },
        ]
      : [
          {
            name: "Sign In",
            path: "/signin",
            icon: <User className="w-5 h-5" />,
          },
        ]),
  ];

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  const isActivePath = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path.includes("viewlisting"))
      return location.pathname.includes("viewlisting");
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-4 hidden lg:block">
        <nav className="max-w-7xl mx-auto bg-white/70 backdrop-blur-md shadow-xl rounded-2xl border border-white/30">
          <div className="px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-18 relative">
              {/* Logo and Brand */}
              <div className="flex items-center flex-shrink-0">
                <div
                  onClick={() => navigate("/")}
                  className="flex items-center hover:cursor-pointer group"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={logo}
                      alt="MotherHome Logo"
                      className="h-8 lg:h-9 w-auto transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-20 rounded-full transition-opacity duration-300"></div>
                  </div>
                  <span className="ml-2 text-lg lg:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent group-hover:from-yellow-600 group-hover:to-orange-600 transition-all duration-300">
                    MotherHomes
                  </span>
                </div>
              </div>

              {/* Center Navigation */}
              <div className="hidden lg:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
                <div className="flex items-center space-x-6 pointer-events-auto">
                  {leftMenuItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-all duration-300 group rounded-xl ${
                        isActivePath(item.path)
                          ? "text-yellow-600 bg-yellow-50"
                          : "text-gray-950 hover:text-gray-900 hover:bg-gray-100/50"
                      }`}
                    >
                      <span
                        className={`transition-colors duration-300 ${
                          isActivePath(item.path)
                            ? "text-yellow-600"
                            : "text-gray-950 group-hover:text-yellow-500"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </Link>
                  ))}
                  {rightMenuItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-all duration-300 group rounded-xl ${
                        isActivePath(item.path)
                          ? "text-yellow-600 bg-yellow-50"
                          : "text-gray-950 hover:text-gray-900 hover:bg-gray-100/50"
                      }`}
                    >
                      <span
                        className={`transition-colors duration-300 ${
                          isActivePath(item.path)
                            ? "text-yellow-600"
                            : "text-gray-950 group-hover:text-yellow-500"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right Side - Contact & Auth */}
              <div className="hidden lg:flex items-center space-x-2 flex-shrink-0">
                {/* Divider */}
                <div className="w-px h-6 bg-gray-300/60 mx-3"></div>

                {/* Contact */}
                <div className="hidden xl:flex items-center space-x-2 px-4 py-2 text-gray-950 hover:text-gray-800 hover:bg-gray-100/50 rounded-xl transition-all duration-300">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium text-sm">+91-6202653172</span>
                </div>

                {/* Auth Section */}
                {isLoggedIn ? (
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/profile"
                      className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100/50 rounded-xl transition-all duration-300 group"
                      title="Profile"
                    >
                      <User className="w-5 h-5 group-hover:text-yellow-500 transition-colors duration-300" />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden xl:inline">Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/signin"
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl transition-all duration-300"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="px-4 py-2 text-sm bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Top Header */}
      <div className="fixed top-0 left-0 right-0 z-50 lg:hidden">
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Brand */}
            <div
              onClick={() => navigate("/")}
              className="flex items-center hover:cursor-pointer"
            >
              <img src={logo} alt="MotherHome Logo" className="h-8 w-auto" />
              <span className="ml-2 text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                MotherHomes
              </span>
            </div>

            {/* Menu Button */}
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl transition-all duration-300"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="border-t border-gray-200/30 bg-white/90 backdrop-blur-md">
              <div className="py-4 space-y-2 px-4">
                {/* Navigation Items */}
                {isLoggedIn && (
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl transition-all duration-300"
                    onClick={toggleMenu}
                  >
                    <User className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">Profile</span>
                  </Link>
                )}

                {/* Contact */}
                <div className="flex items-center space-x-3 px-4 py-2 text-gray-600">
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">+91-6202653172</span>
                </div>

                {/* Auth Section */}
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="flex items-center justify-center w-full space-x-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl shadow-lg transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link
                      to="/signin"
                      className="px-4 py-3 text-center text-gray-700 hover:text-gray-900 font-medium rounded-xl hover:bg-gray-100/50 transition-all duration-300 border border-gray-200/60"
                      onClick={toggleMenu}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="px-4 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold rounded-xl text-center shadow-lg transition-all duration-300"
                      onClick={toggleMenu}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Island Style */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-4">
        <div className="relative">
          {/* Island Container */}
          <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/30 overflow-hidden">
            <div className="flex items-center justify-around px-2 py-3 relative">
              {bottomNavItems.map((item) => {
                const isActive = isActivePath(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`relative flex flex-col items-center space-y-1 px-3 py-2 transition-all duration-300 ${
                      isActive
                        ? "text-yellow-600 bg-yellow-50 rounded-xl"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-100/50 rounded-xl"
                    }`}
                  >
                    <div
                      className={`transition-all duration-300 ${
                        isActive ? "scale-125" : "scale-100"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <span
                      className={`text-xs font-medium transition-all duration-300 ${
                        isActive
                          ? "text-yellow-700 font-semibold"
                          : "text-gray-600"
                      }`}
                    >
                      {item.name}
                    </span>
                    {isActive && (
                      <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-sm"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add padding to body for mobile bottom nav */}
      <div className="pb-20 lg:pb-0"></div>
    </>
  );
};

export default Navbar;
