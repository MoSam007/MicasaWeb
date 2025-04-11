import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API_BASE_URL from '../../src/config';
import { 
  ArrowLeft, 
  ArrowRight, 
  Share, 
  X, 
  ChevronLeft, 
  Twitter, 
  Facebook, 
  Instagram,
  MessageCircle 
} from 'lucide-react';

interface IListing {
  image_urls: string[];
  title?: string;
}

// Interface for categorized images
interface IImageCategory {
  name: string;
  images: string[];
}

// Interface for social sharing platforms
interface ISocialShare {
  name: string;
  icon: React.ReactNode;
  shareUrl: (url: string, title: string) => string;
  color: string;
}

const Gallery: React.FC = () => {
  const { l_id } = useParams<{ l_id: string }>();
  const [listing, setListing] = useState<IListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageCategories, setImageCategories] = useState<IImageCategory[]>([]);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const backendUrl = "http://127.0.0.1:8000/";

  // Define social sharing platforms
  const socialPlatforms: ISocialShare[] = [
    {
      name: 'Twitter',
      icon: <Twitter size={20} />,
      shareUrl: (url, title) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      color: 'bg-blue-400'
    },
    {
      name: 'Facebook',
      icon: <Facebook size={20} />,
      shareUrl: (url, title) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&t=${encodeURIComponent(title)}`,
      color: 'bg-blue-600'
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={20} />,
      shareUrl: (url, title) => `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      color: 'bg-green-500'
    },
    {
      name: 'Instagram',
      icon: <Instagram size={20} />,
      shareUrl: (url, title) => `#`, // Instagram doesn't support direct sharing links, but we'll include the button for UI consistency
      color: 'bg-pink-600'
    },
    {
      name: 'Copy Link',
      icon: <Share size={20} />,
      shareUrl: (url) => url,
      color: 'bg-gray-700'
    }
  ];

  // Helper function to get full image URL
  const getFullImageUrl = (url: string) => {
    return url.startsWith('http') ? url : `${backendUrl}/uploads/${url}`;
  };

  useEffect(() => {
    const fetchListing = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/listings/${l_id}`);
        const data = await response.json();
        setListing(data);
        
        // Basic categorization logic based on image URLs or metadata
        // In a real app, you'd have better category data from your API
        const categories: IImageCategory[] = [
          { name: 'All photos', images: data.image_urls },
          { name: 'Kitchen', images: data.image_urls.filter((url: string) => url.includes('kitchen') || url.includes('Kitchen')) },
          { name: 'Bathroom', images: data.image_urls.filter((url: string) => url.includes('bath') || url.includes('Bath')) },
          { name: 'Living room', images: data.image_urls.filter((url: string) => url.includes('living') || url.includes('Living')) },
          { name: 'Gym and Fitness', images: data.image_urls.filter((url: string) => url.includes('gym') || url.includes('Gym') || url.includes('pool') || url.includes('Pool')) }
        ];
        
        // Filter out empty categories
        const filteredCategories = categories.filter(cat => cat.images.length > 0);
        
        // If we don't have good categorization, just use all photos
        if (filteredCategories.length <= 1) {
          setImageCategories([{ name: 'All photos', images: data.image_urls }]);
        } else {
          setImageCategories(filteredCategories);
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [l_id]);

  const openModal = (imageIndex: number) => {
    setCurrentImageIndex(imageIndex);
    setIsModalOpen(true);
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowShareOptions(false);
    // Re-enable body scrolling
    document.body.style.overflow = 'auto';
  };

  const nextImage = () => {
    if (!listing) return;
    setCurrentImageIndex((prevIndex) => 
      prevIndex === listing.image_urls.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    if (!listing) return;
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? listing.image_urls.length - 1 : prevIndex - 1
    );
  };

  const handleShare = (platform: ISocialShare) => {
    if (platform.name === 'Copy Link') {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert('Link copied to clipboard!');
          setShowShareOptions(false);
        })
        .catch(err => console.error('Could not copy text:', err));
      return;
    }
    
    // For all other platforms, open the share URL in a new window
    const shareUrl = platform.shareUrl(
      window.location.href, 
      listing?.title || 'Check out this listing'
    );
    
    if (shareUrl !== '#') {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setShowShareOptions(false);
    } else {
      alert('Direct sharing not available for this platform. Please copy the link instead.');
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      
      switch (e.key) {
        case 'ArrowRight':
          nextImage();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        case 'Escape':
          closeModal();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="container mx-auto px-6 py-8">
      <div className="h-6 w-32 bg-gray-200 rounded mb-8"></div>
      <div className="h-10 w-64 bg-gray-200 rounded mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    </div>
  );

  if (isLoading) return <LoadingSkeleton />;
  if (!listing) return <div className="text-center py-12">Listing not found</div>;

  return (
    <>
<div className="container mx-auto px-4 sm:px-6 py-8">
<div className="flex justify-start mb-4">
    <Link 
      to={`/listing/${l_id}`} 
      className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-md text-gray-700 font-medium transition-all hover:bg-gray-50 hover:shadow-lg"
    >
      <ChevronLeft size={18} className="mr-1" />
      <span>Back to listing</span>
    </Link>
  </div>
   
        {/* Category tabs */}
        <div className="flex flex-wrap gap-4 mb-8 overflow-x-auto pb-2">
          {imageCategories.map((category, index) => (
            <button 
              key={index} 
              className="px-4 py-2 rounded-full bg-gray-400 hover:bg-gray-600 text-sm font-medium whitespace-nowrap"
              onClick={() => {
                // Logic to filter or jump to this category's images
                // For this example, we'll just open the first image in this category
                if (category.images.length > 0) {
                  const globalIndex = listing.image_urls.findIndex(url => url === category.images[0]);
                  if (globalIndex !== -1) openModal(globalIndex);
                }
              }}
            >
              {category.name} ({category.images.length})
            </button>
          ))}
        </div>

        {/* Main featured image grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-8">
          {/* Left side - large featured image */}
          {listing.image_urls.length > 0 && (
            <div className="md:col-span-2 md:row-span-2 aspect-w-4 aspect-h-3">
              <img
                src={getFullImageUrl(listing.image_urls[0])}
                alt="Featured"
                className="w-full h-full object-cover rounded-lg cursor-pointer"
                onClick={() => openModal(0)}
                loading="lazy"
              />
            </div>
          )}
          
          {/* Right side - grid of smaller images */}
          {listing.image_urls.slice(1, 5).map((url, index) => (
            <div key={index} className="aspect-w-1 aspect-h-1">
              <img
                src={getFullImageUrl(url)}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover rounded-lg cursor-pointer"
                onClick={() => openModal(index + 1)}
                loading="lazy"
              />
            </div>
          ))}
          
          {/* Show all photos button (appears over the last image) */}
          {listing.image_urls.length > 5 && (
            <div className="relative">
              <img
                src={getFullImageUrl(listing.image_urls[4])}
                alt="Gallery 5"
                className="w-full h-full object-cover rounded-lg cursor-pointer"
                onClick={() => openModal(4)}
                loading="lazy"
              />
              <button
                className="absolute bottom-3 right-3 backdrop-blur-sm bg-white/30 rounded-lg px-4 py-2 text-sm font-medium shadow-md text-white transition-all duration-300 hover:backdrop-blur-md hover:bg-white/40"
                onClick={() => setIsModalOpen(true)}
              >
                Show all photos
              </button>
            </div>
          )}
        </div>

        {/* Photo grid by categories */}
        {imageCategories.slice(1).map((category, catIndex) => (
          <div key={catIndex} className="mb-12">
            <h2 className="text-xl font-semibold mb-4">{category.name}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {category.images.slice(0, 8).map((url, imgIndex) => {
                const globalIndex = listing.image_urls.findIndex(item => item === url);
                return (
                  <div key={imgIndex} className="aspect-w-4 aspect-h-3">
                    <img
                      src={getFullImageUrl(url)}
                      alt={`${category.name} ${imgIndex + 1}`}
                      className="w-full h-full object-cover rounded-lg cursor-pointer transition duration-200 hover:opacity-90"
                      onClick={() => openModal(globalIndex !== -1 ? globalIndex : 0)}
                      loading="lazy"
                    />
                  </div>
                );
              })}
              
              {category.images.length > 8 && (
                <div className="aspect-w-4 aspect-h-3 relative">
                  <img
                    src={getFullImageUrl(category.images[7])}
                    alt={`${category.name} 8`}
                    className="w-full h-full object-cover rounded-lg cursor-pointer opacity-70"
                    loading="lazy"
                  />
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg cursor-pointer"
                    onClick={() => {
                      // Open modal at the first image of this category
                      const globalIndex = listing.image_urls.findIndex(item => item === category.images[0]);
                      openModal(globalIndex !== -1 ? globalIndex : 0);
                    }}
                  >
                    <span className="text-white font-medium">+{category.images.length - 8} more</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen image modal with fixed controls */}
      {isModalOpen && listing && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
          {/* Modal header - fixed at top */}
          <div className="flex justify-between items-center p-4 text-white absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50">
            <button 
              className="p-2 rounded-full hover:bg-gray-800"
              onClick={closeModal}
            >
              <X size={24} />
            </button>
            <div className="text-center">
              <span className="font-medium">{currentImageIndex + 1}/{listing.image_urls.length}</span>
            </div>
            <div className="relative">
              <button 
                className="p-2 rounded-full hover:bg-gray-800"
                onClick={() => setShowShareOptions(!showShareOptions)}
              >
                <Share size={20} />
              </button>
              
              {/* Social sharing dropdown */}
              {showShareOptions && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                  <div className="py-1">
                    {socialPlatforms.map((platform, index) => (
                      <button
                        key={index}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        onClick={() => handleShare(platform)}
                      >
                        <span className={`flex items-center justify-center w-8 h-8 rounded-full text-white mr-3 ${platform.color}`}>
                          {platform.icon}
                        </span>
                        <span>{platform.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Image container with fixed dimensions */}
          <div className="flex-1 flex items-center justify-center p-16">
            <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
              <img
                src={getFullImageUrl(listing.image_urls[currentImageIndex])}
                alt={`Photo ${currentImageIndex + 1}`}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
          
          {/* Fixed position navigation buttons */}
          <button
            className="absolute left-8 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white text-black hover:bg-gray-200 shadow-lg"
            onClick={prevImage}
            aria-label="Previous image"
          >
            <ArrowLeft size={24} />
          </button>
          <button
            className="absolute right-8 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white text-black hover:bg-gray-200 shadow-lg"
            onClick={nextImage}
            aria-label="Next image"
          >
            <ArrowRight size={24} />
          </button>
          
          {/* Thumbnail strip - fixed at bottom */}
          <div className="overflow-x-auto py-4 bg-black bg-opacity-80 absolute bottom-0 left-0 right-0">
            <div className="flex gap-2 px-4 justify-center">
              {listing.image_urls.map((url, index) => (
                <div 
                  key={index}
                  className={`flex-shrink-0 w-16 h-16 ${currentImageIndex === index ? 'ring-2 ring-white' : 'opacity-70'}`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img
                    src={getFullImageUrl(url)}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery;