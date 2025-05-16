import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/authContext';
import NavigationRouter from './navigation/NavigationRouter';
import ProtectedRoute from './components/protectedRoutes';
import Footer from './components/Footer';

// Pages
import Home from './pages/Listings';
import Login from './pages/Public/Login';
import Register from './pages/Public/Register';
import Listings from './pages/Listings';
import ListingDetails from './pages/ListingDetail';
import Wishlist from './pages/Hunters/Wishlist';
import OwnerDashboard from './pages/Owners/AdminListingManager';
import AddListing from './pages/Owners/AddListingForm';
import ManageListings from './pages/Owners/AdminListingDetail';
import MoverDashboard from './navigation/MoverSidebar';
import MovingServices from './pages/Movers/MoverHome';
import AdminDashboard from './pages/Owners/AdminListingManager';
import UserManagement from './pages/Owners/AddListingForm';
import Gallery from './pages/Gallery';
import About from './pages/Public/About';
import NotFound from './pages/Public/FAQ';

import './App.css';
import MovingJobs from './pages/Movers/MovingJobs';
import MoverHome from './pages/Movers/MoverHome';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <NavigationRouter />
          <main className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route 
                path="/login" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Login />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Register />
                  </ProtectedRoute>
                } 
              />
              <Route path="/about" element={<About />} />
              
              {/* Listing detail - combined route for all users */}
              <Route 
                path="/listing/:l_id" 
                element={
                  <ProtectedRoute allowedRoles={['hunter', 'owner', 'mover', 'admin']} requireAuth={true}>
                    <ListingDetails />
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
                path="/listing/:l_id/gallery"
                element={
                  <ProtectedRoute requireAuth={true}>
                    <Gallery />
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
                path="/mover-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['mover', 'admin']}>
                    <MoverDashboard isDarkMode={false} toggleDarkMode={() => {}} />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/moving-services" 
                element={
                  <ProtectedRoute allowedRoles={['mover', 'admin']}>
                    <MovingServices />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/jobs" 
                element={
                  <ProtectedRoute allowedRoles={['mover', 'admin']}>
                    <MovingJobs />
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
              
              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;