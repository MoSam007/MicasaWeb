import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaClipboardList, 
  FaCog, 
  FaBars, 
  FaTimes,
  FaChartLine,
  FaMoon,
  FaSun,
  FaUserCircle,
  FaSignOutAlt,
  FaPlus,
  FaBuilding
} from 'react-icons/fa';
import { useAuth } from '../auth/ClerkauthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface OwnerSidebarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const OwnerSidebar: React.FC<OwnerSidebarProps> = ({ isDarkMode, toggleDarkMode }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const { userEmail, username, logout } = useAuth();

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

  // Handle logout with confirmation
  const handleLogout = async () => {
    if (!showLogoutConfirm) {
      setShowLogoutConfirm(true);
      return;
    }
    
    try {
      await logout();
      setShowLogoutConfirm(false);
    } catch (error) {
      console.error('Logout failed:', error);
      setShowLogoutConfirm(false);
    }
  };

  // Navigation links data for property owners
  const navLinks = [
    { to: "/my-listings", icon: <FaHome />, text: "My Properties" },
    { to: "/add-listing", icon: <FaPlus />, text: "Add Listing" },
    { to: "/admin/listings", icon: <FaClipboardList />, text: "Manage Listings" },
    { to: "/owner-analytics", icon: <FaChartLine />, text: "Analytics" },
    { to: "/owner-settings", icon: <FaCog />, text: "Settings" },
  ];

  // Animation variants
  const sidebarVariants = {
    open: { 
      x: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    closed: { 
      x: isMobile ? -300 : -300,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const navItemVariants = {
    open: { 
      x: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    },
    closed: { 
      x: -20, 
      opacity: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  return (
    <>
      {/* Mobile Toggle Button - Always visible on mobile */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`lg:hidden fixed z-50 top-4 left-4 p-3 rounded-full shadow-lg ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-amber-600 text-white'
        }`}
        onClick={toggleSidebar}
        initial={false}
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </motion.button>

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
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className={`fixed inset-y-0 left-0 z-40 w-64 ${
              isDarkMode 
                ? 'bg-gray-900 text-white shadow-lg shadow-gray-700/50' 
                : 'bg-gradient-to-b from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-800/50'
            } flex flex-col`}
          >
            {/* Logo Area */}
            <motion.div 
              className={`flex items-center justify-between p-4 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-amber-500'
              }`}
              variants={navItemVariants}
            >
              <Link to="/my-listings" className="flex items-center space-x-3">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  <FaBuilding size={24} />
                </motion.div>
                <span className="text-xl font-bold">MiCasa Owners</span>
              </Link>
              <button 
                className="lg:hidden text-white"
                onClick={toggleSidebar}
              >
                <FaTimes size={20} />
              </button>
            </motion.div>

            {/* User Profile Summary */}
            <motion.div 
              className={`p-4 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-amber-500'
              }`}
              variants={navItemVariants}
            >
              <div className="flex items-center space-x-3">
                <motion.div 
                  className={`w-12 h-12 rounded-full ${
                    isDarkMode ? 'bg-gray-700' : 'bg-amber-300'
                  } flex items-center justify-center ${
                    isDarkMode ? 'text-gray-300' : 'text-amber-800'
                  } font-bold overflow-hidden`}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: [0, -10, 10, -5, 0]
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <FaUserCircle size={32} />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">
                    {username || userEmail?.split('@')[0] || 'Property Owner'}
                  </h3>
                  <p className="text-sm opacity-75">Property Manager</p>
                </div>
              </div>
            </motion.div>
            
            {/* Nav Links */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {navLinks.map((link, index) => (
                <motion.div 
                  key={link.to} 
                  variants={navItemVariants}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link
                    to={link.to}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      location.pathname === link.to
                        ? isDarkMode 
                          ? 'bg-gray-700 text-white shadow-lg' 
                          : 'bg-amber-800 text-white shadow-lg shadow-amber-900/30'
                        : isDarkMode 
                          ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                          : 'text-amber-50 hover:bg-amber-700 hover:text-white'
                    }`}
                  >
                    <motion.div
                      whileHover={{ 
                        rotate: 360,
                        scale: 1.2
                      }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300,
                        duration: 0.6
                      }}
                      className="flex-shrink-0"
                    >
                      {link.icon}
                    </motion.div>
                    <span className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                      {link.text}
                    </span>
                    {location.pathname === link.to && (
                      <motion.div
                        layoutId="activeTab"
                        className={`absolute right-0 w-1 h-8 ${
                          isDarkMode ? 'bg-blue-400' : 'bg-amber-300'
                        } rounded-l-full`}
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Bottom Controls */}
            <motion.div 
              className={`px-4 py-3 border-t ${
                isDarkMode ? 'border-gray-700' : 'border-amber-500'
              } space-y-3`}
              variants={navItemVariants}
            >
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-75 font-medium">Dark Mode</span>
                <motion.button
                  onClick={toggleDarkMode}
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 180 
                  }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
                      : 'bg-amber-700 text-yellow-200 hover:bg-amber-800'
                  }`}
                >
                  <motion.div
                    animate={{ rotate: isDarkMode ? 0 : 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
                  </motion.div>
                </motion.button>
              </div>

              {/* Logout Button */}
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  showLogoutConfirm
                    ? 'bg-red-600 text-white shadow-lg'
                    : isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white hover:shadow-lg' 
                      : 'bg-amber-700 text-amber-50 hover:bg-red-500 hover:text-white hover:shadow-lg'
                }`}
              >
                <motion.div
                  animate={{ 
                    rotate: showLogoutConfirm ? [0, 10, -10, 0] : 0 
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <FaSignOutAlt size={16} />
                </motion.div>
                <span>
                  {showLogoutConfirm ? 'Confirm Logout' : 'Log Out'}
                </span>
              </motion.button>
              
              {showLogoutConfirm && (
                <motion.button
                  initial={{ opacity: 0, y: -10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  onClick={() => setShowLogoutConfirm(false)}
                  className={`w-full px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-amber-700 text-amber-50 hover:bg-amber-800'
                  }`}
                >
                  Cancel
                </motion.button>
              )}
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Toggle Button - Only visible when sidebar is closed */}
      {!isOpen && !isMobile && (
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ 
            scale: 1.1,
            boxShadow: "0 8px 25px rgba(245, 158, 11, 0.3)"
          }}
          whileTap={{ scale: 0.9 }}
          className={`fixed z-40 top-4 left-4 p-3 rounded-full shadow-lg transition-all duration-200 ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-amber-600 text-white hover:bg-amber-700'
          }`}
          onClick={toggleSidebar}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <FaBars size={20} />
          </motion.div>
        </motion.button>
      )}
      
      {/* Content Spacer - when sidebar is open on desktop */}
      {isOpen && !isMobile && (
        <div className="w-64"></div>
      )}
    </>
  );
};

export default OwnerSidebar;