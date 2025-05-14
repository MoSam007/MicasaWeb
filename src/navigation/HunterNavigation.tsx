import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaHeart, FaQuestionCircle } from 'react-icons/fa';
import { UserDropdown } from './UserDropdown'; // We'll create this shared component

const HunterNavigation: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-yellow-600 hover:text-yellow-700 font-medium">
              <FaHome className="inline mr-2" />
              Listings
            </Link>
            <Link to="/wishlist" className="text-gray-600 hover:text-gray-900 font-medium">
              <FaHeart className="inline mr-2" />
              Wishlist
            </Link>
            <Link to="/faq" className="text-gray-600 hover:text-gray-900 font-medium">
              <FaQuestionCircle className="inline mr-2" />
              List Your Home
            </Link>
          </div>
          <UserDropdown />
        </div>
      </div>
    </nav>
  );
};

export default HunterNavigation;