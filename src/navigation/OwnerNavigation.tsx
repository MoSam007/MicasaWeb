import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaPlus, FaCog, FaChartBar, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../auth/authContext';

// Add UserAvatar component
const UserAvatar: React.FC = () => {
  const { currentUser } = useAuth();
  return (
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
        <FaUserCircle className="w-8 h-8 text-yellow-600" />
      </div>
      <div>
        <p className="font-medium text-gray-900">
          {currentUser?.email?.split('@')[0]}
        </p>
        <p className="text-sm text-gray-500">Property Owner</p>
      </div>
    </div>
  );
};

// Add LogoutButton component
const LogoutButton: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center space-x-2 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg"
    >
      <FaSignOutAlt />
      <span>Log Out</span>
    </button>
  );
};

const OwnerNavigation: React.FC = () => {
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b">
          <UserAvatar />
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <NavItem to="/homes" icon={<FaHome />} label="My Listings" />
            <NavItem to="/add-listing" icon={<FaPlus />} label="Add Listing" />
            <NavItem to="/admin/listings" icon={<FaCog />} label="Manage Listings" />
            <NavItem to="/analytics" icon={<FaChartBar />} label="Analytics" />
          </ul>
        </nav>
        
        <div className="p-4 border-t">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
};

// Helper components
const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
  <li>
    <Link
      to={to}
      className="flex items-center space-x-3 p-3 rounded-lg text-gray-600 hover:bg-yellow-50 hover:text-yellow-600 transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </Link>
  </li>
);

export default OwnerNavigation;