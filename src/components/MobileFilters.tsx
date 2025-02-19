import React from 'react';
import { motion } from 'framer-motion';
import { FaFilter } from 'react-icons/fa';

interface MobileFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const MobileFilters: React.FC<MobileFiltersProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            ×
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
};

export default MobileFilters;