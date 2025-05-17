import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';
import { FaTruck, FaChartLine, FaMapMarkerAlt, FaDollarSign, FaUserFriends, FaStar, FaCalendarAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import MoverLayout from '../../layouts/MoverLayout';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MoverAnalytics: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('6months');
  const [activeTab, setActiveTab] = useState('overview');
  const [truckPosition, setTruckPosition] = useState({ lat: 47.6062, lng: -122.3321 });
  const [truckAnimationProgress, setTruckAnimationProgress] = useState(0);
  const [truckPath, setTruckPath] = useState<{ lat: number; lng: number }[]>([]);
  
  // Map viewport state
  const [viewport, setViewport] = useState({
    latitude: 47.6062,
    longitude: -122.3321,
    zoom: 12,
    bearing: 0,
    pitch: 0
  });
  
  // Animated map route simulation effect
  useEffect(() => {
    // Start with the initial position
    if (truckPath.length === 0) {
      setTruckPath([truckPosition]);
    }
    
    const interval = setInterval(() => {
      setTruckAnimationProgress(prev => {
        if (prev >= 100) return 0;
        return prev + 0.2;
      });
      
      // Simulate movement along a route
      setTruckPosition(prev => {
        const newLat = prev.lat + Math.sin(truckAnimationProgress / 10) * 0.0002;
        const newLng = prev.lng + Math.cos(truckAnimationProgress / 10) * 0.0002;
        
        // Add point to path if it's different enough from the last point
        if (truckPath.length === 0 || 
            Math.abs(truckPath[truckPath.length - 1].lat - newLat) > 0.0001 ||
            Math.abs(truckPath[truckPath.length - 1].lng - newLng) > 0.0001) {
          setTruckPath(prevPath => [...prevPath, { lat: newLat, lng: newLng }]);
        }
        
        return { lat: newLat, lng: newLng };
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [truckAnimationProgress, truckPath.length]);

  // Create the route GeoJSON data
  const routeGeoJSON = {
    type: 'Feature' as const,
    geometry: {
      type: 'LineString' as const,
      coordinates: truckPath.map(point => [point.lng, point.lat]),
    },
    properties: {},
  };

  // Prepare data based on selected time range
  const prepareData = (range: string) => {
    // Different data sets based on time range selection
    switch(range) {
      case '30days':
        return {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          earnings: [1200, 1450, 980, 1300],
          jobs: [5, 6, 4, 5],
          distance: [85, 102, 65, 89],
          customerRatings: [4.7, 4.8, 4.6, 4.9]
        };
      case '3months':
        return {
          labels: ['Jan', 'Feb', 'Mar'],
          earnings: [3800, 4200, 3950],
          jobs: [18, 20, 19],
          distance: [280, 310, 295],
          customerRatings: [4.5, 4.7, 4.8]
        };
      case '6months':
      default:
        return {
          labels: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
          earnings: [3500, 3800, 4200, 3950, 4150, 4600],
          jobs: [16, 18, 20, 19, 20, 22],
          distance: [260, 280, 310, 295, 305, 325],
          customerRatings: [4.4, 4.5, 4.7, 4.8, 4.7, 4.9]
        };
      case '1year':
        return {
          labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
          earnings: [2800, 3100, 3300, 3200, 3400, 3450, 3500, 3800, 4200, 3950, 4150, 4600],
          jobs: [14, 15, 16, 15, 16, 17, 16, 18, 20, 19, 20, 22],
          distance: [210, 230, 245, 240, 250, 255, 260, 280, 310, 295, 305, 325],
          customerRatings: [4.2, 4.3, 4.3, 4.4, 4.4, 4.3, 4.4, 4.5, 4.7, 4.8, 4.7, 4.9]
        };
    }
  };
  
  const data = prepareData(selectedTimeRange);
  
  // Recent jobs data
  const recentJobs = [
    { 
      id: 1,
      client: 'Emma Johnson',
      address: '123 Pine St, Seattle',
      date: '2025-05-14',
      status: 'Completed',
      earnings: '$380',
      distance: '14 miles',
      rating: 5
    },
    { 
      id: 2,
      client: 'Michael Smith',
      address: '456 Oak Ave, Bellevue',
      date: '2025-05-12',
      status: 'Completed',
      earnings: '$290',
      distance: '8 miles',
      rating: 4
    },
    { 
      id: 3,
      client: 'Sarah Williams',
      address: '789 Maple Rd, Redmond',
      date: '2025-05-10',
      status: 'Completed',
      earnings: '$420',
      distance: '15 miles',
      rating: 5
    }
  ];
  
  // Prepare chart data
  const lineChartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Earnings ($)',
        data: data.earnings,
        fill: true,
        backgroundColor: isDarkMode ? 'rgba(75, 192, 192, 0.2)' : 'rgba(34, 197, 94, 0.2)',
        borderColor: isDarkMode ? 'rgb(75, 192, 192)' : 'rgb(34, 197, 94)',
        tension: 0.4,
      }
    ],
  };
  
  const barChartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Jobs Completed',
        data: data.jobs,
        backgroundColor: isDarkMode ? 'rgba(54, 162, 235, 0.8)' : 'rgba(59, 130, 246, 0.8)',
      }
    ],
  };
  
  const serviceTypeData = {
    labels: ['Local Moving', 'Long Distance', 'Furniture Only', 'Packing', 'Storage'],
    datasets: [
      {
        label: 'Service Distribution',
        data: [45, 20, 15, 12, 8],
        backgroundColor: [
          isDarkMode ? 'rgba(75, 192, 192, 0.8)' : 'rgba(34, 197, 94, 0.8)',
          isDarkMode ? 'rgba(54, 162, 235, 0.8)' : 'rgba(59, 130, 246, 0.8)',
          isDarkMode ? 'rgba(153, 102, 255, 0.8)' : 'rgba(139, 92, 246, 0.8)',
          isDarkMode ? 'rgba(255, 159, 64, 0.8)' : 'rgba(249, 115, 22, 0.8)',
          isDarkMode ? 'rgba(255, 99, 132, 0.8)' : 'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: isDarkMode ? 'rgba(30, 30, 30, 1)' : 'rgba(255, 255, 255, 1)',
        borderWidth: 2,
      }
    ],
  };
  
  const performanceData = {
    labels: ['On-Time Arrival', 'Handling Care', 'Customer Service', 'Efficiency', 'Price Value', 'Cleanliness'],
    datasets: [
      {
        label: 'Your Score',
        data: [9.2, 8.9, 9.5, 8.8, 8.5, 9.1],
        backgroundColor: isDarkMode ? 'rgba(54, 162, 235, 0.2)' : 'rgba(59, 130, 246, 0.2)',
        borderColor: isDarkMode ? 'rgb(54, 162, 235)' : 'rgb(59, 130, 246)',
        pointBackgroundColor: isDarkMode ? 'rgb(54, 162, 235)' : 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: isDarkMode ? 'rgb(54, 162, 235)' : 'rgb(59, 130, 246)',
      },
      {
        label: 'Industry Average',
        data: [8.0, 7.8, 8.0, 7.9, 7.5, 8.2],
        backgroundColor: isDarkMode ? 'rgba(255, 99, 132, 0.2)' : 'rgba(239, 68, 68, 0.2)',
        borderColor: isDarkMode ? 'rgb(255, 99, 132)' : 'rgb(239, 68, 68)',
        pointBackgroundColor: isDarkMode ? 'rgb(255, 99, 132)' : 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: isDarkMode ? 'rgb(255, 99, 132)' : 'rgb(239, 68, 68)',
      }
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
        text: 'Earnings Over Time',
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
  
  const barChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        ...chartOptions.plugins.title,
        text: 'Jobs Completed',
      },
    },
  };
  
  const radarOptions = {
    responsive: true,
    scales: {
      r: {
        angleLines: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
        },
        pointLabels: {
          color: isDarkMode ? '#fff' : '#333',
        },
        ticks: {
          backdropColor: 'transparent',
          color: isDarkMode ? '#fff' : '#333',
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDarkMode ? '#fff' : '#333',
        }
      },
      title: {
        display: true,
        text: 'Performance Metrics',
        color: isDarkMode ? '#fff' : '#333',
      },
    },
  };
  
  const doughnutOptions = {
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
        text: 'Service Types',
        color: isDarkMode ? '#fff' : '#333',
      },
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
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Track your performance and business metrics
              </p>
            
            {/* Time range selector */}
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              {['30days', '3months', '6months', '1year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedTimeRange === range
                      ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-green-500 text-white')
                      : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300')
                  }`}
                >
                  {range === '30days' ? 'Last 30 Days' : 
                   range === '3months' ? 'Last 3 Months' : 
                   range === '6months' ? 'Last 6 Months' : 'Last Year'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className={`flex overflow-x-auto pb-2 mb-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            {[
              { id: 'overview', label: 'Overview', icon: <FaChartLine /> },
              { id: 'livejobs', label: 'Live Tracking', icon: <FaMapMarkerAlt /> },
              { id: 'finance', label: 'Financial', icon: <FaDollarSign /> },
              { id: 'customers', label: 'Customers', icon: <FaUserFriends /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? (isDarkMode ? 'text-blue-400 border-b-2 border-blue-400' : 'text-green-600 border-b-2 border-green-500')
                    : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800')
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          
          {/* Overview Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[
                    { 
                      title: 'Total Jobs', 
                      value: data.jobs.reduce((a, b) => a + b, 0), 
                      trend: '+8% from previous period',
                      icon: <FaTruck size={24} />,
                      color: 'green'
                    },
                    { 
                      title: 'Revenue', 
                      value: `$${data.earnings.reduce((a, b) => a + b, 0).toLocaleString()}`, 
                      trend: '+12% from previous period',
                      icon: <FaDollarSign size={24} />,
                      color: 'blue'
                    },
                    { 
                      title: 'Avg Rating', 
                      value: '4.8', 
                      trend: '+0.2 from previous period',
                      icon: <FaStar size={24} />,
                      color: 'yellow'
                    },
                    { 
                      title: 'Distance Covered', 
                      value: `${data.distance.reduce((a, b) => a + b, 0)} mi`, 
                      trend: '+5% from previous period',
                      icon: <FaMapMarkerAlt size={24} />,
                      color: 'purple'
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
                    <h2 className="text-xl font-semibold mb-4">Revenue Trends</h2>
                    <div className="h-[300px]">
                      <Line data={lineChartData} options={chartOptions} />
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={`rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}
                  >
                    <h2 className="text-xl font-semibold mb-4">Job Completion</h2>
                    <div className="h-[300px]">
                      <Bar data={barChartData} options={barChartOptions} />
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className={`rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}
                  >
                    <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
                    <div className="h-[300px]">
                      <Radar data={performanceData} options={radarOptions} />
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className={`rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}
                  >
                    <h2 className="text-xl font-semibold mb-4">Service Distribution</h2>
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="w-3/4">
                        <Doughnut data={serviceTypeData} options={doughnutOptions} />
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                {/* Recent Jobs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className={`rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 mb-8`}
                >
                  <h2 className="text-xl font-semibold mb-4">Recent Jobs</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Client</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Address</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Earnings</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Distance</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Rating</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {recentJobs.map((job, index) => (
                          <motion.tr
                            key={job.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 * index }}
                            className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium">{job.client}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">{job.address}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">{job.date}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {job.earnings}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {job.distance}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar 
                                    key={i}
                                    className={i < job.rating ? 'text-yellow-400' : 'text-gray-300'} 
                                    size={16} 
                                  />
                                ))}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </motion.div>
            )}
            
            {/* Live Tracking Tab */}
            {activeTab === 'livejobs' && (
              <motion.div
                key="livejobs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Map Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`lg:col-span-2 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 relative overflow-hidden`}
                  >
                    <h2 className="text-xl font-semibold mb-4">Live Job Tracking</h2>
                    <div className="h-[500px] rounded-lg overflow-hidden relative">
                      <Map
                        {...viewport}
                        onMove={evt => setViewport(evt.viewState)}
                        style={{ width: '100%', height: '100%' }}
                        mapStyle={isDarkMode 
                          ? 'mapbox://styles/mapbox/dark-v11' 
                          : 'mapbox://styles/mapbox/light-v11'}
                        mapboxAccessToken="pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2xleGFtcGxlIjoiZXhhbXBsZWtleSJ9.exampletoken"
                      >
                       {/* Route line */}
                      {truckPath.length > 1 && (
                        <Source id="routeSource" type="geojson" data={routeGeoJSON}>
                          <Layer
                            id="routeLine"
                            type="line"
                            source="routeSource"
                            layout={{
                              "line-join": "round",
                              "line-cap": "round"
                            }}
                            paint={{
                              "line-color": isDarkMode ? "#4dabf7" : "#3b82f6",
                              "line-width": 4,
                              "line-opacity": 0.8
                            }}
                          />
                        </Source>
                      )}

                      {/* Truck marker */}
                      <Marker
                        longitude={truckPosition.lng}
                        latitude={truckPosition.lat}
                      >
                        <div className={`p-2 rounded-full bg-opacity-90 ${isDarkMode ? 'bg-blue-500' : 'bg-green-500'}`}>
                          <FaTruck size={20} className="text-white" />
                        </div>
                      </Marker>
                      </Map>
                      </div>
                      </motion.div>

                      {/* Active Jobs Stats */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={`rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}
                      >
                        <h2 className="text-xl font-semibold mb-4">Active Job</h2>
                        <div className={`mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <div className="flex items-center mb-2">
                            <FaCalendarAlt className={isDarkMode ? 'text-blue-400' : 'text-green-500'} />
                            <span className="ml-2 font-medium">Today, 2:30 PM</span>
                          </div>
                          <h3 className="font-semibold text-lg">Emma Johnson</h3>
                          <p className={`mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Moving from: 123 Pine St, Seattle
                          </p>
                          <p className={`mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Moving to: 567 Cedar Blvd, Bellevue
                          </p>
                          <div className="w-full bg-gray-300 rounded-full h-2 mb-1">
                            <div 
                              className={`${isDarkMode ? 'bg-blue-500' : 'bg-green-500'} h-2 rounded-full`} 
                              style={{ width: `${truckAnimationProgress}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Start</span>
                            <span>{Math.round(truckAnimationProgress)}% Complete</span>
                            <span>End</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex justify-between items-center`}>
                            <div>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Estimated Arrival</p>
                              <p className="font-medium">3:15 PM</p>
                            </div>
                            <div className={`p-2 rounded-full ${isDarkMode ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                              <FaTruck size={20} />
                            </div>
                          </div>
                          
                          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex justify-between items-center`}>
                            <div>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Distance Remaining</p>
                              <p className="font-medium">3.8 miles</p>
                            </div>
                            <div className={`p-2 rounded-full ${isDarkMode ? 'bg-purple-100 text-purple-600' : 'bg-purple-100 text-purple-600'}`}>
                              <FaMapMarkerAlt size={20} />
                            </div>
                          </div>
                          
                          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex justify-between items-center`}>
                            <div>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Estimated Earnings</p>
                              <p className="font-medium">$380</p>
                            </div>
                            <div className={`p-2 rounded-full ${isDarkMode ? 'bg-yellow-100 text-yellow-600' : 'bg-yellow-100 text-yellow-600'}`}>
                              <FaDollarSign size={20} />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                      </div>
                      </motion.div>
                      )}

                      {/* Financial Tab Content */}
                      {activeTab === 'finance' && (
                        <motion.div
                          key="finance"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5 }}
                              className={`rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}
                            >
                              <h2 className="text-xl font-semibold mb-4">Earnings Overview</h2>
                              <div className="h-[300px]">
                                <Line data={lineChartData} options={chartOptions} />
                              </div>
                            </motion.div>
                            
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.1 }}
                              className={`rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}
                            >
                              <h2 className="text-xl font-semibold mb-4">Revenue by Service Type</h2>
                              <div className="h-[300px]">
                                <Doughnut data={serviceTypeData} options={doughnutOptions} />
                              </div>
                            </motion.div>
                          </div>
                          
                          {/* Finance Stats and Monthly Report */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                              className={`lg:col-span-2 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}
                            >
                              <h2 className="text-xl font-semibold mb-4">Monthly Financial Summary</h2>
                              <div className="overflow-x-auto">
                                <table className="min-w-full">
                                  <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                                    <tr>
                                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Month</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Revenue</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Expenses</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Net Income</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Growth</th>
                                    </tr>
                                  </thead>
                                  <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                    {['May', 'April', 'March', 'February', 'January'].map((month, index) => (
                                      <tr key={month} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">{month}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">${(4600 - index * 200).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">${(1800 - index * 50).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                                          ${(2800 - index * 150).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                          <span className={`px-2 py-1 text-xs rounded-full ${
                                            index === 0 ? 'bg-green-100 text-green-800' : 
                                            index === 4 ? 'bg-red-100 text-red-800' : 
                                            'bg-blue-100 text-blue-800'
                                          }`}>
                                            {index === 0 ? '+12%' : index === 4 ? '-3%' : `+${8 - index}%`}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              </motion.div>
                            
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className={`rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}
                              >
                              <h2 className="text-xl font-semibold mb-4">Finance Stats</h2>
                              <div className="space-y-4">
                                {[
                                  { title: 'Average Job Value', value: '$320', change: '+5%' },
                                  { title: 'Monthly Recurring Revenue', value: '$4,600', change: '+12%' },
                                  { title: 'Profit Margin', value: '62%', change: '+3%' },
                                  { title: 'Outstanding Invoices', value: '$840', change: '-15%' },
                                ].map((stat) => (
                                  <div key={stat.title} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{stat.title}</p>
                                    <div className="flex justify-between items-center mt-1">
                                      <p className="text-xl font-bold">{stat.value}</p>
                                      <span className={`px-2 py-1 text-xs rounded-full ${
                                        stat.change.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                      }`}>
                                        {stat.change}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>
                      )}

                      {/* Customers Tab Content */}
                      {activeTab === 'customers' && (
                        <motion.div
                          key="customers"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5 }}
                              className={`lg:col-span-2 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}
                            >
                              <h2 className="text-xl font-semibold mb-4">Customer Satisfaction</h2>
                              <div className="h-[300px]">
                                <Radar data={performanceData} options={radarOptions} />
                              </div>
                            </motion.div>
                            
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.1 }}
                              className={`rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}
                            >
                              <h2 className="text-xl font-semibold mb-4">Customer Stats</h2>
                              <div className="space-y-4">
                                {[
                                  { title: 'Total Customers', value: '124', iconColor: 'text-blue-500' },
                                  { title: 'Average Rating', value: '4.8/5', iconColor: 'text-yellow-500' },
                                  { title: 'Repeat Customers', value: '68%', iconColor: 'text-green-500' },
                                  { title: 'Referrals', value: '42', iconColor: 'text-purple-500' },
                                ].map((stat, index) => (
                                  <div key={index} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{stat.title}</p>
                                        <p className="text-xl font-bold mt-1">{stat.value}</p>
                                      </div>
                                      <div className={`p-3 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-white'}`}>
                                        <FaUserFriends className={stat.iconColor} size={20} />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          </div>
                          
                          {/* Customer Reviews */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className={`rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 mb-8`}
                          >
                            <h2 className="text-xl font-semibold mb-4">Recent Reviews</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {[
                                { 
                                  name: 'Emma Johnson', 
                                  date: '2 days ago', 
                                  rating: 5,
                                  comment: 'The movers were extremely professional and careful with my belongings. Everything arrived in perfect condition!'
                                },
                                { 
                                  name: 'Michael Smith', 
                                  date: '5 days ago', 
                                  rating: 4,
                                  comment: 'Good service overall. They were a little late but made up for it with efficient work.'
                                },
                                { 
                                  name: 'Sarah Williams', 
                                  date: '1 week ago', 
                                  rating: 5,
                                  comment: 'Best moving service I\'ve ever used! They made what is usually a stressful day completely smooth.'
                                },
                              ].map((review, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.1 * index }}
                                  className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h3 className="font-medium">{review.name}</h3>
                                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{review.date}</p>
                                    </div>
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <FaStar 
                                          key={i}
                                          className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'} 
                                          size={16} 
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{review.comment}</p>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
            </AnimatePresence>
          </div>
</motion.div>
</div>
</MoverLayout>
);
};

export default MoverAnalytics;