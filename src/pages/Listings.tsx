import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import {FaHeart, FaAngleLeft , FaAngleRight} from 'react-icons/fa';

interface Listing {
  l_id: string | number;
  title: string;
  description: string;
  location: string;
  price: string;
  rating: number;
  imageUrls: string[];
  amenities: string[];
  likes: number;
}

const Listings: React.FC = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [watchlist, setWatchlist] = useState<number[]>([]);
  const [imageIndexes, setImageIndexes] = useState<Record<string | number, number>>({});
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/listings');
        const data = await response.json();
        setListings(data);
      } catch (error) {
        console.error('Error fetching listings:', error);
      }
    };
    fetchListings();
  }, []);

  const handleClick = (id: number | string) => {
    navigate(`/listing/${id}`);
  };

  const toggleWatchlist = (id: number | string) => {
    const updatedWatchlist = watchlist.includes(Number(id))
      ? watchlist.filter(item => item !== Number(id))
      : [...watchlist, Number(id)];

    setWatchlist(updatedWatchlist);

    if (updatedWatchlist.includes(Number(id))) {
      alert('Listing added to watchlist');
    } else {
      alert('Listing removed from watchlist');
    }
  };

  const handleNextImage = (id: number | string) => {
    const listing = listings.find((listing) => listing.l_id === id);
    if (!listing || !listing.imageUrls) return; // Safety check

    setImageIndexes((prev) => ({
      ...prev,
      [id]: ((prev[id] || 0) + 1) % listing.imageUrls.length,
    }));
  };

  const handlePrevImage = (id: number | string) => {
    const listing = listings.find((listing) => listing.l_id === id);
    if (!listing || !listing.imageUrls) return; // Safety check

    setImageIndexes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) === 0 ? listing.imageUrls.length - 1 : (prev[id] || 0) - 1,
    }));
  };

  const backendUrl = "http://localhost:5000";
  const handleWishlist = (id: string | number) => {
    if (!loggedIn) {
      alert('Please log in to add this listing to your wishlist.');
      return;
    }
    console.log(`Wishlist action for listing ID: ${id}`);
    // Add backend integration for wishlist
  };

  const handleLike = async (id: string | number) => {
    if (!loggedIn) {
      alert('Please log in to like a listing.');
      return;
    }
    try {
      const response = await fetch(`http://${backendUrl}/api/listings/${id}/like`, {
        method: 'POST',
      });
      if (response.ok) {
        setListings((prevListings) =>
          prevListings.map((listing) =>
            listing.l_id === id ? { ...listing, likes: listing.likes + 1 } : listing
          )
        );
      }
    } catch (error) {
      console.error('Error liking listing:', error);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {listings.map((listing) => (
          <div
            key={listing.l_id}
            className="relative border rounded-lg overflow-hidden shadow-md cursor-pointer group"
            onClick={() => handleClick(listing.l_id)}
          >
            {/* Image */}
            <img
              src={`${backendUrl}/uploads/${listing.imageUrls[imageIndexes[listing.l_id] || 0]}`}
              alt={listing.title}
              className="w-full h-48 object-cover"
              style={{ height: '300px', width: '100%', objectFit: 'cover' }}
            />
            
            {/* Navigation Buttons */}
            <button 
              onClick={(e) => { e.stopPropagation(); handlePrevImage(listing.l_id); }}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-gray-500 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition duration-300 hover:bg-gray-300"
            >
              <FaAngleLeft> </FaAngleLeft>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleNextImage(listing.l_id); }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gray-500 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition duration-300 hover:bg-gray-300"
            >
              <FaAngleRight> </FaAngleRight>
            </button>

            {/* Image Progress Indicator */}
            <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {listing.imageUrls.slice(
                Math.max(0, (imageIndexes[listing.l_id] || 0) - 2),
                Math.min(listing.imageUrls.length, (imageIndexes[listing.l_id] || 0) + 4)
              ).map((_, index) => {
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
              onClick={(e) => {
                e.stopPropagation();
                handleLike(listing.l_id);
              }}
            >
              <FaHeart> </FaHeart>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Listings;
