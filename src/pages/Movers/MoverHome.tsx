// src/pages/MoverHome.tsx
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { FaTruck, FaCheckCircle, FaDollarSign, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import MoverLayout from '../../layouts/MoverLayout';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MoverHome: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Mock data for jobs
  const currentJobs = [
    { id: 1, client: 'Emma Johnson', address: '123 Pine St', date: '2025-05-18', status: 'Confirmed' },
    { id: 2, client: 'Michael Smith', address: '456 Oak Ave', date: '2025-05-20', status: 'Pending' },
    { id: 3, client: 'Sarah Williams', address: '789 Maple Rd', date: '2025-05-22', status: 'Confirmed' },
    { id: 4, client: 'David Brown', address: '101 Cedar Ln', date: '2025-05-25', status: 'Pending' },
  ];

  // Animated truck position
  const [truckPosition, setTruckPosition] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTruckPosition(prev => (prev >= 100 ? 0 : prev + 1));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Completed Jobs',
        data: [12, 19, 3, 5, 2, 3],
        fill: true,
        backgroundColor: isDarkMode ? 'rgba(75, 192, 192, 0.2)' : 'rgba(34, 197, 94, 0.2)',
        borderColor: isDarkMode ? 'rgb(75, 192, 192)' : 'rgb(34, 197, 94)',
        tension: 0.4,
      },
      {
        label: 'Revenue ($00s)',
        data: [8, 15, 2, 4, 1, 2],
        fill: true,
        backgroundColor: isDarkMode ? 'rgba(153, 102, 255, 0.2)' : 'rgba(59, 130, 246, 0.2)',
        borderColor: isDarkMode ? 'rgb(153, 102, 255)' : 'rgb(59, 130, 246)',
        tension: 0.4,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Performance',
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
      <div className={`py-8 px-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-6">Mover Dashboard</h1>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Current Orders', value: '5', icon: <FaTruck size={24} />, color: 'green' },
            { title: 'Completed Jobs', value: '23', icon: <FaCheckCircle size={24} />, color: 'blue' },
            { title: 'Total Earnings', value: '$2,450', icon: <FaDollarSign size={24} />, color: 'purple' },
            { title: 'Rating', value: '4.8', icon: <FaStar size={24} />, color: 'yellow' }
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

        {/* Moving Truck Animation */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`relative h-12 mb-8 rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}
        >
          <div className="absolute top-0 left-0 h-full w-full flex items-center px-4">
            <div className="w-full h-2 rounded-full bg-gray-300 dark:bg-gray-700 relative">
              <div 
                className={`absolute h-2 rounded-full bg-gradient-to-r ${
                  isDarkMode ? 'from-blue-500 to-green-500' : 'from-green-400 to-blue-500'
                }`} 
                style={{ width: `${truckPosition}%` }}
              ></div>
            </div>
          </div>
          <motion.div 
            className="absolute top-0 h-full"
            style={{ left: `${truckPosition}%` }}
          >
            <FaTruck className={isDarkMode ? 'text-white' : 'text-green-600'} size={32} />
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`lg:col-span-2 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}
          >
            <h2 className="text-xl font-semibold mb-4">Performance Overview</h2>
            <div className="h-[300px] w-full">
              <Line data={chartData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Current Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}
          >
            <h2 className="text-xl font-semibold mb-4">Upcoming Jobs</h2>
            <div className="space-y-4">
              {currentJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (index * 0.1) }}
                  className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} flex items-center justify-between`}
                >
                  <div>
                    <p className="font-medium">{job.client}</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{job.address}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{job.date}</p>
                  </div>
                  <span className={`px-2 py-1 rounded ${
                    job.status === 'Confirmed' 
                      ? (isDarkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800')
                      : (isDarkMode ? 'bg-yellow-800 text-yellow-200' : 'bg-yellow-100 text-yellow-800')
                  } text-xs font-medium`}>
                    {job.status}
                  </span>
                </motion.div>
              ))}
            </div>
            <button className={`mt-4 w-full py-2 rounded-lg ${
              isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-500 hover:bg-green-600'
            } text-white font-medium transition-colors`}>
              View All Jobs
            </button>
          </motion.div>
        </div>
      </div>
    </MoverLayout>
  );
};

export default MoverHome;