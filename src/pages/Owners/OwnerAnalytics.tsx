import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaHome,
  FaEye,
  FaDollarSign,
  FaUsers,
  FaChartLine,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const OwnerAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30days');

  // Mock data for analytics
  const viewsData = [
    { name: 'Jan', views: 450, inquiries: 23 },
    { name: 'Feb', views: 520, inquiries: 31 },
    { name: 'Mar', views: 680, inquiries: 42 },
    { name: 'Apr', views: 590, inquiries: 38 },
    { name: 'May', views: 720, inquiries: 47 },
    { name: 'Jun', views: 850, inquiries: 54 },
  ];

  const propertyPerformance = [
    { name: 'Sunset Villa', views: 1250, inquiries: 45, revenue: 8500 },
    { name: 'Downtown Loft', views: 980, inquiries: 38, revenue: 6200 },
    { name: 'Garden House', views: 750, inquiries: 29, revenue: 4800 },
    { name: 'Modern Condo', views: 650, inquiries: 22, revenue: 3900 },
  ];

  const locationData = [
    { name: 'Downtown', value: 35, color: '#f59e0b' },
    { name: 'Suburbs', value: 25, color: '#fbbf24' },
    { name: 'Waterfront', value: 20, color: '#fcd34d' },
    { name: 'Hills', value: 20, color: '#fde68a' },
  ];

  const stats = [
    {
      title: 'Total Properties',
      value: '12',
      change: '+2',
      icon: <FaHome />,
      color: 'bg-amber-500',
      trend: 'up'
    },
    {
      title: 'Monthly Views',
      value: '3,420',
      change: '+15%',
      icon: <FaEye />,
      color: 'bg-blue-500',
      trend: 'up'
    },
    {
      title: 'Total Revenue',
      value: '$23,400',
      change: '+8%',
      icon: <FaDollarSign />,
      color: 'bg-green-500',
      trend: 'up'
    },
    {
      title: 'Active Inquiries',
      value: '47',
      change: '-3',
      icon: <FaUsers />,
      color: 'bg-purple-500',
      trend: 'down'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <FaChartLine className="text-amber-600" />
              <span>Analytics Dashboard</span>
            </h1>
            <p className="text-gray-600 mt-2">Track your property performance and insights</p>
          </div>
          
          <div className="flex space-x-2">
            {['7days', '30days', '90days'].map((period) => (
              <motion.button
                key={period}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-amber-50'
                }`}
              >
                {period === '7days' ? '7 Days' : period === '30days' ? '30 Days' : '90 Days'}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trend === 'up' ? (
                      <FaArrowUp className="text-green-500 text-sm mr-1" />
                    ) : (
                      <FaArrowDown className="text-red-500 text-sm mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.color} text-white`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Views & Inquiries Chart */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Views & Inquiries</h3>
              <FaEye className="text-amber-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="inquiries" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Location Distribution */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Properties by Location</h3>
              <FaMapMarkerAlt className="text-amber-600" />
            </div>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={locationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {locationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {locationData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Property Performance Table */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <FaHome className="text-amber-600" />
              <span>Property Performance</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Property</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Views</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Inquiries</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Revenue</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Performance</th>
                </tr>
              </thead>
              <tbody>
                {propertyPerformance.map((property, index) => (
                  <motion.tr 
                    key={property.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{property.name}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{property.views.toLocaleString()}</td>
                    <td className="py-4 px-6 text-gray-600">{property.inquiries}</td>
                    <td className="py-4 px-6 text-gray-600">${property.revenue.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((property.views / 1500) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round((property.views / 1500) * 100)}%
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OwnerAnalytics;