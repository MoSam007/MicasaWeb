import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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

const AdminListingDetail: React.FC = () => {
  const { l_id } = useParams<{ l_id: string }>();
  const [listing, setListing] = useState<IListing | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const navigate = useNavigate();

  const backendUrl = "http://localhost:5000";

  useEffect(() => {
    // Fetch the specific listing
    async function fetchListing() {
      const response = await fetch(`${backendUrl}/api/listings/${l_id}`);
      if (response.ok) {
        const data = await response.json();
        setListing(data);
      } else {
        setNotification("Failed to load listing");
      }
    }
    fetchListing();
  }, [l_id]);

  const handleImageSelect = (image: string) => {
    setSelectedImages((prev) =>
      prev.includes(image) ? prev.filter((img) => img !== image) : [...prev, image]
    );
  };

  const handleImageDelete = () => {
    if (listing) {
      setListing({
        ...listing,
        imageUrls: listing.imageUrls.filter((img) => !selectedImages.includes(img)),
      });
      setSelectedImages([]);
      setNotification("Selected images removed successfully");
    }
  };

  const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages(Array.from(e.target.files));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string | string[] } }) => {
    if (listing) {
      const { name, value } = e.target;
      setListing({
        ...listing,
        [name]: name === 'amenities' && typeof value === 'string' ? value.split(',') : value,
      });
    }
  };
  
  const handleSubmit = async () => {
    if (!listing) return;

    const formData = new FormData();
    formData.append("title", listing.title);
    formData.append("location", listing.location);
    formData.append("price", listing.price);
    formData.append("rating", listing.rating.toString());
    formData.append("description", listing.description);
    formData.append("amenities", listing.amenities.join(','));

    // Append new images to FormData
    newImages.forEach((image) => formData.append("newImages", image));
    // Append remaining image URLs
    listing.imageUrls.forEach((url) => formData.append("imageUrls", url));

    try {
      const response = await fetch(`${backendUrl}/api/listings/${l_id}`, {
        method: 'PUT',
        body: formData,
      });
      if (response.ok) {
        setNotification("Listing updated successfully!");
      } else {
        throw new Error("Failed to update listing");
      }
    } catch (error) {
      setNotification("Error updating listing");
    }
  };

  const handleDeleteListing = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/listings/${l_id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setNotification("Listing deleted successfully!");
        navigate('/admin/listings');
      } else {
        throw new Error("Failed to delete listing");
      }
    } catch (error) {
      setNotification("Error deleting listing");
    }
  };

  if (!listing) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{listing.title}</h2>
      {notification && <div className="bg-green-200 p-2 rounded mb-4">{notification}</div>}

      {/* Gallery for existing images */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
        {listing.imageUrls.map((url) => (
          <div key={url} className="relative">
            <img
              src={`${backendUrl}/uploads/${url}`}
              alt=""
              className={`w-full h-32 object-cover rounded ${
                selectedImages.includes(url) ? "border-4 border-red-500" : "border"
              }`}
              onClick={() => handleImageSelect(url)}
            />
          </div>
        ))}
      </div>
      {selectedImages.length > 0 && (
        <button onClick={handleImageDelete} className="p-2 bg-red-500 text-white rounded mb-4">
          Delete Selected Images
        </button>
      )}

      {/* Form to edit listing details */}
      <input
        type="text"
        name="title"
        value={listing.title}
        onChange={handleInputChange}
        className="block w-full mb-2 p-2 border"
        placeholder="Title"
      />
      <input
        type="text"
        name="location"
        value={listing.location}
        onChange={handleInputChange}
        className="block w-full mb-2 p-2 border"
        placeholder="Location"
      />
      <input
        type="text"
        name="price"
        value={listing.price}
        onChange={handleInputChange}
        className="block w-full mb-2 p-2 border"
        placeholder="Price"
      />
      <textarea
        name="description"
        value={listing.description}
        onChange={handleInputChange}
        className="block w-full mb-2 p-2 border"
        placeholder="Description"
      />
      <input
        type="text"
        name="amenities"
        value={listing.amenities.join(', ')}
        onChange={(e) => handleInputChange({ ...e, target: { name: 'amenities', value: e.target.value.split(',') } })}
        className="block w-full mb-2 p-2 border"
        placeholder="Amenities (comma-separated)"
      />

      {/* New images upload */}
      <input type="file" multiple onChange={handleNewImageUpload} className="mb-4" />

      <div className="mt-4">
        <button onClick={handleSubmit} className="p-2 bg-blue-500 text-white rounded mr-2">
          Update Listing
        </button>
        <button onClick={handleDeleteListing} className="p-2 bg-red-500 text-white rounded mr-2">
          Delete Listing
        </button>
        <button onClick={() => navigate('/admin/listings')} className="p-2 bg-gray-500 text-white rounded">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AdminListingDetail;
