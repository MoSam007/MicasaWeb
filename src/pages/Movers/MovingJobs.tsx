// src/pages/MovingJobs.tsx
import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { FaTruck, FaCalendarAlt, FaMoneyBillWave, FaClock, FaFilter, FaSearch, FaSortAmountDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import MoverLayout from '../../layouts/MoverLayout';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Define job type for TypeScript
interface Job {
  id: number;
  client: string;
  address: string;
  date: string;
  status: string;
  distance: string;
  earnings: string;
  duration: string;
  weight: string;
  imageUrl: string;
}

const MovingJobs: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  
  // Mock data for jobs
  const allJobs: Job[] = [
    { 
      id: 1, 
      client: 'Emma Johnson', 
      address: '123 Pine St, Seattle, WA', 
      date: '2025-05-18', 
      status: 'Upcoming', 
      distance: '12 miles',
      earnings: '$350',
      duration: '4 hours',
      weight: '500 lbs',
      imageUrl: '/api/placeholder/60/60'
    },
    { 
      id: 2, 
      client: 'Michael Smith', 
      address: '456 Oak Ave, Bellevue, WA', 
      date: '2025-05-20', 
      status: 'Upcoming', 
      distance: '8 miles',
      earnings: '$280',
      duration: '3 hours',
      weight: '350 lbs',
      imageUrl: '/api/placeholder/60/60'
    },
    { 
      id: 3, 
      client: 'Sarah Williams', 
      address: '789 Maple Rd, Redmond, WA', 
      date: '2025-05-10', 
      status: 'Completed', 
      distance: '15 miles',
      earnings: '$420',
      duration: '5 hours',
      weight: '650 lbs',
      imageUrl: '/api/placeholder/60/60'
    },
    { 
      id: 4, 
      client: 'David Brown', 
      address: '101 Cedar Ln, Kirkland, WA', 
      date: '2025-05-08', 
      status: 'Completed', 
      distance: '6 miles',
      earnings: '$180',
      duration: '2 hours',
      weight: '200 lbs',
      imageUrl: '/api/placeholder/60/60'
    },
    { 
      id: 5, 
      client: 'Jessica Taylor', 
      address: '202 Birch St, Renton, WA', 
      date: '2025-05-05', 
      status: 'Completed', 
      distance: '18 miles',
      earnings: '$480',
      duration: '6 hours',
      weight: '800 lbs',
      imageUrl: '/api/placeholder/60/60'
    },
    { 
      id: 6, 
      client: 'Robert Miller', 
      address: '303 Elm Blvd, Issaquah, WA', 
      date: '2025-05-22', 
      status: 'Upcoming', 
      distance: '14 miles',
      earnings: '$380',
      duration: '4.5 hours',
      weight: '550 lbs',
      imageUrl: '/api/placeholder/60/60'
    },
    { 
      id: 7, 
      client: 'Jennifer Garcia', 
      address: '404 Spruce Way, Sammamish, WA', 
      date: '2025-04-30', 
      status: 'Completed', 
      distance: '20 miles',
      earnings: '$520',
      duration: '7 hours',
      weight: '950 lbs',
      imageUrl: '/api/placeholder/60/60'
    },
    { 
      id: 8, 
      client: 'William Davis', 
      address: '505 Walnut Rd, Bothell, WA', 
      date: '2025-05-15', 
      status: 'Cancelled', 
      distance: '10 miles',
      earnings: '$0',
      duration: '0 hours',
      weight: '400 lbs',
      imageUrl: '/api/placeholder/60/60'
    },
  ];

  // Filter jobs based on selected filter and search term
  const getFilteredJobs = () => {
    let filtered = [...allJobs];
    
    if (filter !== 'all') {
      filtered = filtered.filter(job => job.status.toLowerCase() === filter.toLowerCase());
    }
    
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
        job.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort jobs
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'earnings':
          return parseInt(b.earnings.replace(/[^0-9]/g, '')) - parseInt(a.earnings.replace(/[^0-9]/g, ''));
        case 'distance':
          return parseInt(b.distance.split(' ')[0]) - parseInt(a.distance.split(' ')[0]);
        default:
          return 0;
      }
    });
    
    return filtered;
  };
  
  const filteredJobs = getFilteredJobs();
  
  // Calculate analytics data
  const totalCompletedJobs = allJobs.filter(job => job.status === 'Completed').length;
  const totalUpcomingJobs = allJobs.filter(job => job.status === 'Upcoming').length;
  const totalCancelledJobs = allJobs.filter(job => job.status === 'Cancelled').length;
  
  const totalEarnings = allJobs
    .filter(job => job.status === 'Completed')
    .reduce((sum, job) => sum + parseInt(job.earnings.replace(/[^0-9]/g, '')), 0);
  
  const averageJobDistance = Math.round(
    allJobs
      .filter(job => job.status === 'Completed')
      .reduce((sum, job) => sum + parseInt(job.distance.split(' ')[0]), 0) / 
    (totalCompletedJobs || 1)
  );
  
  // Prepare chart data
  const jobStatusData = {
    labels: ['Completed', 'Upcoming', 'Cancelled'],
    datasets: [
      {
        data: [totalCompletedJobs, totalUpcomingJobs, totalCancelledJobs],
        backgroundColor: [
          isDarkMode ? 'rgba(75, 192, 192, 0.8)' : 'rgba(34, 197, 94, 0.8)',
          isDarkMode ? 'rgba(54, 162, 235, 0.8)' : 'rgba(59, 130, 246, 0.8)',
          isDarkMode ? 'rgba(255, 99, 132, 0.8)' : 'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          isDarkMode ? 'rgba(75, 192, 192, 1)' : 'rgba(34, 197, 94, 1)',
          isDarkMode ? 'rgba(54, 162, 235, 1)' : 'rgba(59, 130, 246, 1)',
          isDarkMode ? 'rgba(255, 99, 132, 1)' : 'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Monthly earnings data
  const monthlyEarningsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Monthly Earnings ($)',
        data: [1200, 1500, 2000, 1800, totalEarnings/100],
        backgroundColor: isDarkMode ? 'rgba(75, 192, 192, 0.8)' : 'rgba(34, 197, 94, 0.8)',
        borderColor: isDarkMode ? 'rgba(75, 192, 192, 1)' : 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDarkMode ? '#fff' : '#333',
        }
      },
      title: {
        display: true,
        text: 'Jobs by Status',
        color: isDarkMode ? '#fff' : '#333',
      },
    },
  };
  
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDarkMode ? '#fff' : '#333',
        }
      },
      title: {
        display: true,
        text: 'Monthly Earnings',
        color: isDarkMode ? '#fff' : '#333',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDarkMode ? '#fff' : '#333',
        }
      },
      x: {
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDarkMode ? '#fff' : '#333',
        }
      }
    },
  };
  
  return (
    <MoverLayout isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)}>
      <div className={`py-8 px-4 min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Moving Jobs</h1>
              <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Manage and track your moving assignments
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button className={`px-4 py-2 rounded-lg ${
                isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-500 hover:bg-green-600'
              } text-white font-medium transition-colors flex items-center space-x-2`}>
                <FaCalendarAlt />
                <span>Schedule New Job</span>
              </button>
            </div>
          </div>

          {/* Analytics Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { 
                title: 'Completed Jobs', 
                value: totalCompletedJobs, 
                icon: <FaTruck size={24} />, 
                color: 'green',
                trend: '+5% from last month'
              },
              { 
                title: 'Total Earnings', 
                value: `$${totalEarnings}`, 
                icon: <FaMoneyBillWave size={24} />, 
                color: 'blue',
                trend: '+12% from last month'
              },
              { 
                title: 'Avg. Distance', 
                value: `${averageJobDistance} miles`, 
                icon: <FaClock size={24} />, 
                color: 'purple',
                trend: '-3% from last month'
              },
              { 
                title: 'Upcoming Jobs', 
                value: totalUpcomingJobs, 
                icon: <FaCalendarAlt size={24} />, 
                color: 'yellow',
                trend: 'Next: May 18'
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative overflow-hidden rounded-xl shadow-lg ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } p-6`}
              >
                <div className="flex justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{stat.title}</p>
                    <p className={`text-3xl font-bold mt-1 ${
                      stat.color === 'green' ? 'text-green-500' :
                      stat.color === 'blue' ? 'text-blue-500' :
                      stat.color === 'purple' ? 'text-purple-500' :
                      'text-yellow-500'
                    }`}>{stat.value}</p>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.trend}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    stat.color === 'green' ? 'bg-green-100 text-green-600' :
                    stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 opacity-10">
                  {stat.icon && React.cloneElement(stat.icon, { size: 80 })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}
            >
              <h2 className="text-xl font-semibold mb-4">Job Status Distribution</h2>
              <div className="w-full h-64 flex items-center justify-center">
                <Pie data={jobStatusData} options={chartOptions} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}
            >
              <h2 className="text-xl font-semibold mb-4">Monthly Earnings ($)</h2>
              <div className="w-full h-64">
                <Bar data={monthlyEarningsData} options={barChartOptions} />
              </div>
            </motion.div>
          </div>

          {/* Jobs List Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 mb-8`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <h2 className="text-xl font-semibold">Job List</h2>
              
              <div className="mt-4 lg:mt-0 flex flex-col md:flex-row gap-4">
                {/* Search input */}
                <div className={`relative rounded-lg overflow-hidden border ${
                  isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-300 bg-white'
                }`}>
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 ${
                      isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-800 placeholder-gray-500'
                    } focus:outline-none`}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <FaSearch className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                  </div>
                </div>
                
                {/* Filter dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100 border border-gray-300'
                    } transition-colors`}
                  >
                    <FaFilter />
                    <span>Filter: {filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
                  </button>
                  
                  <AnimatePresence>
                    {isFilterMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg ${
                          isDarkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'
                        }`}
                      >
                        <div className="py-1">
                          {['all', 'upcoming', 'completed', 'cancelled'].map((option) => (
                            <button
                              key={option}
                              onClick={() => {
                                setFilter(option);
                                setIsFilterMenuOpen(false);
                              }}
                              className={`block w-full text-left px-4 py-2 text-sm ${
                                filter === option 
                                  ? (isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900')
                                  : (isDarkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-50')
                              }`}
                            >
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Sort dropdown */}
                <div className="relative">
                  <button
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100 border border-gray-300'
                    } transition-colors`}
                    onClick={() => {
                      // Cycle through sort options
                      if (sortBy === 'date') setSortBy('earnings');
                      else if (sortBy === 'earnings') setSortBy('distance');
                      else setSortBy('date');
                    }}
                  >
                    <FaSortAmountDown />
                    <span>Sort by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Jobs list */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Distance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Earnings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map((job, index) => (
                      <motion.tr
                        key={job.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 * index }}
                        className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-full" src={job.imageUrl} alt="" />
                            </div>
                            <div className="ml-4">
                              <div className="font-medium">{job.client}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">{job.address}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">{job.date}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {job.distance}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {job.earnings}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            job.status === 'Completed' 
                              ? (isDarkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800')
                              : job.status === 'Upcoming'
                                ? (isDarkMode ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800')
                                : (isDarkMode ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-800')
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className={`px-3 py-1 rounded ${
                            isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-500 hover:bg-green-600'
                          } text-white`}>
                            Details
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <FaTruck size={48} className={isDarkMode ? 'text-gray-600' : 'text-gray-400'} />
                          <p className="mt-4 text-lg font-medium">No jobs found</p>
                          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                            Try adjusting your filters or search
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination controls */}
            <div className="flex items-center justify-between mt-6">
              <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Showing {filteredJobs.length} of {allJobs.length} jobs
              </div>
              <div className="flex space-x-2">
                <button className={`px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100 border border-gray-300'
                } transition-colors`}>
                  Previous
                </button>
                <button className={`px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-500 hover:bg-green-600'
                } text-white`}>
                  Next
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </MoverLayout>
  );
};

export default MovingJobs;