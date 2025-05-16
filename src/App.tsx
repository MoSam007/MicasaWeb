import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import ProtectedRoute from './components/protectedRoutes';
import NavigationRouter from './navigation/NavigationRouter';
import Footer from './components/Footer';

// Pages
import Home from './pages/Listings';
import Login from './pages/Login';
import Register from './pages/Register';
import Listings from './pages/Listings';
import ListingDetails from './pages/ListingDetail';
import Wishlist from './pages/Wishlist';
import OwnerDashboard from './pages/AdminListingManager';
import AddListing from './pages/AddListingForm';
import ManageListings from './pages/AdminListingDetail';
import MoverDashboard from './pages/MoverHome';
import MovingServices from './pages/MoverHome';
import AdminDashboard from './pages/AdminListingManager';
import UserManagement from './pages/AddListingForm';
import Gallery from './pages/Gallery';
import About from './pages/About';
import NotFound from './pages/FAQ';
import SelectRole from './pages/SelectRole';

import './App.css';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <Router>
        <div className="App">
          <NavigationRouter />
          <main className="min-h-screen bg-gray-50">
            <Routes>

              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Role Selection after signup */}
              <Route path="/select-role" element={<SelectRole />} />

              {/* Listing detail */}
              <Route
                path="/listing/:l_id"
                element={
                  <ProtectedRoute allowedRoles={['hunter', 'owner', 'mover', 'admin']} requireAuth={true}>
                    <ListingDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/listing/:l_id/gallery"
                element={
                  <ProtectedRoute requireAuth={true}>
                    <Gallery />
                  </ProtectedRoute>
                }
              />

              {/* House Hunter Routes */}
              <Route
                path="/listings"
                element={
                  <ProtectedRoute allowedRoles={['hunter', 'admin']}>
                    <Listings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute allowedRoles={['hunter', 'admin']}>
                    <Wishlist />
                  </ProtectedRoute>
                }
              />

              {/* Property Owner Routes */}
              <Route
                path="/my-listings"
                element={
                  <ProtectedRoute allowedRoles={['owner', 'admin']}>
                    <OwnerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-listing"
                element={
                  <ProtectedRoute allowedRoles={['owner', 'admin']}>
                    <AddListing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/listings"
                element={
                  <ProtectedRoute allowedRoles={['owner', 'admin']}>
                    <ManageListings />
                  </ProtectedRoute>
                }
              />

              {/* Mover Routes */}
              <Route
                path="/moving-services"
                element={
                  <ProtectedRoute allowedRoles={['mover', 'admin']}>
                    <MoverDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobs"
                element={
                  <ProtectedRoute allowedRoles={['mover', 'admin']}>
                    <MovingServices />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />

              {/* Fallback 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ClerkProvider>
  );
}

export default App;
