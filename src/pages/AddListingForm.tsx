import React, { useState } from 'react';

const AddListingForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState<number | ''>(''); 
  const [amenities, setAmenities] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Define state variables for success and error messages
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('location', location);
    formData.append('price', price.toString());
    formData.append('description', description);
    formData.append('rating', rating.toString());
    formData.append('amenities', amenities); 
    imageFiles.forEach((file) => formData.append('images', file));

    try {
      const response = await fetch('http://localhost:5000/api/listings', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSuccess(true);
        setError(''); 
        alert('Listing added successfully');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error adding listing');
        setSuccess(false);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('An unexpected error occurred');
      setSuccess(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">Add a New Listing</h1>
      {success && <p className="text-green-600">Listing added successfully!</p>}
      {error && <p className="text-red-600">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Location:</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Price:</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value ? parseFloat(e.target.value) : '')}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Rating:</label>
          <input
            type="number"
            value={rating}
            onChange={(e) => setRating(e.target.value ? parseFloat(e.target.value) : '')}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Amenities:</label>
          <input
            type="text"
            placeholder="Amenities (comma separated)"
            value={amenities}
            onChange={(e) => setAmenities(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Images:</label>
          <input
            type="file"
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          Add Listing
        </button>
      </form>
    </div>
  );
};

export default AddListingForm;
