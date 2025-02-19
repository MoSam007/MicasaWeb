import React from 'react';
import { FaInstagram, FaFacebook, FaTwitter, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import logo from '../images/MiCasa.png';

const Footer: React.FC = () => (
  <footer className="bg-gray-200 text-gray-600 py-8 w-full">
    <div className="container mx-auto px-4 flex flex-wrap justify-between items-start">
      {/* Logo and Creator Section */}
      <div className="w-full sm:w-1/2 md:w-1/4 mb-4 sm:mb-0 text-center sm:text-left">
        <img src={logo} alt="MiCasa Logo" className="h-16 mb-2 mx-auto sm:mx-0" />
        <h2 className="font-bold text-xl text-primary mb-2">MiCasa</h2>
        <p>&copy; 2024 MiCasa. All rights reserved.</p>
        <p>
          Created by{' '}
          <a href="mailto:samato.moma@gmail.com" className="underline hover:text-primary">
            samato.moma@gmail.com
          </a>
        </p>
      </div>
      {/* Contact Section */}
      <div className="w-full sm:w-1/2 md:w-1/4 mb-4 sm:mb-0 text-center sm:text-left">
        <h3 className="font-bold mb-2">Contact</h3>
        <p>Phone: +254769965087</p>
        <p>Phone: +254757336398</p>
        <p>
          Email:{' '}
          <a href="mailto:info@mysite.com" className="underline hover:text-primary">
            info@mysite.com
          </a>
        </p>
        <p className="mt-4 text-center">
          <FaMapMarkerAlt />
          <a
            href="https://maps.google.com/?q=Kasarani Nairobi Kenya"
            className="underline hover:text-primary"
          >
            Nairobi, Kenya
          </a>
        </p>
      </div>
      {/* Working Hours Section */}
      <div className="w-full sm:w-1/2 md:w-1/4 mb-4 sm:mb-0 text-center sm:text-left">
        <h3 className="font-bold mb-2">Working Hours</h3>
        <p>Mon - Fri: 8am - 6pm</p>
        <p>Saturday: 9am - 1pm</p>
      </div>
      {/* Resources Section */}
      <div className="w-full sm:w-1/2 md:w-1/4 text-center sm:text-left">
        <h3 className="font-bold mb-2">Resources</h3>
        <p>
          <Link to="/locations" className="underline hover:text-primary">
            Locations
          </Link>
        </p>
        <p>
          <Link to="/tips" className="underline hover:text-primary">
            Tips
          </Link>
        </p>
        <p>
          <Link to="/faq" className="underline hover:text-primary">
            FAQs
          </Link>
        </p>
        <p>
          <Link to="/privacy-and-terms" className="underline hover:text-primary">
            Privacy & Terms
          </Link>
        </p>
        <div className="flex justify-center sm:justify-start mt-4 space-x-4">
          <a href="https://instagram.com" className="hover:text-primary">
            <FaInstagram size={24} />
          </a>
          <a href="https://facebook.com" className="hover:text-primary">
            <FaFacebook size={24} />
          </a>
          <a href="https://twitter.com" className="hover:text-primary">
            <FaTwitter size={24} />
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
