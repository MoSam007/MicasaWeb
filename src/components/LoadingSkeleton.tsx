import React from 'react';

const LoadingSkeleton: React.FC = () => {
  const skeletonCards = Array(8).fill(null);

  return (
    <div className="container mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
      {skeletonCards.map((_, index) => (
        <div
          key={index}
          className="animate-pulse bg-white shadow-lg rounded-lg p-6"
        >
          <div className="h-48 bg-gray-300 rounded-md mb-4"></div>
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
