import React from 'react';
import { useAuth } from '../auth/ClerkauthContext';
import DefaultNavigation from './DefaultNavigation';
import HunterNavigation from './HunterNavigation';
import AdminNavigation from './AdminNavigation'; 
import MoverSidebar from './MoverSidebar';
import OwnerSidebar from './OwnerSidebar';

const NavigationRouter: React.FC = () => {
  const { isSignedIn, userRole, isLoaded } = useAuth();
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  
  console.log("NavigationRouter - User signed in:", isSignedIn, "userRole:", userRole);

  // Show loading state while auth is initializing
  if (!isLoaded) {
    return (
      <div className="h-16 bg-white shadow-sm flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  // Not logged in or no role information
  if (!isSignedIn || !userRole) {
    return <DefaultNavigation />;
  }

  // Render navigation based on user role
  switch (userRole) {
    case 'hunter':
      return <HunterNavigation />;
    case 'owner':
      return <OwnerSidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;
    case 'mover':
      return <MoverSidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;
    case 'admin':
      return <AdminNavigation />; 
    default:
      console.log("NavigationRouter - Falling back to DefaultNavigation (unknown role)");
      return <DefaultNavigation />;
  }
};

export default NavigationRouter;