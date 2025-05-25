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
  FaSun,
  FaUserCircle,
  FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../auth/ClerkauthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface MoverSidebarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const MoverSidebar: React.FC<MoverSidebarProps> = ({ isDarkMode, toggleDarkMode }) => {
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

  // Navigation links data
  const navLinks = [
    { to: "/moving-services", icon: <FaHome />, text: "My Services" },
    { to: "/jobs", icon: <FaClipboardList />, text: "Moving Jobs" },
    { to: "/mover-analytics", icon: <FaChartLine />, text: "Analytics" },
    { to: "/mover-settings", icon: <FaCog />, text: "Settings" },
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
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-green-500 text-white'
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
                : 'bg-gradient-to-b from-green-500 to-green-600 text-white shadow-lg shadow-green-700/50'
            } flex flex-col`}
          >
            {/* Logo Area */}
            <motion.div 
              className="flex items-center justify-between p-4 border-b border-green-400"
              variants={navItemVariants}
            >
              <Link to="/moving-services" className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <FaTruck size={24} />
                </motion.div>
                <span className="text-xl font-bold">MiCasa Movers</span>
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
              className="p-4 border-b border-green-400"
              variants={navItemVariants}
            >
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="w-12 h-12 rounded-full bg-green-300 flex items-center justify-center text-green-700 font-bold overflow-hidden"
                  whileHover={{ scale: 1.1 }}
                >
                  <FaUserCircle size={32} className="text-green-700" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">
                    {username || userEmail?.split('@')[0] || 'John Doe'}
                  </h3>
                  <p className="text-sm opacity-75">Professional Mover</p>
                </div>
              </div>
            </motion.div>
            
            {/* Nav Links */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {navLinks.map((link) => (
                <motion.div key={link.to} variants={navItemVariants}>
                  <Link
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
                    <motion.div
                      whileHover={{ rotate: 15 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {link.icon}
                    </motion.div>
                    <span>{link.text}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Bottom Controls */}
            <motion.div 
              className={`px-4 py-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-green-400'} space-y-3`}
              variants={navItemVariants}
            >
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-75">Dark Mode</span>
                <motion.button
                  onClick={toggleDarkMode}
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 text-yellow-300' 
                      : 'bg-green-600 text-yellow-200'
                  }`}
                >
                  {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
                </motion.button>
              </div>

              {/* Logout Button */}
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                  showLogoutConfirm
                    ? 'bg-red-600 text-white'
                    : isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white' 
                      : 'bg-green-600 text-green-50 hover:bg-red-500 hover:text-white'
                }`}
              >
                <FaSignOutAlt size={16} />
                <span className="font-medium">
                  {showLogoutConfirm ? 'Confirm Logout' : 'Log Out'}
                </span>
              </motion.button>
              
              {showLogoutConfirm && (
                <motion.button
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setShowLogoutConfirm(false)}
                  className={`w-full px-4 py-2 text-sm rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-green-600 text-green-50 hover:bg-green-700'
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
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`fixed z-40 top-4 left-4 p-3 rounded-full shadow-lg ${
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