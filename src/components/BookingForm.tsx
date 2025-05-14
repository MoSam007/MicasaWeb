// src/components/BookingForm.tsx
import React from 'react';

interface BookingFormProps {
  price: string;
  rating: number;
  compact?: boolean; // For mobile view
}

const BookingForm: React.FC<BookingFormProps> = ({ price, rating, compact = false }) => {
  return (
    <div className={`bg-white rounded-xl border shadow-lg p-4 ${!compact ? 'sticky top-4' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-xl font-semibold">{price} KES</span>
          <span className="text-gray-600"> / month</span>
        </div>
        <div className="flex items-center">
          <span className="text-sm mr-1">⭐</span>
          <span className="text-sm font-medium">{rating}</span>
        </div>
      </div>

      {/* Booking Form */}
      <div className="mb-4">
        <div className="border rounded-t-lg overflow-hidden">
          <div className="grid grid-cols-2">
            <div className="p-3 border-r border-b">
              <div className="text-xs text-gray-500">CHECK-IN</div>
              <div className="text-sm font-medium mt-1">11/17/2024</div>
            </div>
            <div className="p-3 border-b">
              <div className="text-xs text-gray-500">CHECKOUT</div>
              <div className="text-sm font-medium mt-1">11/22/2024</div>
            </div>
          </div>
          <div className="p-3 relative">
            <div className="text-xs text-gray-500">GUESTS</div>
            <div className="flex justify-between items-center mt-1">
              <div className="text-sm font-medium">1 guest</div>
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-500">
                <path 
                  fill="currentColor" 
                  d="M12 16.5l-8.5-8.5 1.5-1.5L12 13.5 19 6.5l1.5 1.5z"
                ></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="text-center text-red-500 text-sm my-3">
          <span>Something went wrong. Try your dates again</span>
        </div>
      </div>

      <button 
        className="w-full py-3 px-6 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
      >
        Change dates
      </button>

      <div className="mt-4 text-center">
        <span className="text-sm text-gray-500">
          <span className="font-medium text-pink-600">Rare find! </span>
          This place is usually booked
        </span>
      </div>

      {!compact && (
        <div className="mt-8 text-right">
          <button 
            className="text-gray-600 text-sm flex items-center ml-auto"
          >
            <svg 
              viewBox="0 0 24 24" 
              className="h-4 w-4 mr-1 fill-current"
            >
              <path d="M22.8 3.2l-2-2L3.2 18.8l2 2z"></path>
              <path d="M20.8 18.8l2-2L5.2 0.2l-2 2z"></path>
            </svg>
            Report this listing
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingForm;