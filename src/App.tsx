import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/authContext';
import NavigationRouter from './navigation/NavigationRouter';
import ProtectedRoute from './components/protectedRoutes';
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
import NotFound from './pages/FAQ';

import './App.css';

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
              <Route 
                path="/listing/:l_id" 
                element={
                  <ProtectedRoute allowedRoles={['hunter', 'owner', 'mover', 'admin']} requireAuth={false}>
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
                path="/listing/:l_id" 
                element={
                  <ProtectedRoute allowedRoles={['hunter', 'owner', 'mover', 'admin']} requireAuth={false}>
                    <ListingDetails />
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