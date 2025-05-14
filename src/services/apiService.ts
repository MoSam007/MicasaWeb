export const fetchListings = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/listings`);
    if (!response.ok) {
      throw new Error('Failed to fetch listings');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }
};

export const fetchListingById = async (id: string) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/listings/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch listing with ID ${id}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching listing:', error);
    throw error;
  }
};

export const addListing = async (listingData: { title: string; description: string; price: string, location: string, rating: number, imageUrls: string[] }) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listingData),
    });

    if (!response.ok) {
      throw new Error('Failed to add listing');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding listing:', error);
    throw error;
  }
};
