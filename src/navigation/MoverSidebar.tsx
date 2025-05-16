import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTruck, 
  FaHome, 
  FaClipboardList, 
  FaCog, 
  FaBars, 
  FaTimes,
  FaChartLine,
  FaMoon,
  FaSun
} from 'react-icons/fa';
import { UserDropdown } from './UserDropdown';
import { motion, AnimatePresence } from 'framer-motion';

interface MoverSidebarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const MoverSidebar: React.FC<MoverSidebarProps> = ({ isDarkMode, toggleDarkMode }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();

  // Auto-collapse sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile && !isOpen) {
        setIsOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Navigation links data
  const navLinks = [
    { to: "/moving-services", icon: <FaTruck />, text: "My Services" },
    { to: "/homes", icon: <FaHome />, text: "Available Homes" },
    { to: "/jobs", icon: <FaClipboardList />, text: "Moving Jobs" },
    { to: "/mover-analytics", icon: <FaChartLine />, text: "Analytics" },
    { to: "/settings", icon: <FaCog />, text: "Settings" },
  ];

  return (
    <>
      {/* Mobile Toggle Button - Always visible on mobile */}
      <button
        className={`lg:hidden fixed z-50 top-4 left-4 p-2 rounded-md ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-green-500 text-white'
        }`}
        onClick={toggleSidebar}
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      <AnimatePresence>
        {/* Mobile Overlay */}
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black z-30"
            onClick={toggleSidebar}
          />
        )}

        {/* Sidebar */}
        {isOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className={`fixed inset-y-0 left-0 z-40 w-64 ${
              isDarkMode 
                ? 'bg-gray-900 text-white shadow-lg shadow-gray-700/50' 
                : 'bg-gradient-to-b from-green-500 to-green-600 text-white shadow-lg shadow-green-700/50'
            } flex flex-col`}
          >
            {/* Logo Area */}
            <div className="flex items-center justify-between p-4 border-b border-green-400">
              <Link to="/moving-services" className="flex items-center space-x-3">
                <FaTruck size={24} />
                <span className="text-xl font-bold">MiCasa Movers</span>
              </Link>
              <button 
                className="lg:hidden text-white"
                onClick={toggleSidebar}
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* User Profile Summary */}
            <div className="p-4 border-b border-green-400">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-300 flex items-center justify-center text-green-700 font-bold">
                  JD
                </div>
                <div>
                  <h3 className="font-medium">John Doe</h3>
                  <p className="text-sm opacity-75">Professional Mover</p>
                </div>
              </div>
            </div>
            
            {/* Nav Links */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    location.pathname === link.to
                      ? isDarkMode 
                        ? 'bg-gray-700 text-white' 
                        : 'bg-green-700 text-white'
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-800' 
                        : 'text-green-50 hover:bg-green-600'
                  }`}
                >
                  {link.icon}
                  <span>{link.text}</span>
                </Link>
              ))}
            </nav>

            {/* Bottom Controls */}
            <div className={`px-4 py-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-green-400'}`}>
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 text-yellow-300' 
                      : 'bg-green-600 text-yellow-200'
                  }`}
                >
                  {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
                </button>
                <UserDropdown theme={isDarkMode ? "dark" : "light"} />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Toggle Button - Only visible when sidebar is closed */}
      {!isOpen && !isMobile && (
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`fixed z-50 top-4 left-4 p-2 rounded-md ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-green-500 text-white'
          }`}
          onClick={toggleSidebar}
        >
          <FaBars size={20} />
        </motion.button>
      )}
      
      {/* Content Spacer - when sidebar is open on desktop */}
      {isOpen && !isMobile && (
        <div className="w-64"></div>
      )}
    </>
  );
};

export default MoverSidebar;