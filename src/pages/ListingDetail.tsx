import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReviewsSection from '../components/Reviews';
import ImageGallery from '../components/ImageGallery';
import BookingForm from '../components/BookingForm';
import {
  FaBed, FaChair, FaBiking, FaDumbbell, FaChild,
  FaBuilding, FaSwimmer, FaFire, FaCar,
  FaHandsWash, FaTree, FaShower, FaToilet, FaShoppingCart,
  FaHospital, FaWater, FaCarSide, FaUmbrella, FaHeart,
  FaWifi, FaBriefcase, FaTv, FaUtensils, FaCoffee, FaSnowflake, FaHotTub,
  FaFan, FaPlug, FaBath, FaChevronRight, FaSprayCan, FaSoap, FaHandHoldingWater
} from 'react-icons/fa';
import { useAuth } from '../auth/authContext';
import API_BASE_URL from '../../src/config';

// Skeleton Loader
const SkeletonLoader: React.FC = () => (
  <div className="animate-pulse px-4 py-6">
    {/* Image Skeleton */}
    <div className="bg-gray-300 h-64 md:h-80 rounded-lg mb-6"></div>

    {/* Details Skeleton */}
    <div className="mb-4">
      <div className="bg-gray-300 h-6 w-2/3 sm:w-1/3 mb-3 rounded"></div>
      <div className="bg-gray-300 h-4 w-1/2 sm:w-1/4 mb-3 rounded"></div>
      <div className="bg-gray-300 h-6 w-full sm:w-3/4 mb-4 rounded"></div>
    </div>

    {/* Amenities Skeleton */}
    <div>
      <div className="bg-gray-300 h-6 w-1/4 sm:w-1/6 mb-4 rounded"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="bg-gray-300 h-8 w-8 rounded-full"></div>
            <div className="bg-gray-300 h-4 w-3/4 sm:w-1/2 rounded"></div>
          </div>
        ))}
      </div>
   </div>
 </div>
);

