import React from 'react';
import { useAuth } from '../auth/authContext';
import DefaultNavigation from './DefaultNavigation';
import HunterNavigation from './HunterNavigation';
import OwnerNavigation from './OwnerNavigation';
import MoverNavigation from './MoverNavigation';
import AdminNavigation from './AdminNavigation'; 

const NavigationRouter: React.FC = () => {
  const { currentUser, userRole } = useAuth();
  
  console.log("NavigationRouter - currentUser:", currentUser?.email, "userRole:", userRole);

  // Not logged in or no role information
  if (!currentUser || !userRole) {
    return <DefaultNavigation />;
  }

  // Render navigation based on user role
  switch (userRole) {
    case 'hunter':
      return <HunterNavigation />;
    case 'owner':
      return <OwnerNavigation />;
    case 'mover':
      return <MoverNavigation />;
    case 'admin':
      return <AdminNavigation />; // You'll need to create this component
    default:
      console.log("NavigationRouter - Falling back to DefaultNavigation (unknown role)");
      return <DefaultNavigation />;
  }
};

export default NavigationRouter;