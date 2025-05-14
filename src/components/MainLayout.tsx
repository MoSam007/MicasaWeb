import React, { useState, useEffect } from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
  navigation: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, navigation }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 
        ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}
      >
        {navigation}
      </div>
      <main className="pt-16">{children}</main>
    </div>
  );
};

export default MainLayout;