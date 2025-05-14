import React, { useState } from 'react';
import { FaHome, FaQuestion, FaClipboardList, FaMoneyBill, FaCamera, FaShieldAlt, FaUserCheck } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
  icon: JSX.Element;
  category: 'listing' | 'process' | 'safety';
}

const FAQ: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'listing' | 'process' | 'safety' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const faqItems: FAQItem[] = [
    {
      question: "How do I list my property?",
      answer: "Start by creating a homeowner account. Once verified, click on 'Add Listing' in your dashboard. Fill in your property details, upload high-quality photos, and set your pricing. Our team will review and approve your listing within 24 hours.",
      icon: <FaHome className="text-yellow-600" />,
      category: 'listing'
    },
    {
      question: "What information should I include in my listing?",
      answer: "Include detailed property specifications (size, rooms, amenities), high-quality photos, accurate pricing, location details, and any special features. The more comprehensive your listing, the better response you'll receive.",
      icon: <FaClipboardList className="text-yellow-600" />,
      category: 'listing'
    },
    {
      question: "How should I price my property?",
      answer: "Research similar properties in your area, consider your property's unique features, and factor in seasonal demands. We provide a pricing guide based on market analysis to help you set competitive rates.",
      icon: <FaMoneyBill className="text-yellow-600" />,
      category: 'process'
    },
    {
      question: "What makes a good property photo?",
      answer: "Take well-lit photos during daylight hours, showcase all rooms and amenities, ensure spaces are clean and tidy, and highlight unique features. Consider hiring a professional photographer for best results.",
      icon: <FaCamera className="text-yellow-600" />,
      category: 'listing'
    },
    {
      question: "How does MiCasa verify users?",
      answer: "We implement a multi-step verification process including email verification, phone verification, and ID verification for both homeowners and house hunters to ensure safety and trust.",
      icon: <FaShieldAlt className="text-yellow-600" />,
      category: 'safety'
    },
    // Add more FAQ items as needed
  ];

  const filteredFAQs = faqItems.filter(item => 
    (activeCategory === 'all' || item.category === activeCategory) &&
    (item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            How can we help?
          </h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about listing your property
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            <FaQuestion className="absolute right-4 top-4 text-gray-400" />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex justify-center space-x-4 mb-8">
          {['all', 'listing', 'process', 'safety'].map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category as any)}
              className={`px-4 py-2 rounded-full ${
                activeCategory === category
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-6">
          <AnimatePresence>
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    {faq.icon}
                    <h2 className="text-xl font-semibold text-gray-900">
                      {faq.question}
                    </h2>
                  </div>
                  <p className="text-gray-600 ml-9">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Contact Support Section */}
        <div className="mt-12 bg-yellow-50 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-4">
            Can't find the answer you're looking for? Please contact our support team.
          </p>
          <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQ;