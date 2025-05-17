import React from 'react';
import { motion } from 'framer-motion';
import Image1 from '../../images/image1.jpg';
import Image2 from '../../images/image2.jpg';
import Image3 from '../../images/image3.jpg';

const About: React.FC = () => {
  return (
    <>
      {/* Hero Section with Glassmorphism and Animated Blobs */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-tr from-yellow-300 via-pink-300 to-purple-400">
        {/* Animated blobs */}
        <div className="absolute w-full h-full overflow-hidden">
          <div className="absolute top-0 left-0 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
        </div>

        {/* Glass card */}
        <motion.div 
          className="relative z-10 bg-white bg-opacity-10 backdrop-blur-md rounded-3xl shadow-2xl p-10 max-w-2xl text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-white text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">Welcome to MiCasa</h1>
          <p className="text-white text-lg md:text-xl font-light drop-shadow-sm mb-6">
            Your modern house-hunting platform with immersive 3D tours and seamless moving services. Discover. Decide. Move.
          </p>
          <button className="bg-white text-gray-800 px-8 py-3 rounded-full font-semibold shadow-md hover:bg-opacity-90 transition">
            Get Started
          </button>
        </motion.div>
      </section>

      {/* Main About Content */}
      <section className="container mx-auto px-6 py-20 space-y-28">
        {/* Section 1 */}
        <motion.div 
          className="flex flex-col md:flex-row items-center gap-10"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img src={Image1} alt="Home search" className="w-full md:w-1/2 rounded-3xl shadow-xl object-cover" />
          <div className="text-center md:text-left md:w-1/2 space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800">About MiCasa</h2>
            <p className="text-lg md:text-xl text-gray-600">
              MiCasa is revolutionizing the way people find homes. From detailed listings to 3D virtual tours, we empower you to explore your next space from anywhere, anytime.
            </p>
            <button className="bg-black text-white px-6 py-3 rounded-full shadow-md hover:bg-gray-900 transition">Explore Listings</button>
          </div>
        </motion.div>

        {/* Section 2 */}
        <motion.div 
          className="flex flex-col md:flex-row-reverse items-center gap-10"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img src={Image2} alt="Effortless move" className="w-full md:w-1/2 rounded-3xl shadow-xl object-cover" />
          <div className="text-center md:text-left md:w-1/2 space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800">Effortless Moving</h2>
            <p className="text-lg md:text-xl text-gray-600">
              Found your dream home? MiCasa makes moving stress-free with trusted movers, scheduling tools, and everything you need for a smooth transition.
            </p>
            <button className="bg-black text-white px-6 py-3 rounded-full shadow-md hover:bg-gray-900 transition">Book a Mover</button>
          </div>
        </motion.div>

        {/* Section 3 */}
        <motion.div 
          className="flex flex-col md:flex-row items-center gap-10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img src={Image3} alt="Future vision" className="w-full md:w-1/2 rounded-3xl shadow-xl object-cover" />
          <div className="text-center md:text-left md:w-1/2 space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800">Our Vision</h2>
            <p className="text-lg md:text-xl text-gray-600">
              We’re building the future of real estate – a platform that combines technology, convenience, and trust to help you move smarter and live better.
            </p>
            <button className="bg-black text-white px-6 py-3 rounded-full shadow-md hover:bg-gray-900 transition">Join the Journey</button>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default About;
