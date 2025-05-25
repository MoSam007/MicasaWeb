import React from 'react';
import { useAuth } from '../auth/authContext';
import HunterNavigation from '../navigation/HunterNavigation';
import OwnerNavigation from '../navigation/OwnerNavigation';
import MoverNavigation from '../navigation/MoverNavigation';
import DefaultNavigation from '../navigation/DefaultNavigation';

const Navigation: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  if (loading) {
    return (
      <div className="h-16 bg-white shadow-sm flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  // Render different navigation based on user role
  switch (currentUser?.role) {
    case 'hunter':
      return <HunterNavigation />;
    case 'owner':
      return <OwnerNavigation isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />;
    case 'mover':
      return <MoverNavigation />;
    default:
      return <DefaultNavigation />;
  }
};

export default Navigation;