import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { AuthProvider } from './auth/authContext';
import Header from './components/Navigation';
import Footer from './components/Footer';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import Filters from './components/Filters';
import AddListingForm from './pages/AddListingForm';
import Contacts from './pages/Contact';
import Gallery from './pages/Gallery';
import AdminListingManager from './pages/AdminListingManager';
import AdminListingDetail from './pages/AdminListingDetail';
import UpdateListingForm from './components/UpdateListingForm';
import Login from './pages/Login';
import LoadingSkeleton from './components/LoadingSkeleton'; 
import { IListing } from './types';
import Register from './pages/Register';
import FAQ from './pages/FAQ';
import Profile from './components/Profile';
import Wishlist from './pages/Wishlist';

const App: React.FC = () => {
  const [listings, setListings] = useState<IListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<IListing[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    async function fetchListings() {
      setIsLoading(true); // Set loading state
      const response = await fetch('http://localhost:5000/api/listings');
      const data = await response.json();
      setListings(data);
      setFilteredListings(data);
      setIsLoading(false); // Loading complete
    }
    fetchListings();
  }, []);

  const handleUpdateListing = (updatedListing: IListing) => {
    setListings(prevListings =>
      prevListings.map(listing =>
        listing.l_id === updatedListing.l_id ? updatedListing : listing
      )
    );
  };

  const handleFilter = (filtered: IListing[]) => {
    setFilteredListings(filtered);
  };

  const UpdateListingWrapper = () => {
    const { l_id } = useParams<{ l_id: string }>();
    const listing = listings.find(listing => listing.l_id === Number(l_id));
    if (!listing) return <LoadingSkeleton />;
    return <UpdateListingForm listing={listing} onUpdate={handleUpdateListing} />;
  };

  return (
    <Router>
      <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <Filters listings={listings} onFilter={handleFilter} />

        <main className="flex-grow">
          {isLoading ? (
            <LoadingSkeleton /> // Show loader while fetching data
          ) : (
            <Routes>
              <Route path="/" element={<Listings />} />
              <Route path="/listing/:l_id" element={<ListingDetail />} />
              <Route path="/listing/:l_id/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contacts />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/wishlist" element={<Wishlist/>} />
              <Route path="/add-listing" element={<AddListingForm />} />
              <Route path="/admin/listings" element={<AdminListingManager />} />
              <Route path="/admin/listings/:l_id" element={<AdminListingDetail />} />
              <Route path="/admin/listings/:l_id/update" element={<UpdateListingWrapper />} />
            </Routes>
          )}
        </main>
        <Footer />
      </div>
     </AuthProvider> 
    </Router>
  );
};

export default App;
