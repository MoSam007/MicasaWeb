import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/ClerkauthContext'; 
import { FaUserCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';

interface UserDropdownProps {
  theme?: 'light' | 'dark';
}

export const UserDropdown: React.FC<UserDropdownProps> = ({ theme = 'light' }) => {
  const { userEmail, logout } = useAuth(); 
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 p-2 rounded-full 
          ${theme === 'light' ? 'text-white hover:text-green-100' : 'text-gray-700 hover:text-gray-900'}
        `}
      >
        <FaUserCircle className="h-6 w-6" />
        <span className="text-sm font-medium">
          {userEmail?.split('@')[0]}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
          <Link
            to="/profile"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <FaUserCircle className="mr-3 h-5 w-5 text-gray-400" />
            Profile
          </Link>
          <Link
            to="/settings"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <FaCog className="mr-3 h-5 w-5 text-gray-400" />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            <FaSignOutAlt className="mr-3 h-5 w-5 text-red-500" />
            Log Out
          </button>
        </div>
      )}
    </div>
  );
};