import React, { useState } from 'react';
import { IListing } from '../types';


interface UpdateListingFormProps {
  listing: IListing;
  onUpdate: (updatedListing: IListing) => void;
}

const UpdateListingForm: React.FC<UpdateListingFormProps> = ({ listing, onUpdate }) => {
  const [title, setTitle] = useState(listing.title);
  const [location, setLocation] = useState(listing.location);
  const [price, setPrice] = useState(listing.price);
  const [description, setDescription] = useState(listing.description);
  const [amenities, setAmenities] = useState(listing.amenities);
  const [imageUrls, setImageUrls] = useState(listing.imageUrls); // Only filenames, not paths
  const [newImages, setNewImages] = useState<File[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Upload new images and get filenames
    const uploadedFilenames: string[] = [];
    for (const file of newImages) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await fetch(`http://localhost:5000/api/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (data.filename) {
          uploadedFilenames.push(data.filename); // Store only filename, not full path
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    // Update imageUrls to include newly uploaded filenames
    const updatedImageUrls = [...imageUrls, ...uploadedFilenames];

    onUpdate({
      ...listing,
      title,
      location,
      price,
      description,
      amenities,
      imageUrls: updatedImageUrls, // Only filenames, no path
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="mb-2 p-2 border w-full"
      />
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location"
        className="mb-2 p-2 border w-full"
      />
      <input
        type="text"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price"
        className="mb-2 p-2 border w-full"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="mb-2 p-2 border w-full"
      />
      <input
        type="text"
        value={amenities.join(', ')}
        onChange={(e) => setAmenities(e.target.value.split(', '))}
        placeholder="Amenities (comma separated)"
        className="mb-2 p-2 border w-full"
      />
      <input
        type="file"
        multiple
        onChange={handleImageChange}
        className="mb-2 p-2 border w-full"
      />
      <button type="submit" className="p-2 bg-blue-500 text-white">
        Update Listing
      </button>
    </form>
  );
};

export default UpdateListingForm;
