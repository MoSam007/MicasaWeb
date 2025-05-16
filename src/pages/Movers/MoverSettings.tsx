import React, { useState, useContext } from 'react';
import { 
  FaCog, FaUserCircle, FaBell, FaShieldAlt, FaLock, FaLanguage, 
  FaPalette, FaSun, FaMoon, FaSave, 
  FaChevronRight
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';
import MoverLayout from '../../layouts/MoverLayout';

// Tab interface
interface SettingsTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const MoverSettings: React.FC = () => {
  // Theme context
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  
  const [activeTab, setActiveTab] = useState('appearance');
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [language, setLanguage] = useState('english');
  const [primaryColor, setPrimaryColor] = useState('#4F46E5');
  const [accentColor, setAccentColor] = useState('#10B981');
  const [radius, setRadius] = useState('md');
  const [saveAnimation, setSaveAnimation] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Settings tabs
  const tabs: SettingsTab[] = [
    { id: 'appearance', label: 'Appearance', icon: <FaPalette size={20} /> },
    { id: 'language', label: 'Language', icon: <FaLanguage size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell size={20} /> },
    { id: 'security', label: 'Security', icon: <FaShieldAlt size={20} /> },
    { id: 'profile', label: 'Profile', icon: <FaUserCircle size={20} /> },
  ];
  
  // Handle save settings
  const handleSaveSettings = () => {
    // Show save animation
    setSaveAnimation(true);
    
    // Reset after animation completes
    setTimeout(() => {
      setSaveAnimation(false);
      setFormChanged(false);
      
      // Show success notification
      toast.success('Settings saved successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }, 1000);
    
    // Here you would normally save to your backend
    console.log('Settings saved:', {
      isNotificationsEnabled,
      twoFactorEnabled,
      language,
      theme: isDarkMode ? 'dark' : 'light',
      primaryColor,
      accentColor,
      radius
    });
  };

  // Color options
  const colorOptions = [
    { name: 'indigo', value: '#4F46E5' },
    { name: 'emerald', value: '#10B981' },
    { name: 'amber', value: '#F59E0B' },
    { name: 'rose', value: '#F43F5E' },
    { name: 'violet', value: '#8B5CF6' },
    { name: 'blue', value: '#3B82F6' },
  ];

  // Border radius options
  const radiusOptions = [
    { name: 'None', value: 'none' },
    { name: 'Small', value: 'sm' },
    { name: 'Medium', value: 'md' },
    { name: 'Large', value: 'lg' },
    { name: 'Full', value: 'full' },
  ];
  
  // Language options
  const languageOptions = [
    { name: 'English', value: 'english', flag: '🇺🇸' },
    { name: 'Spanish', value: 'spanish', flag: '🇪🇸' },
    { name: 'French', value: 'french', flag: '🇫🇷' },
    { name: 'German', value: 'german', flag: '🇩🇪' },
    { name: 'Chinese', value: 'chinese', flag: '🇨🇳' },
    { name: 'Japanese', value: 'japanese', flag: '🇯🇵' },
  ];
  
  return (
    <MoverLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
      <div className={`min-h-screen py-8 px-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row gap-6 md:gap-10"
          >
            {/* Left Sidebar - Settings Navigation */}
            <motion.div 
              className={`${sidebarCollapsed ? 'w-16' : 'w-full md:w-64'} rounded-xl shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'} transition-all duration-300`}
              initial={false}
              animate={{ width: sidebarCollapsed ? 'auto' : '' }}
            >
              <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                <div className="flex items-center">
                  <FaCog size={22} className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'} animate-spin-slow`} />
                  {!sidebarCollapsed && <h2 className="ml-2 text-xl font-semibold">Settings</h2>}
                </div>
                <button 
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className={`text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200`}
                >
                  {sidebarCollapsed ? <FaChevronRight /> : <FaChevronRight className="rotate-180" />}
                </button>
              </div>
              
              <nav className="p-4">
                <ul className="space-y-1">
                  {tabs.map(tab => (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${
                          activeTab === tab.id 
                            ? (isDarkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-100 text-blue-600')
                            : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
                        }`}
                      >
                        <span className="mr-3">{tab.icon}</span>
                        {!sidebarCollapsed && <span>{tab.label}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>
            
            {/* Main Content Area */}
            <div className="flex-1">
              <div className={`rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 transition-colors duration-300`}>
                {/* Appearance Settings */}
                {activeTab === 'appearance' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <FaPalette /> Appearance Settings
                    </h3>
                    
                    {/* Theme Toggle */}
                    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-300`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Theme Mode</h4>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Toggle between light and dark mode
                          </p>
                        </div>
                        <button
                          onClick={toggleDarkMode}
                          className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
                        >
                          {isDarkMode ? (
                            <>
                              <FaMoon className="text-blue-400" />
                              <span>Dark Mode</span>
                            </>
                          ) : (
                            <>
                              <FaSun className="text-amber-500" />
                              <span>Light Mode</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* Primary Color */}
                    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-300`}>
                      <h4 className="font-medium mb-4">Primary Color</h4>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {colorOptions.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => {
                              setPrimaryColor(color.value);
                              setFormChanged(true);
                            }}
                            className={`w-full aspect-square rounded-lg flex items-center justify-center ${
                              primaryColor === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                            }`}
                            style={{ backgroundColor: color.value }}
                          >
                            {primaryColor === color.value && (
                              <span className="text-white">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Accent Color */}
                    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-300`}>
                      <h4 className="font-medium mb-4">Accent Color</h4>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {colorOptions.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => {
                              setAccentColor(color.value);
                              setFormChanged(true);
                            }}
                            className={`w-full aspect-square rounded-lg flex items-center justify-center ${
                              accentColor === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                            }`}
                            style={{ backgroundColor: color.value }}
                          >
                            {accentColor === color.value && (
                              <span className="text-white">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Border Radius */}
                    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-300`}>
                      <h4 className="font-medium mb-4">Corner Roundness</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {radiusOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setRadius(option.value);
                              setFormChanged(true);
                            }}
                            className={`px-4 py-2 rounded-lg border ${
                              radius === option.value 
                                ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-500 text-white border-blue-400')
                                : (isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300')
                            } transition-colors duration-300`}
                          >
                            {option.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Language Settings */}
                {activeTab === 'language' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <FaLanguage /> Language Settings
                    </h3>
                    
                    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-300`}>
                      <h4 className="font-medium mb-4">Select Language</h4>
                      <div className="space-y-3">
                        {languageOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setLanguage(option.value);
                              setFormChanged(true);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border ${
                              language === option.value 
                                ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-500 text-white border-blue-400')
                                : (isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300')
                            } transition-colors duration-300`}
                          >
                            <div className="flex items-center">
                              <span className="text-xl mr-3">{option.flag}</span>
                              <span>{option.name}</span>
                            </div>
                            {language === option.value && <FaChevronRight />}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-300`}>
                      <h4 className="font-medium mb-4">Date & Time Format</h4>
                      <div className="space-y-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Date Format
                          </label>
                          <select 
                            className={`w-full px-4 py-2 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-600 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-800'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300`}
                            onChange={() => setFormChanged(true)}
                          >
                            <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                            <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                            <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Time Format
                          </label>
                          <select 
                            className={`w-full px-4 py-2 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-600 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-800'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300`}
                            onChange={() => setFormChanged(true)}
                          >
                            <option value="12h">12-hour (AM/PM)</option>
                            <option value="24h">24-hour</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <FaBell /> Notification Settings
                    </h3>
                    
                    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-300`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Push Notifications</h4>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Receive notifications about new jobs and client updates
                          </p>
                        </div>
                        <div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={isNotificationsEnabled}
                              onChange={() => {
                                setIsNotificationsEnabled(!isNotificationsEnabled);
                                setFormChanged(true);
                              }}
                            />
                            <div className={`w-11 h-6 rounded-full peer ${
                              isDarkMode
                                ? 'bg-gray-600 peer-checked:bg-blue-500'
                                : 'bg-gray-300 peer-checked:bg-blue-600'
                            } peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all transition-colors duration-300`}></div>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Email Notifications</h4>
                      
                      {[
                        { id: 'new_jobs', label: 'New Job Opportunities', defaultChecked: true },
                        { id: 'booking_confirmations', label: 'Booking Confirmations', defaultChecked: true },
                        { id: 'client_messages', label: 'Client Messages', defaultChecked: true },
                        { id: 'payment_updates', label: 'Payment Updates', defaultChecked: true },
                        { id: 'newsletter', label: 'Newsletter and Updates', defaultChecked: false },
                      ].map(option => (
                        <div 
                          key={option.id}
                          className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} flex items-center justify-between transition-colors duration-300`}
                        >
                          <span>{option.label}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              defaultChecked={option.defaultChecked}
                              onChange={() => setFormChanged(true)}
                            />
                            <div className={`w-11 h-6 rounded-full peer ${
                              isDarkMode
                                ? 'bg-gray-600 peer-checked:bg-blue-500'
                                : 'bg-gray-300 peer-checked:bg-blue-600'
                            } peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all transition-colors duration-300`}></div>
                          </label>
                        </div>
                      ))}
                    </div>

                    {/* Notification Frequency */}
                    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-300`}>
                      <h4 className="font-medium mb-4">Notification Frequency</h4>
                      <div className="space-y-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Job Updates
                          </label>
                          <select className={`w-full px-4 py-2 rounded-lg border ${
                            isDarkMode 
                              ? 'bg-gray-600 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-800'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300`}
                          >
                            <option value="immediate">Immediate</option>
                            <option value="hourly">Hourly Digest</option>
                            <option value="daily">Daily Summary</option>
                            <option value="weekly">Weekly Roundup</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Marketing Communications
                          </label>
                          <select className={`w-full px-4 py-2 rounded-lg border ${
                            isDarkMode 
                              ? 'bg-gray-600 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-800'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300`}
                          >
                            <option value="never">Never</option>
                            <option value="weekly">Weekly</option>
                            <option value="biweekly">Bi-Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Security Settings */}
                {activeTab === 'security' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <FaShieldAlt /> Security Settings
                    </h3>
                    
                    {/* Password Change */}
                    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-300`}>
                      <h4 className="font-medium flex items-center">
                        <FaLock className="mr-2" /> Change Password
                      </h4>
                      <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Update your password regularly to maintain account security
                      </p>
                      
                      <div className="space-y-4 mt-4">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Current Password
                          </label>
                          <input
                            type="password"
                            className={`w-full px-4 py-2 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-600 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-800'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            New Password
                          </label>
                          <input
                            type="password"
                            className={`w-full px-4 py-2 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-600 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-800'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className={`w-full px-4 py-2 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-600 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-800'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300`}
                          />
                        </div>
                        <button className={`px-4 py-2 rounded-lg ${
                          isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                        } text-white font-medium transition-colors duration-300`}>
                          Update Password
                        </button>
                      </div>
                    </div>
                    
                    {/* Two-Factor Authentication */}
                    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-300`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium flex items-center">
                            <FaShieldAlt className="mr-2" /> Two-Factor Authentication
                          </h4>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={twoFactorEnabled}
                              onChange={() => {
                                setTwoFactorEnabled(!twoFactorEnabled);
                                setFormChanged(true);
                              }}
                            />
                            <div className={`w-11 h-6 rounded-full peer ${
                              isDarkMode
                                ? 'bg-gray-600 peer-checked:bg-blue-500'
                                : 'bg-gray-300 peer-checked:bg-blue-600'
                            } peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all transition-colors duration-300`}></div>
                          </label>
                        </div>
                      </div>
                      
                      {twoFactorEnabled && (
                        <div className="mt-4 p-4 border border-dashed rounded-lg border-gray-300 dark:border-gray-600">
                          <h5 className="font-medium mb-2">Two-Factor Authentication Setup</h5>
                          <p className="text-sm mb-4">Scan this QR code with your authenticator app:</p>
                          
                          <div className="bg-white p-4 w-40 h-40 mx-auto mb-4">
                            {/* Placeholder for QR code */}
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-xs">QR Code</span>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Enter the code from your app:</label>
                            <div className="flex gap-2">
                                  {[1, 2, 3, 4, 5, 6].map((num) => (
                                    <input
                                      key={num}
                                      type="text"
                                      maxLength={1}
                                      className="w-10 h-12 text-center rounded border dark:bg-gray-600 dark:border-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="•"
                                    />
                                  ))}
                                </div>
                                <button
                                  className={`mt-4 px-4 py-2 rounded-lg ${
                                    isDarkMode 
                                      ? 'bg-blue-600 hover:bg-blue-700' 
                                      : 'bg-blue-500 hover:bg-blue-600'
                                  } text-white font-medium transition-colors duration-300`}
                                >
                                  Complete Setup
                                </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Active Sessions */}
                    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-300`}>
                      <h4 className="font-medium mb-4">Active Sessions</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-600">
                          <div>
                            <p className="font-medium">Chrome • Windows 10</p>
                            <p className="text-sm text-gray-400">New York, USA • Active now</p>
                          </div>
                          <button className="text-red-400 hover:text-red-300 text-sm">
                            Logout
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-600">
                          <div>
                            <p className="font-medium">Safari • iPhone</p>
                            <p className="text-sm text-gray-400">London, UK • 2 hours ago</p>
                          </div>
                          <button className="text-red-400 hover:text-red-300 text-sm">
                            Logout
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Profile Settings */}
                {activeTab === 'profile' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <FaUserCircle /> Profile Settings
                    </h3>

                    {/* Profile Photo */}
                    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-300`}>
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <FaUserCircle className="w-20 h-20 text-gray-400" />
                          <button className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600">
                            <FaCog className="w-4 h-4" />
                          </button>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Update Profile Photo</h4>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Recommended size: 200x200 pixels
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-300`}>
                      <h4 className="font-medium mb-6">Personal Information</h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            First Name
                          </label>
                          <input
                            type="text"
                            className={`w-full px-4 py-2 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-600 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-800'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Last Name
                          </label>
                          <input
                            type="text"
                            className={`w-full px-4 py-2 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-600 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-800'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Email Address
                          </label>
                          <input
                            type="email"
                            className={`w-full px-4 py-2 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-600 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-800'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            className={`w-full px-4 py-2 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-600 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-800'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-300`}>
                      <h4 className="font-medium mb-4">About Me</h4>
                      <textarea
                        rows={4}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-600 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-800'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Tell clients about yourself and your moving experience..."
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Save Button */}
              {formChanged && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex justify-end"
                >
                  <button
                    onClick={handleSaveSettings}
                    disabled={saveAnimation}
                    className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors duration-300 ${
                      isDarkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    } ${saveAnimation ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {saveAnimation ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="mr-2"
                      >
                        <FaSave />
                      </motion.span>
                    ) : (
                      <FaSave className="mr-2" />
                    )}
                    Save Changes
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </MoverLayout>
  );
};

export default MoverSettings;