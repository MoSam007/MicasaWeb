import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

interface IListing {
  imageUrls: string[];
}

const Gallery: React.FC = () => {
  const { l_id } = useParams<{ l_id: string }>();
  const [listing, setListing] = useState<IListing | null>(null);
  const backendUrl = "http://localhost:5000";

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/listings/${l_id}`);
        const data = await response.json();
        setListing(data);
      } catch (error) {
        console.error("Error fetching listing:", error);
      }
    };

    fetchListing();
  }, [l_id]);

  if (!listing) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-6 py-8">
      <Link to={`/listing/${l_id}`} className="text-blue-600 mb-4 block">
        Back to listing
      </Link>
      <h1 className="text-2xl font-semibold mb-6">All Photos</h1>
      <div className="grid grid-cols-3 gap-4">
        {listing.imageUrls.map((url, index) => (
          <img
            key={index}
            src={`${backendUrl}/uploads/${url}`}
            alt={`Gallery ${index + 1}`}
            className="w-full h-64 object-cover rounded-lg"
          />
        ))}
      </div>
    </div>
  );
};

export default Gallery;
