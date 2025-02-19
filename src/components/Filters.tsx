import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaMapMarkerAlt, FaBed, FaDollarSign, FaSearch,
  FaSwimmingPool, FaWifi, FaParking, FaDumbbell,
  FaSnowflake, FaTv, FaLock, FaUtensils,
  FaWater, FaTree, FaDog, FaShower,
  FaFilter, FaHome, FaBuilding
} from 'react-icons/fa';
import Autocomplete from 'react-google-autocomplete';
import { IListing } from '../types';

interface FiltersProps {
  listings: IListing[];
  onFilter: (filteredListings: IListing[]) => void;
}

interface AmenityOption {
  icon: JSX.Element;
  label: string;
  value: string;
}

const Filters: React.FC<FiltersProps> = ({ listings, onFilter }) => {
  const [location, setLocation] = useState<string>('');
  const [isAmenitiesOpen, setIsAmenitiesOpen] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [bedrooms, setBedrooms] = useState<string>('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [propertyType, setPropertyType] = useState<string>('');

  const amenityOptions: AmenityOption[] = [
    { icon: <FaSwimmingPool className="text-gray-600" />, label: 'Pool', value: 'pool' },
    { icon: <FaWifi className="text-gray-600" />, label: 'WiFi', value: 'wifi' },
    { icon: <FaParking className="text-gray-600" />, label: 'Parking', value: 'parking' },
    { icon: <FaDumbbell className="text-gray-600" />, label: 'Gym', value: 'gym' },
    { icon: <FaSnowflake className="text-gray-600" />, label: 'AC', value: 'ac' },
    { icon: <FaTv className="text-gray-600" />, label: 'TV', value: 'tv' },
    { icon: <FaLock className="text-gray-600" />, label: 'Security', value: 'security' },
    { icon: <FaUtensils className="text-gray-600" />, label: 'Kitchen', value: 'kitchen' },
    { icon: <FaWater className="text-gray-600" />, label: 'Water', value: 'water' },
    { icon: <FaTree className="text-gray-600" />, label: 'Garden', value: 'garden' },
    { icon: <FaDog className="text-gray-600" />, label: 'Pet Friendly', value: 'pets' },
    { icon: <FaShower className="text-gray-600" />, label: 'Private Bath', value: 'private_bath' },
  ];

  const handlePlaceSelected = (place: any) => {
    if (place.geometry) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setLocation(place.formatted_address);
      applyFilters();
    }
  };

  const handleAmenityToggle = (value: string) => {
    setSelectedAmenities(prev => 
      prev.includes(value) 
        ? prev.filter(a => a !== value)
        : [...prev, value]
    );
  };

  const applyFilters = () => {
    let filteredResults = [...listings];

    // Apply location filter
    if (location) {
      filteredResults = filteredResults.filter(listing =>
        listing.location?.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Apply price range filter
    filteredResults = filteredResults.filter(listing => {
      const price = parseInt(listing.price.replace(/[^0-9]/g, ''));
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Apply bedroom filter
    if (bedrooms) {
      filteredResults = filteredResults.filter(listing => {
        const bedroomCount = listing.amenities.find(a => a.toLowerCase().includes('bed'))?.match(/\d+/)?.[0];
        return bedroomCount === bedrooms;
      });
    }

    // Apply amenities filter
    if (selectedAmenities.length > 0) {
      filteredResults = filteredResults.filter(listing =>
        selectedAmenities.every(amenity =>
          listing.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
        )
      );
    }

    onFilter(filteredResults);
  };

  useEffect(() => {
    applyFilters();
  }, [location, priceRange, bedrooms, selectedAmenities]);

  return (
    <div className="sticky top-0 z-40 bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        {/* Main Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
          <div className="w-full md:w-1/2 relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Autocomplete
              apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
              onPlaceSelected={handlePlaceSelected}
              types={['(regions)']}
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Find a dream home?"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 text-white rounded-full hover:bg-yellow-700 transition-colors"
          >
            <FaFilter />
            <span>Filters</span>
          </motion.button>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {isFilterExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-white rounded-lg">
                {/* Price Range */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Price Range</label>
                  <div className="flex items-center space-x-2">
                    <FaDollarSign className="text-gray-400" />
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="1000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    Up to ${priceRange[1].toLocaleString()}
                  </div>
                </div>

                {/* Bedrooms */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                  <div className="flex space-x-2">
                    {['Studio', '1', '2', '3+'].map((num) => (
                      <motion.button
                        key={num}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setBedrooms(num)}
                        className={`px-4 py-2 rounded-full border ${
                          bedrooms === num
                            ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {num} {num !== 'Studio' && 'Bed'}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Property Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Property Type</label>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPropertyType('apartment')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${
                        propertyType === 'apartment'
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <FaBuilding />
                      <span>Apartment</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPropertyType('house')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${
                        propertyType === 'house'
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <FaHome />
                      <span>House</span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Amenities Section */}
              <div className="mt-4 p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {amenityOptions.map((amenity) => (
                    <motion.button
                      key={amenity.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAmenityToggle(amenity.value)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full border
                        ${selectedAmenities.includes(amenity.value)
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      {amenity.icon}
                      <span className="text-sm">{amenity.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Filters;