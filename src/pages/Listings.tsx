import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { FaHeart, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import API_BASE_URL from '../../src/config';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useAuth } from '../auth/ClerkauthContext';
interface Listing {
  l_id: string | number;
  title: string;
  description: string;
  location: string;
  price: string;
  rating: number;
  image_urls: string[]; // This will now contain full URLs
  amenities: string[];
  likes: number;
}

const backendUrl = "http://127.0.0.1:8000";

const Listings: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn, userId } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [watchlist, setWatchlist] = useState<number[]>([]);
  const [imageIndexes, setImageIndexes] = useState<Record<string | number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loggedIn = !!isSignedIn;

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/listings/`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Fetched data:", data); // Debug: Check what data is coming from API

        if (!Array.isArray(data)) {
          throw new Error('Invalid data format');
        }

        setListings(data);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setError('Failed to load listings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleClick = (id: number | string) => {
    navigate(`/listing/${id}`);
  };

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!loggedIn || !userId) return;
      try {
        const { getToken } = useAuth();
        const token = await getToken({ template: 'micasa' });
        const response = await fetch(`${backendUrl}/api/wishlist/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setWatchlist(data.map((item: { l_id: number }) => item.l_id));
        }
      } catch (err) {
        console.error('Error fetching watchlist:', err);
      }
    };
    fetchWatchlist();
  }, [loggedIn, userId]);

  const handleNextImage = (id: number | string, e: React.MouseEvent) => {
    e.stopPropagation();
    const listing = listings.find((listing) => listing.l_id === id);
    if (!listing || !Array.isArray(listing.image_urls) || listing.image_urls.length === 0) return;

    setImageIndexes((prev) => ({
      ...prev,
      [id]: ((prev[id] || 0) + 1) % listing.image_urls.length,
    }));
  };

  const handlePrevImage = (id: number | string, e: React.MouseEvent) => {
    e.stopPropagation();
    const listing = listings.find((listing) => listing.l_id === id);
    if (!listing || !Array.isArray(listing.image_urls) || listing.image_urls.length === 0) return;

    setImageIndexes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) === 0 ? listing.image_urls.length - 1 : (prev[id] || 0) - 1,
    }));
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <p className="text-center text-red-500">{error}</p>;


  const handleLike = async (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!loggedIn) {
      alert('Please log in to like a listing.');
      navigate('/login');
      return;
    }

    try {
      const { getToken } = useAuth();
      const token = await getToken({ template: 'micasa' });
      const response = await fetch(`${backendUrl}/api/listings/${id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setListings((prevListings) =>
          prevListings.map((listing) =>
            listing.l_id === id ? { ...listing, likes: listing.likes + 1 } : listing
          )
        );
      }
    } catch (err) {
      console.error('Error liking listing:', err);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {listings.length > 0 ? (
          listings.map((listing) => (
            <div
              key={listing.l_id}
              className="relative border rounded-lg overflow-hidden shadow-md cursor-pointer group"
              onClick={() => handleClick(listing.l_id)}
            >
              {/* Image - now using direct URL from API */}
              {listing.image_urls && listing.image_urls.length > 0 ? (
                <img
                  src={listing.image_urls[imageIndexes[listing.l_id] || 0]}
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                  style={{ height: '300px', width: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    console.error("Image loading error:", e);
                    (e.target as HTMLImageElement).src = "/placeholder.jpg";
                  }}
                />
              ) : (
                <img
                  src="backend/public/default-avatar.jpeg"
                  alt="No image available"
                  className="w-full h-48 object-cover"
                  style={{ height: '300px', width: '100%', objectFit: 'cover' }}
                />
              )}
              
              {/* Navigation Buttons */}
              {listing.image_urls && listing.image_urls.length > 1 && (
                <>
                  <button 
                    onClick={(e) => handlePrevImage(listing.l_id, e)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-gray-500 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition duration-300 hover:bg-gray-300"
                  >
                    <FaAngleLeft />
                  </button>
                  <button 
                    onClick={(e) => handleNextImage(listing.l_id, e)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gray-500 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition duration-300 hover:bg-gray-300"
                  >
                    <FaAngleRight />
                  </button>
                </>
              )}

              {/* Image Progress Indicator */}
              {listing.image_urls && listing.image_urls.length > 1 && (
                <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {listing.image_urls
                    .slice(
                      Math.max(0, (imageIndexes[listing.l_id] || 0) - 2),
                      Math.min(listing.image_urls.length, (imageIndexes[listing.l_id] || 0) + 4)
                    )
                    .map((_, index) => {
                      const actualIndex = Math.max(0, (imageIndexes[listing.l_id] || 0) - 2) + index;
                      const isActive = actualIndex === (imageIndexes[listing.l_id] || 0);
                      const fadeClass = (index === 0 || index === 5) ? 'opacity-50' : 'opacity-100';

                      return (
                        <div
                          key={actualIndex}
                          className={`w-2 h-2 rounded-full ${isActive ? 'bg-yellow-500' : 'bg-gray-400'} ${fadeClass} transition-opacity duration-300`}
                        ></div>
                      );
                    })}
                </div>
              )}

              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800">{listing.title}</h2>
                <p className="text-gray-600">{listing.location}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-primary font-bold">{listing.price} pm</span>
                  <span className="text-gray-600">⭐ {listing.rating}</span>
                </div>
              </div>

              {/* Like Button */}
              <button
                className={`absolute top-2 right-2 text-white hover:bg-amber-500 rounded-full p-3 transition duration-300 ${
                  watchlist.includes(Number(listing.l_id))
                    ? 'bg-yellow-500'
                    : 'bg-gray-400 hover:bg-yellow-500'
                }`}
                onClick={(e) => handleLike(listing.l_id, e)}
              >
                <FaHeart />
              </button>
            </div>
          ))
        ) : (
          <p className="text-center col-span-4">No listings available</p>
        )}
      </div>
    </div>
  );
 };

export default Listings;