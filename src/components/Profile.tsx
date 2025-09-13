import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/ClerkauthContext';
import { FaUser, FaEnvelope, FaHome, FaHeart, FaTruck, FaCog, FaBell, FaHistory } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface UserStats {
  wishlistCount: number;
  listingsCount: number;
  viewsCount: number;
}

const Profile: React.FC = () => {
  const { isSignedIn, userId, getToken } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'activity'>('overview');
  const [stats, setStats] = useState<UserStats>({
    wishlistCount: 0,
    listingsCount: 0,
    viewsCount: 0
  });

  useEffect(() => {
    // Fetch user stats
    const fetchStats = async () => {
      try {
        const token = await getToken({ template: 'micasa' });
        const response = await fetch(`http://127.0.0.1:8000/api/users/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    if (isSignedIn && userId) {
      fetchStats();
    }
  }, [isSignedIn, userId, getToken]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatsCard
                icon={<FaHeart className="text-red-500" />}
                title="Saved Properties"
                value={stats.wishlistCount}
              />
              <StatsCard
                icon={<FaHome className="text-blue-500" />}
                title="Listed Properties"
                value={stats.listingsCount}
              />
              <StatsCard
                icon={<FaHistory className="text-green-500" />}
                title="Profile Views"
                value={stats.viewsCount}
              />
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              {/* Add recent activity items here */}
            </div>
          </motion.div>
        );

      case 'settings':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
              {/* Add settings form here */}
            </div>
          </motion.div>
        );

      case 'activity':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Activity Log</h3>
              {/* Add activity log here */}
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-32"></div>
          <div className="px-8 py-6 -mt-16">
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <FaUser className="w-16 h-16 text-gray-400" />
              </div>
              <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900">
                  {userId?.split('@')[0] || 'User'}
                </h1>
                <p className="text-gray-600">{userId}</p>
                <p className="text-sm text-gray-500 capitalize mt-1">
                  Account
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-8">
          <nav className="flex space-x-4">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              icon={<FaUser />}
              label="Overview"
            />
            <TabButton
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
              icon={<FaCog />}
              label="Settings"
            />
            <TabButton
              active={activeTab === 'activity'}
              onClick={() => setActiveTab('activity')}
              icon={<FaBell />}
              label="Activity"
            />
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

// Helper Components
const StatsCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: number;
}> = ({ icon, title, value }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className="p-3 rounded-full bg-gray-100">{icon}</div>
      <div className="ml-4">
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
      active
        ? 'bg-yellow-100 text-yellow-700'
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default Profile;