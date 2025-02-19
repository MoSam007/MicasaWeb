import { IListing } from '../models/listings';

export interface FilterOptions {
  location?: string;
  priceRange?: [number, number];
  bedrooms?: string;
  amenities?: string[];
  propertyType?: string;
}

export const applyFilters = (listings: IListing[], filters: FilterOptions): IListing[] => {
  return listings.filter(listing => {
    // Location filter
    if (filters.location && !listing.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }

    // Price range filter
    if (filters.priceRange) {
      const price = parseInt(listing.price.replace(/[^0-9]/g, ''));
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }
    }

    // Bedrooms filter
    if (filters.bedrooms) {
      const bedroomCount = listing.amenities.find(a => 
        a.toLowerCase().includes('bed'))?.match(/\d+/)?.[0];
      if (bedroomCount !== filters.bedrooms) {
        return false;
      }
    }

    // Amenities filter
    if (filters.amenities?.length) {
      if (!filters.amenities.every(amenity => 
        listing.amenities.some(a => 
          a.toLowerCase().includes(amenity.toLowerCase())
        )
      )) {
        return false;
      }
    }

    // Property type filter
    if (filters.propertyType && listing.propertyType !== filters.propertyType) {
      return false;
    }

    return true;
  });
};