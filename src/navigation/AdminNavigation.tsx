import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUsers, FaHome, FaTruck, FaChartBar, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../auth/ClerkauthContext';

const AdminNavigation: React.FC = () => {
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
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-yellow-500">MiCasa Admin</h1>
        <p className="text-sm text-gray-400">System Administration</p>
      </div>
      
      <nav className="mt-6">
        <ul className="space-y-2 px-4">
          <NavItem to="/admin/dashboard" icon={<FaChartBar />} label="Dashboard" />
          <NavItem to="/admin/users" icon={<FaUsers />} label="User Management" />
          <NavItem to="/admin/listings" icon={<FaHome />} label="Listings" />
          <NavItem to="/admin/movers" icon={<FaTruck />} label="Moving Services" />
          <NavItem to="/admin/settings" icon={<FaCog />} label="System Settings" />
        </ul>
      </nav>
      
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center text-gray-400 hover:text-white w-full py-2"
        >
          <FaSignOutAlt className="mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

// Helper component for nav items
const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
  <li>
    <Link
      to={to}
      className="flex items-center py-3 px-4 text-gray-400 hover:bg-gray-800 hover:text-white rounded transition-colors"
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </Link>
  </li>
);

export default AdminNavigation;