// src/components/WishlistButton.tsx
import React from 'react';
import { FaHeart } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../auth/ClerkauthContext';

interface WishlistButtonProps {
  listingId: number | string;
  isInWishlist: boolean;
  likesCount: number;
  onToggle: () => Promise<void>;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  listingId,
  isInWishlist,
  likesCount,
  onToggle
}) => {
  const { isSignedIn } = useAuth();

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onToggle}
        className={`flex items-center space-x-2 px-3 py-2 rounded-full ${
          isInWishlist 
            ? 'bg-red-500 text-white' 
            : 'bg-white text-gray-600 border border-gray-300'
        } transition-all duration-300`}
      >
        <FaHeart className={isInWishlist ? 'text-white' : 'text-gray-400'} />
        <span>{likesCount}</span>
      </motion.button>
      
      <AnimatePresence>
        {!isSignedIn && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-lg p-3 text-sm text-gray-600"
          >
            Please log in to save properties
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WishlistButton;