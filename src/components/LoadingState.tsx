import React from 'react';
import { motion } from 'framer-motion';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <motion.div
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
        className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-600 rounded-full"
      />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
};

export default LoadingState;