// Amenities Modal Component
const AmenitiesModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  amenities: string[];
  getAmenityIcon: (amenity: string) => JSX.Element;
}> = ({ isOpen, onClose, amenities, getAmenityIcon }) => {
  if (!isOpen) return null;

  // Group amenities by category
  const groupedAmenities: Record<string, string[]> = {
    "Bathroom": [],
    "Bedroom": [],
    "Kitchen": [],
    "Entertainment": [],
    "Outdoor": [],
    "Other": []
  };

  // Helper function to categorize amenities
  const categorizeAmenity = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('bath') || lowerAmenity.includes('shower') || lowerAmenity.includes('toilet') || 
        lowerAmenity.includes('bidet') || lowerAmenity.includes('soap') || lowerAmenity.includes('shampoo') || 
        lowerAmenity.includes('conditioner')) {
      return "Bathroom";
    } else if (lowerAmenity.includes('bed') || lowerAmenity.includes('pillow') || lowerAmenity.includes('blanket')) {
      return "Bedroom";
    } else if (lowerAmenity.includes('kitchen') || lowerAmenity.includes('utensil') || lowerAmenity.includes('dish') || 
               lowerAmenity.includes('coffee') || lowerAmenity.includes('refrigerator') || lowerAmenity.includes('microwave')) {
      return "Kitchen";
    } else if (lowerAmenity.includes('tv') || lowerAmenity.includes('wifi') || lowerAmenity.includes('internet') || 
               lowerAmenity.includes('game') || lowerAmenity.includes('book') || lowerAmenity.includes('play')) {
      return "Entertainment";
    } else if (lowerAmenity.includes('pool') || lowerAmenity.includes('patio') || lowerAmenity.includes('garden') || 
               lowerAmenity.includes('balcony') || lowerAmenity.includes('fire') || lowerAmenity.includes('grill')) {
      return "Outdoor";
    } else {
      return "Other";
    }
  };

  // Categorize each amenity
  amenities.forEach(amenity => {
    const category = categorizeAmenity(amenity);
    groupedAmenities[category].push(amenity);
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">What this place offers</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          {Object.entries(groupedAmenities).map(([category, categoryAmenities]) => (
            categoryAmenities.length > 0 && (
              <div key={category} className="mb-8">
                <h3 className="text-lg font-medium mb-4">{category}</h3>
                <div className="space-y-4">
                  {categoryAmenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <span className="text-gray-700 w-6">{getAmenityIcon(amenity)}</span>
                      <span className="text-gray-800">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

interface IListing {
  l_id: number;
  title: string;
  location: string;
  price: string;
  rating: number;
  image_urls: string[];
  description: string;
  amenities: string[];
  likes: number;
}

interface WishlistState {
  isInWishlist: boolean;
  likes: number;
}

const ListingDetail: React.FC = () => {
  const { l_id } = useParams<{ l_id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [listing, setListing] = useState<IListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistState, setWishlistState] = useState<WishlistState>({
    isInWishlist: false,
    likes: 0,
  });
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Log the route parameter for debugging
  console.log("Route parameter l_id:", l_id);

  // Handle resize events to toggle mobile/desktop view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchListing = async () => {
      // Check if l_id is defined and valid
      if (!l_id || l_id === 'undefined') {
        setError('Invalid listing ID');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/listings/${l_id}/`);
        if (!response.ok) {
          throw new Error('Error fetching listing');
        }
        const data = await response.json();
        console.log("Fetched listing data:", data);  // Debugging API response
        
        // Ensure image_urls is always an array
        if (typeof data.image_urls === 'string') {
          data.image_urls = data.image_urls.split(',').map((url: string) => url.trim());
        } else if (!Array.isArray(data.image_urls)) {
          data.image_urls = [];
        }
        
        // Ensure amenities is always an array
        if (typeof data.amenities === 'string') {
          data.amenities = data.amenities.split(',').map((amenity: string) => amenity.trim());
        } else if (!Array.isArray(data.amenities)) {
          data.amenities = [];
        }
        
        setListing(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load listing.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [l_id]);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      // Check if user is logged in and l_id is valid
      if (!currentUser || !l_id || l_id === 'undefined') return;
  
      try {
        const token = await currentUser.getIdToken();
        const response = await fetch(`${API_BASE_URL}/wishlist/check/${l_id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (!response.ok) throw new Error(`Error: ${response.status}`);
  
        const data = await response.json();
        console.log("Wishlist Status:", data);
  
        setWishlistState({
          isInWishlist: data.in_wishlist, // Ensure boolean response
          likes: data.likes ?? 0, // Default to 0 if undefined
        });
      } catch (error) {
        console.error("Error checking wishlist status:", error);
        setWishlistState((prev) => ({ ...prev, isInWishlist: false }));
      }
    };
  
    checkWishlistStatus();
  }, [l_id, currentUser]);
  
  const handleLike = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // Check if l_id is valid before making the API call
    if (!l_id || l_id === 'undefined') {
      console.error("Cannot toggle wishlist: Invalid listing ID");
      return;
    }
  
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/wishlist/${l_id}/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.ok) throw new Error(`Error: ${response.status}`);
  
      const data = await response.json();
      console.log("Updated Wishlist Data:", data);
  
      setWishlistState({
        isInWishlist: data.in_wishlist,
        likes: data.likes ?? 0,
      });
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };
  
  if (loading) return <SkeletonLoader />;
  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!listing) return <div className="p-4">Listing not found</div>;

  // Use backendUrl to construct image URLs
  const backendUrl = 'http://127.0.0.1:8000';

  // Improved function to extract numbers and match amenities with icons
  const getAmenityIcon = (amenity: string) => {
    // Extract the amenity name without numbers
    const amenityText = amenity.replace(/^\d+\s*/, '').toLowerCase().trim();
    
    // Mapping of amenity keywords to icons
    const iconMapping: { [key: string]: JSX.Element } = {
      bedroom: <FaBed />,
      bed: <FaBed />,
      bath: <FaBath />,
      bathroom: <FaBath />,
      shower: <FaShower />,
      toilet: <FaToilet />,
      bidet: <FaToilet />,
      patio: <FaUmbrella />,
      balcony: <FaUmbrella />,
      gym: <FaDumbbell />,
      playground: <FaChild />,
      mart: <FaShoppingCart />,
      chemist: <FaHospital />,
      water: <FaWater />,
      hot: <FaHotTub />,
      kids: <FaChild />,
      elevator: <FaBuilding />,
      lift: <FaBuilding />,
      pool: <FaSwimmer />,
      swimming: <FaSwimmer />,
      fireplace: <FaFire />,
      firepit: <FaFire />,
      parking: <FaCar />,
      car: <FaCarSide />,
      kitchen: <FaUtensils />,
      dining: <FaUtensils />,
      laundry: <FaHandsWash />,
      garden: <FaTree />,
      wifi: <FaWifi />,
      internet: <FaWifi />,
      workspace: <FaBriefcase />,
      dedicated: <FaBriefcase />,
      tv: <FaTv />,
      television: <FaTv />,
      coffee: <FaCoffee />,
      air: <FaFan />,
      conditioned: <FaSnowflake />,
      conditioning: <FaSnowflake />,
      ac: <FaSnowflake />,
      outlet: <FaPlug />,
      hair: <FaFan />,
      dryer: <FaFan />,
      cleaning: <FaSprayCan />,
      shampoo: <FaHandHoldingWater />,
      conditioner: <FaHandHoldingWater />,
      soap: <FaSoap />,
      trail: <FaBiking />,
      bike: <FaBiking />,
      body: <FaSoap />
    };
    
    // Check if any keyword in the amenity matches our mapping
    for (const [keyword, icon] of Object.entries(iconMapping)) {
      if (amenityText.includes(keyword)) {
        return icon;
      }
    }
    
    // Default icon if no match found
    return <FaChair />;
  };

  // Format amenity with number prefix if present
  const formatAmenity = (amenity: string) => {
    const match = amenity.match(/^(\d+)\s*(.*)/);
    if (match) {
      const [number, name] = match.slice(1);
      return `${number} ${name.charAt(0).toUpperCase() + name.slice(1)}`;
    }
    return amenity.charAt(0).toUpperCase() + amenity.slice(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 font-sans">
      {/* Title Section (Mobile) */}
      <div className="md:hidden mb-4">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-semibold">{listing.title}</h1>
          <button
            onClick={handleLike}
            className="p-2 bg-white rounded-full shadow-md flex items-center justify-center"
          >
            <FaHeart className={`h-5 w-5 ${
              wishlistState.isInWishlist ? 'text-red-500' : 'text-gray-400'
            }`} />
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">{listing.location}</p>
        <div className="flex items-center mt-1">
          <span className="text-sm mr-2">⭐ {listing.rating}</span>
          <span className="text-sm">
            {wishlistState.likes} {wishlistState.likes === 1 ? 'save' : 'saves'}
          </span>
        </div>
      </div>

      {/* Image Gallery */}
      {isMobile ? (
        <div className="mb-6">
          <ImageGallery 
            images={listing.image_urls} 
            listingId={l_id || ''} 
            backendUrl={backendUrl} 
          />
        </div>
      ) : (
        <div className="relative grid grid-cols-4 gap-2 mb-8 rounded-xl overflow-hidden h-96">
          {listing.image_urls && listing.image_urls.length > 0 ? (
            <>
              {/* Main large image */}
              <div className="col-span-2 row-span-2">
                <img
                  src={listing.image_urls[0].startsWith('http') 
                      ? listing.image_urls[0] 
                      : `${backendUrl}/uploads/${listing.image_urls[0]}`}
                  alt={listing.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              
              {/* Grid of smaller images */}
              {listing.image_urls.slice(1, 5).map((url, index) => (
                <div key={index} className="relative overflow-hidden">
                  <img
                    src={url.startsWith('http') ? url : `${backendUrl}/uploads/${url}`}
                    alt={`View ${index + 2}`}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              ))}
              
              {/* View all photos button */}
              {listing.image_urls.length > 5 && (
                <Link 
                  to={`/listing/${l_id}/gallery`}
                  className="absolute bottom-4 right-4 py-2 px-4 bg-white bg-opacity-80 backdrop-blur-md hover:bg-opacity-90 hover:backdrop-blur-lg transition-all duration-300 text-black font-medium rounded-lg shadow-lg flex items-center space-x-2"
                >
                  <span>View all photos</span>
                  <FaChevronRight className="h-3 w-3" />
                </Link>
              )}
            </>
          ) : (
            <div className="col-span-4 w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">No images available</span>
            </div>
          )}
        </div>
      )}

      {/* Title Section (Desktop) */}
      <div className="hidden md:block mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold">{listing.title}</h1>
            <p className="text-gray-600 mt-1">{listing.location}</p>
            <div className="flex items-center mt-1">
              <span className="flex items-center text-sm font-medium">
                ⭐ {listing.rating}
              </span>
              <span className="mx-2">•</span>
              <span className="text-sm font-medium">
                {wishlistState.likes} {wishlistState.likes === 1 ? 'save' : 'saves'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLike}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FaHeart className={`h-5 w-5 ${
              wishlistState.isInWishlist ? 'text-red-500' : 'text-gray-400'
            }`} />
          </button>
        </div>
      </div>

      {/* Content Grid - Split into two columns on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Listing Info */}
        <div className="lg:col-span-2">
          {/* Mobile Booking Form (appears before reviews on mobile) */}
          <div className="block md:hidden mb-8">
            <BookingForm 
              price={listing.price} 
              rating={listing.rating} 
              compact={true} 
            />
          </div>

          {/* Description */}
          <div className="mb-8">
            <p className="text-gray-700 leading-relaxed">{listing.description}</p>
          </div>

          {/* What this place offers section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">What this place offers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4">
              {listing.amenities && listing.amenities.slice(0, 8).map((amenity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <span className="text-gray-700 w-6">{getAmenityIcon(amenity)}</span>
                  <span className="text-gray-800">{formatAmenity(amenity)}</span>
                </div>
              ))}
            </div>
            
            {listing.amenities && listing.amenities.length > 8 && (
              <button 
                onClick={() => setShowAmenitiesModal(true)}
                className="mt-4 py-3 px-6 border border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Show all {listing.amenities.length} amenities
              </button>
            )}
          </div>

          {/* Reviews Section */}
          <ReviewsSection l_id={listing.l_id} />
        </div>

        {/* Right Column - Booking/Price Info (Desktop Only) */}
        <div className="hidden lg:block lg:col-span-1">
          <BookingForm 
            price={listing.price} 
            rating={listing.rating} 
          />
        </div>
      </div>

      {/* Amenities Modal */}
      <AmenitiesModal 
        isOpen={showAmenitiesModal}
        onClose={() => setShowAmenitiesModal(false)}
        amenities={listing.amenities || []}
        getAmenityIcon={getAmenityIcon}
      />
    </div>
  );
};

export default ListingDetail;