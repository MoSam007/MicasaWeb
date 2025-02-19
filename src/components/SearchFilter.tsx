// src/components/SearchFilters.tsx
import React, { useState } from 'react';
import { FaSearch, FaFilter, FaDollarSign, FaBed, FaBath } from 'react-icons/fa';

interface FilterOptions {
  priceRange: [number, number];
  bedrooms: number | null;
  bathrooms: number | null;
  propertyType: string | null;
}

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, onFilter }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 10000],
    bedrooms: null,
    bathrooms: null,
    propertyType: null
  });

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    onFilter({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
        >
          <FaFilter />
          <span>Filters</span>
        </button>
      </div>

      {isFilterOpen && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Price Range</label>
            <div className="flex items-center space-x-2">
              <FaDollarSign className="text-gray-400" />
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={filters.priceRange[1]}
                onChange={(e) => handleFilterChange('priceRange', [0, parseInt(e.target.value)])}
                className="w-full"
              />
            </div>
            <div className="text-sm text-gray-600">
              Up to ${filters.priceRange[1]}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
            <div className="flex items-center space-x-2">
              <FaBed className="text-gray-400" />
              <select
                value={filters.bedrooms || ''}
                onChange={(e) => handleFilterChange('bedrooms', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full border border-gray-300 rounded-md"
              >
                <option value="">Any</option>
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}+ beds</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Property Type</label>
            <select
              value={filters.propertyType || ''}
              onChange={(e) => handleFilterChange('propertyType', e.target.value || null)}
              className="w-full border border-gray-300 rounded-md"
            >
              <option value="">Any</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;