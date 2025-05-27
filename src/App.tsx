import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/ClerkauthContext';
import NavigationRouter from './navigation/NavigationRouter';
import ProtectedRoute from './components/protectedRoutes';
import Footer from './components/Footer';

// Pages
import Home from './pages/Listings';
import CustomSignIn from './pages/Public/CustomSignIn';
import CustomSignUp from './pages/Public/CustomSignUp';
import EmailVerification from './pages/Public/VerifyEmail'; 
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
import MoverSettings from './pages/Movers/MoverSettings';
import MovingJobs from './pages/Movers/MovingJobs';
import MoverAnalytics from './pages/Movers/MoverAnalytics';

import './App.css';
import OwnerSidebar from './navigation/OwnerSidebar';

function App() {
  return (
    <AuthProvider>
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
                  <CustomSignIn />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <CustomSignUp />
                </ProtectedRoute>
              } 
            />
            {/* Email verification route */}
            <Route 
              path="/register/verify-email-address" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <EmailVerification />
                </ProtectedRoute>
              } 
            />
            {/* <Route 
              path="/settings" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <Default Settings />
                </ProtectedRoute>
              } 
            /> 
            //make sure to implement*/}
            <Route path="/about" element={<About />} />

            {/* Listing detail */}
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
              path="/listing/:l_id/gallery"
              element={
                <ProtectedRoute requireAuth={false}>
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
                  <OwnerSidebar isDarkMode={false} toggleDarkMode={() => {}} />
                  <OwnerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/add-listing" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin']}>
                  <OwnerSidebar isDarkMode={false} toggleDarkMode={() => {}} />
                  <AddListing />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/listings" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin']}>
                  <OwnerSidebar isDarkMode={false} toggleDarkMode={() => {}} />
                  <ManageListings />
                </ProtectedRoute>
              } 
            />

            // You might also want to add routes for owner-analytics and owner-settings:
            <Route 
              path="/owner-analytics" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin']}>
                  <OwnerSidebar isDarkMode={false} toggleDarkMode={() => {}} />
                  {/* Create OwnerAnalytics component */}
                  <div>Owner Analytics Coming Soon</div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/owner-settings" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin']}>
                  <OwnerSidebar isDarkMode={false} toggleDarkMode={() => {}} />
                  {/* Create OwnerSettings component */}
                  <div>Owner Settings Coming Soon</div>
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
            <Route 
              path="/mover-settings" 
              element={
                <ProtectedRoute allowedRoles={['mover', 'admin']}>
                  <MoverSettings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mover-analytics" 
              element={
                <ProtectedRoute allowedRoles={['mover', 'admin']}>
                  <MoverAnalytics />
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
    </AuthProvider>
  );
}

export default App;