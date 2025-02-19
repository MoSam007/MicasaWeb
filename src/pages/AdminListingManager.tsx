import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface IListing {
  l_id: number;
  title: string;
  location: string;
  price: string;
  rating: number;
  imageUrls: string[];
  description: string;
  amenities: string[];
}

const AdminListingManager: React.FC = () => {
  const [listings, setListings] = useState<IListing[]>([]);
  const [viewStyle, setViewStyle] = useState<'row' | 'column'>('row');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch listings from the backend
    async function fetchListings() {
      const response = await fetch('http://localhost:5000/api/listings');
      const data = await response.json();
      setListings(data);
    }
    fetchListings();
  }, []);

  const handleListingClick = (l_id: number) => {
    navigate(`/admin/listings/${l_id}`);
  };
  
  const backendUrl = "http://localhost:5000";
  
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Listing Manager</h2>
      <button
        onClick={() => setViewStyle(viewStyle === 'row' ? 'column' : 'row')}
        className="mb-4 p-2 bg-blue-500 text-white rounded"
      >
        Toggle View
      </button>
      <div className={`grid ${viewStyle === 'row' ? 'md:grid-cols-2' : 'grid-cols-4'} gap-4`}>
        {listings.map((listing) => (
          <div
            key={listing.l_id}
            className="border p-4 rounded cursor-pointer hover:shadow-lg"
            onClick={() => handleListingClick(listing.l_id)}
          >
            <img src={`${backendUrl}/uploads/${listing.imageUrls[0]}`} alt={listing.title} className="w-full h-48 object-cover mb-2" />
            <h3 className="text-lg font-bold">{listing.title}</h3>
            <p>{listing.location}</p>
            <p>{listing.price}</p>
            <p>Rating: {listing.rating}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminListingManager;
