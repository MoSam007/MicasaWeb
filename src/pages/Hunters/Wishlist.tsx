import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/authContext';
import { FaHeart, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

interface WishlistItem {
  l_id: number;
  title: string;
  price: string;
  location: string;
  image_urls: string[];
}

const Wishlist: React.FC = () => {
  const { currentUser } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlistItems();
  }, []);

  const fetchWishlistItems = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${await currentUser?.getIdToken()}`
        }
      });
      const data = await response.json();
      setWishlistItems(data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (listingId: number) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/wishlist/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await currentUser?.getIdToken()}`
        }
      });
      setWishlistItems(prev => prev.filter(item => item.l_id !== listingId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          My Wishlist
          <span className="ml-2 text-sm text-gray-500">
            ({wishlistItems.length} items)
          </span>
        </h1>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <FaHeart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-gray-500 mb-4">
            Start browsing and save your favorite properties
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
          >
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.l_id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <Link to={`/listing/${item.l_id}`}>
                <img
                  src={`http://127.0.0.1:8000/uploads/${item.image_urls[0]}`}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              </Link>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 mb-2">{item.location}</p>
                <p className="text-yellow-600 font-bold mb-4">{item.price}</p>
                <div className="flex justify-between items-center">
                  <Link
                    to={`/listing/${item.l_id}`}
                    className="text-yellow-600 hover:text-yellow-700 font-medium"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(item.l_id)}
                    className="text-red-500 hover:text-red-600"
                    title="Remove from wishlist"
                  >
                    <FaTrash className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;