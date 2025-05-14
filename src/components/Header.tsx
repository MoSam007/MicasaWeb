import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-primary">
          MiCasa
        </div>
        <div className="space-x-4">
          <button className="text-gray-700">Home</button>
          <button className="text-gray-700">Rent</button>
          <button className="text-gray-700">Buy</button>
          <button className="text-gray-700">Contact</button>
          <button className="text-gray-700">Sign In</button>
          <button className="text-gray-700">Add Listing</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
