import React, { useState, useEffect } from 'react';
import MoverSidebar from '../navigation/MoverSidebar';

const MoverDashboardWrapper: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('mover-theme');
    return savedTheme === 'dark';
  });

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('mover-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <MoverSidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <div className={`lg:ml-64 p-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Available Homes</h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Browse available homes that may need moving services
            </p>
          </div>
          
          {/* Placeholder content - replace with your actual dashboard content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className="text-lg font-semibold mb-2">Recent Listings</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                View recently added properties that might need moving services
              </p>
            </div>
            <div className={`p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className="text-lg font-semibold mb-2">Service Requests</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Check pending service requests from property owners
              </p>
            </div>
            <div className={`p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className="text-lg font-semibold mb-2">Your Stats</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                View your performance metrics and earnings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoverDashboardWrapper;