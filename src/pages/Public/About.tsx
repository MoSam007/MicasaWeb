import React from 'react';
import Image1 from '../images/image1.jpg';
import Image2 from '../images/image2.jpg';
import Image3 from '../images/image3.jpg';

const About: React.FC = () => {
  return (
    <section className="container mx-auto px-4 py-16 ">
      <div className="flex flex-col md:flex-row items-center mb-16">
        <img src={Image1} alt="Man standing across lake" className="w-full md:w-1/2 h-97 object-cover rounded-lg shadow-lg mb-6 md:mb-0" />
        <div className="md:ml-8 text-center md:text-left">
          <h2 className="text-6xl font-bold mb-4">About Micasa</h2>
          <p className="text-xl mb-4">
            At Led Luminax, we are dedicated to providing cutting-edge automotive lighting solutions that enhance your driving experience.
            Our team of experts is committed to delivering high-quality products and exceptional customer service, ensuring that you have the best lighting solutions for your vehicle.
          </p>
          <button className="bg-gray-800 text-white px-6 py-2 rounded-full shadow-lg hover:bg-gray-700 transition duration-300">Learn More</button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row-reverse items-center mb-16">
        <img src={Image2} alt="Woman in beach" className="w-full md:w-1/2 h-97 object-cover rounded-lg shadow-lg mb-6 md:mb-0" />
        <div className="md:mr-8 text-center md:text-left">
          <h2 className="text-6xl font-bold mb-4">Our Commitment</h2>
          <p className="text-2xl mb-4">
            We are committed to continuous innovation and excellence in our products, ensuring that you have the most advanced lighting solutions for your vehicle.
          </p>
          <button className="bg-gray-800 text-white px-6 py-2 rounded-full shadow-lg hover:bg-gray-700 transition duration-300">Learn More</button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center mb-16">
        <img src={Image3} alt="Camping on a hill" className="w-full md:w-1/2 h-97 object-cover rounded-lg shadow-lg mb-6 md:mb-0" />
        <div className="md:ml-8 text-center md:text-left">
          <h2 className="text-6xl font-bold mb-4">Our Vision</h2>
          <p className="text-2xl mb-4">
            Our vision is to be the leading provider of automotive lighting solutions, known for our innovation, quality, and customer satisfaction.
          </p>
          <button className="bg-gray-800 text-white px-6 py-2 rounded-full shadow-lg hover:bg-gray-700 transition duration-300">Learn More</button>
        </div>
      </div>
    </section>
  );
};

export default About;
