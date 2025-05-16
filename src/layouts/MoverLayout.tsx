import React from 'react';

interface MoverLayoutProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  children: React.ReactNode;
}

const MoverLayout: React.FC<MoverLayoutProps> = ({ isDarkMode, toggleDarkMode, children }) => {
  return (
    <div className={isDarkMode ? 'dark-mode' : 'light-mode'}>
      <header>
        <button onClick={toggleDarkMode}>
          {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default MoverLayout;