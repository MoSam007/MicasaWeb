import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';

interface ImageGalleryProps {
  images: string[];
  listingId: string;
  backendUrl: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, listingId, backendUrl }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle resize events
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">No images available</span>
      </div>
    );
  }

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Process the current image URL
  const currentImageUrl = images[activeIndex].startsWith('http') 
    ? images[activeIndex] 
    : `${backendUrl}/uploads/${images[activeIndex]}`;

  // Touch event handlers for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  return (
    <div 
      ref={galleryRef}
      className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-md"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img 
        src={currentImageUrl}
        alt={`View ${activeIndex + 1}`}
        className="w-full h-full object-cover"
      />
      
      {/* Navigation arrows - only on desktop or when not enough images to swipe */}
      {(!isMobile || images.length <= 1) && (
        <div className="absolute inset-0 flex items-center justify-between px-3">
          <button 
            onClick={prevImage}
            className="h-8 w-8 rounded-full bg-white bg-opacity-70 flex items-center justify-center shadow hover:bg-opacity-90 transition-all"
          >
            <FaChevronLeft className="h-3 w-3 text-gray-800" />
          </button>
          <button 
            onClick={nextImage}
            className="h-8 w-8 rounded-full bg-white bg-opacity-70 flex items-center justify-center shadow hover:bg-opacity-90 transition-all"
          >
            <FaChevronRight className="h-3 w-3 text-gray-800" />
          </button>
        </div>
      )}
      
      {/* Image counter & view all button */}
      <div className="absolute bottom-3 left-3 right-3 flex justify-between">
        <div className="py-1 px-3 bg-black bg-opacity-60 backdrop-blur-sm text-white rounded-lg text-xs">
          {activeIndex + 1} / {images.length}
        </div>
        
        <Link 
          to={`/listing/${listingId}/gallery`}
          className="py-1 px-3 bg-white bg-opacity-80 backdrop-blur-sm text-black text-xs rounded-lg shadow-sm hover:bg-opacity-90 transition-all"
        >
          View all
        </Link>
      </div>
      
      {/* Mobile swipe indicator (visible only on mobile) */}
      {isMobile && images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-8">
          <div className="flex space-x-1">
            {images.map((_, index) => (
              <div 
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeIndex 
                    ? 'w-4 bg-white' 
                    : 'w-1.5 bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;