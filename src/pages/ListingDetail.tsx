import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReviewsSection from '../components/Reviews';
import {
  FaBed, FaChair, FaBiking, FaDumbbell, FaChild,
  FaBuilding, FaSwimmer, FaFire, FaCar,
  FaHandsWash, FaTree, FaShower, FaToilet, FaShoppingCart,
  FaHospital, FaWater, FaCarSide, FaWineGlass, FaUmbrella, FaHeart,
} from 'react-icons/fa';
import { useAuth } from '../auth/authContext';
import API_BASE_URL from '../../src/config';

// Skeleton Loader (create seperate component if needed)
const SkeletonLoader: React.FC = () => (
  <div className="animate-pulse px-6 p-6 sm:p-8 md:p-10">
    {/* Image Grid Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      {/* Main Image Skeleton */}
      <div className="bg-gray-300 h-64 sm:h-80 md:h-96 w-full rounded-lg shadow-md"></div>

      {/* Thumbnail Images Skeleton */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-300 h-32 sm:h-36 md:h-44 w-full rounded-lg shadow-md"></div>
        <div className="bg-gray-300 h-32 sm:h-36 md:h-44 w-full rounded-lg shadow-md"></div>
        <div className="bg-gray-300 h-32 sm:h-36 md:h-44 w-full rounded-lg shadow-md"></div>
        <div className="bg-gray-300 h-32 sm:h-36 md:h-44 w-full rounded-lg shadow-md"></div>
      </div>
    </div>

    {/* Details Skeleton */}
    <div className="mb-4">
      <div className="bg-gray-300 h-6 w-2/3 sm:w-1/3 mb-3 rounded"></div>
      <div className="bg-gray-300 h-4 w-1/2 sm:w-1/4 mb-3 rounded"></div>
      <div className="bg-gray-300 h-6 w-full sm:w-3/4 mb-4 rounded"></div>
    </div>

    {/* Amenities Skeleton */}
    <div>
      <div className="bg-gray-300 h-6 w-1/4 sm:w-1/6 mb-4 rounded"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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

interface IListing {
  l_id: number;
  title: string;
  location: string;
  price: string;
  rating: number;
  image_urls: string[]; // Changed to match backend field name
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

  // Log the route parameter for debugging
  console.log("Route parameter l_id:", l_id);

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
  if (error) return <div className="text-red-600">{error}</div>;
  if (!listing) return <div>Listing not found</div>;

  // Use backendUrl to construct image URLs
  const backendUrl = 'http://127.0.0.1:8000';

  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    const iconMapping: { [key: string]: JSX.Element } = {
      bedroom: <FaBed />,
      bed: <FaBed />,
      bath: <FaToilet />,
      shower: <FaShower />,
      patio: <FaUmbrella />,
      balcony: <FaBiking />,
      gym: <FaDumbbell />,
      playground: <FaChild />,
      mart: <FaShoppingCart />,
      chemist: <FaHospital />,
      water: <FaWater />,
      kids: <FaChild />,
      elevator: <FaBuilding />,
      lift: <FaBuilding />,
      pool: <FaSwimmer />,
      fireplace: <FaFire />,
      firepit: <FaFire />,
      parking: <FaCar />,
      car: <FaCarSide />,
      kitchen: <FaWineGlass />,
      laundry: <FaHandsWash />,
      garden: <FaTree />,
    };
    return iconMapping[amenityLower] || <FaChair />;
  };

  return (
    <div className="container mx-auto px-6 py-8"> 
      {/* Photo Gallery Section */} {/* Add on hover feature to make images pop when hovered */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {listing.image_urls && listing.image_urls.length > 0 ? (
          <img
            src={listing.image_urls[0].startsWith('http') 
                ? listing.image_urls[0] 
                : `${backendUrl}/uploads/${listing.image_urls[0]}`}
            alt="Main Image"
            className="col-span-1 w-full h-96 object-cover rounded-lg shadow-md"
          />
        ) : (
          <div className="col-span-1 w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">No image available</span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          {listing.image_urls && listing.image_urls.slice(1, 5).map((url, index) => (
            <img
              key={index}
              src={url.startsWith('http') ? url : `${backendUrl}/uploads/${url}`}
              alt={`Thumbnail ${index + 2}`}
              className="w-full h-44 object-cover rounded-lg shadow-md"
            />
          ))}
          {listing.image_urls && listing.image_urls.length > 5 && (
            <Link to={`/listing/${l_id}/gallery`} className="col-span-2 text-center text-blue-500 mt-2">
              View All Photos
            </Link>
          )}
        </div>
      </div>

      {/* Description and Details */}
      <div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 ${
              wishlistState.isInWishlist ? 'text-red-500' : 'text-gray-500'
            } hover:text-red-500 transition-colors`}
          >
            <FaHeart className={`h-6 w-6 ${
              wishlistState.isInWishlist ? 'fill-current' : 'stroke-current'
            }`} />
            <span>{wishlistState.likes}</span>
          </button>
          {wishlistState.isInWishlist && (
            <span className="text-sm text-gray-500">Added to wishlist</span>
          )}
        </div>
        <h1 className="text-2xl font-semibold">{listing.title}</h1>
        <p className="text-gray-600 mt-2"><strong>Location:</strong> {listing.location}</p>
        <p className="text-gray-800 mt-4"><strong>Price:</strong> {listing.price}</p>
        <p className="text-gray-800 mt-4"><strong>Rating:</strong> {listing.rating}⭐</p>
        <p className="text-gray-800 mt-4"><strong>Description:</strong> {listing.description}</p>
      </div>

      {/* Amenities Section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Amenities</h2>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {listing.amenities && listing.amenities.map((amenity, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-yellow-600">{getAmenityIcon(amenity)}</span>
              <span className="text-gray-600 capitalize">{amenity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewsSection l_id={listing.l_id} />
    </div>
  );
};

export default ListingDetail;