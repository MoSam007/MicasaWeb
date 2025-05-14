import React from 'react';
import { Link } from 'react-router-dom';
import { FaTruck, FaHome, FaClipboardList, FaCog } from 'react-icons/fa';
import { UserDropdown } from './UserDropdown';

const MoverNavigation: React.FC = () => {
  return (
    <nav className="bg-gradient-to-r from-green-500 to-green-600 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/moving-services" className="flex items-center space-x-2 hover:text-green-100">
              <FaTruck />
              <span>My Services</span>
            </Link>
            <Link to="/homes" className="flex items-center space-x-2 hover:text-green-100">
              <FaHome />
              <span>Available Homes</span>
            </Link>
            <Link to="/jobs" className="flex items-center space-x-2 hover:text-green-100">
              <FaClipboardList />
              <span>Moving Jobs</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/settings" className="hover:text-green-100">
              <FaCog />
            </Link>
            <UserDropdown theme="light" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MoverNavigation;