import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaMapMarkerAlt, FaBed, FaDollarSign, FaSearch, 
  FaSwimmingPool, FaWifi, FaParking,
  FaSnowflake, FaTv, FaLock, FaUtensils,
  FaWater, FaTree, FaDog, FaShower,
  FaDumbbell
} from 'react-icons/fa';
import Autocomplete from 'react-google-autocomplete';
import { IListing } from '../types';

interface EnhancedFiltersProps {
  listings: IListing[];
  onFilter: (filteredListings: IListing[]) => void;
}

interface AmenityOption {
  icon: JSX.Element;
  label: string;
  value: string;
}

const amenityOptions: AmenityOption[] = [
  { icon: <FaSwimmingPool />, label: 'Pool', value: 'pool' },
  { icon: <FaWifi />, label: 'WiFi', value: 'wifi' },
  { icon: <FaParking />, label: 'Parking', value: 'parking' },
  { icon: <FaDumbbell />, label: 'Gym', value: 'gym' },
  { icon: <FaSnowflake />, label: 'AC', value: 'ac' },
  { icon: <FaTv />, label: 'TV', value: 'tv' },
  { icon: <FaLock />, label: 'Security', value: 'security' },
  { icon: <FaUtensils />, label: 'Kitchen', value: 'kitchen' },
  { icon: <FaWater />, label: 'Water', value: 'water' },
  { icon: <FaTree />, label: 'Garden', value: 'garden' },
  { icon: <FaDog />, label: 'Pet Friendly', value: 'pets' },
  { icon: <FaShower />, label: 'Private Bath', value: 'private_bath' },
];

const EnhancedFilters: React.FC<EnhancedFiltersProps> = ({ listings, onFilter }) => {
  const [location, setLocation] = useState<string>('');
  const [isAmenitiesOpen, setIsAmenitiesOpen] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [bedrooms, setBedrooms] = useState<string>('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const handleAmenityToggle = (value: string) => {
    setSelectedAmenities(prev => 
      prev.includes(value) 
        ? prev.filter(a => a !== value)
        : [...prev, value]
    );
  };

  const FilterButton: React.FC<{
    icon: JSX.Element;
    label: string;
    onClick: () => void;
    isActive?: boolean;
  }> = ({ icon, label, onClick, isActive }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        flex items-center space-x-2 px-4 py-2 rounded-full border
        ${isActive 
          ? 'border-yellow-500 bg-yellow-50 text-yellow-700' 
          : 'border-gray-300 hover:border-gray-400'
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );

  return (
    <div className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        {/* Main Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Search Location */}
          <div className="flex-grow min-w-[300px]">
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Autocomplete
                apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                onPlaceSelected={(place: any) => {
                  if (place.formatted_address) {
                    setLocation(place.formatted_address);
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Where to?"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <FilterButton
              icon={<FaDollarSign />}
              label="Price"
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            />
            <FilterButton
              icon={<FaBed />}
              label="Bedrooms"
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            />
            <FilterButton
              icon={<FaSearch />}
              label="Amenities"
              onClick={() => setIsAmenitiesOpen(!isAmenitiesOpen)}
              isActive={selectedAmenities.length > 0}
            />
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {isFilterExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 overflow-hidden"
            >
              {/* Price Range Slider */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="text-sm text-gray-600">
                  Up to ${priceRange[1]}
                </div>
              </div>

              {/* Bedroom Selection */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Studio', '1', '2', '3+'].map((num) => (
                  <button
                    key={num}
                    onClick={() => setBedrooms(num)}
                    className={`
                      px-4 py-2 rounded-lg border
                      ${bedrooms === num 
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-700' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  >
                    {num} {num !== 'Studio' && 'Bed'}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Amenities Dropdown */}
          {isAmenitiesOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2"
            >
              {amenityOptions.map((amenity) => (
                <button
                  key={amenity.value}
                  onClick={() => handleAmenityToggle(amenity.value)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-full border
                    transition-all duration-200
                    ${selectedAmenities.includes(amenity.value)
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  {amenity.icon}
                  <span>{amenity.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedFilters;