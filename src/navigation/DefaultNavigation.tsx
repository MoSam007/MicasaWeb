// src/navigation/DefaultNavigation.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaSearch, FaInfoCircle, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../auth/authContext';
import Logo from '../images/MiCasa.png';

const DefaultNavigation: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src={Logo} alt="MiCasa" className="h-10 w-auto" />
              <span className="ml-2 text-xl font-bold text-yellow-600">MiCasa</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              <FaHome className="inline mr-1" />
              Home
            </Link>
            <Link to="/rent" className="text-gray-600 hover:text-gray-900">
              <FaSearch className="inline mr-1" />
              Rent
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-gray-900">
              <FaInfoCircle className="inline mr-1" />
              About
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <button
                onClick={handleSignOut}
                className="flex items-center text-yellow-600 hover:text-yellow-700 font-medium"
              >
                <FaSignOutAlt className="mr-1" />
                Sign Out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-yellow-600 text-white px-4 py-2 rounded-full hover:bg-yellow-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DefaultNavigation;