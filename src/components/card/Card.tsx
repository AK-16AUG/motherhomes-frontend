import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

interface CardItem {
  id: string | number;
  img: string | string[];
  title: string;
  price: number;
  address: string;
  bedroom: number;
  bathroom: number;
  area?: number;
  type?: string;
  furnished?: "Furnished" | "Semi-Furnished" | "Unfurnished";
  parking?: boolean;
  balcony?: number;
  floor?: number;
  totalFloors?: number;
  age?: number;
  amenities?: string[];
  category: "rent" | "sale" | "pg";
}

interface CardProps {
  item: CardItem;
  index: number;
}

function Card({ item }: CardProps) {
  const navigate = useNavigate();
  const [viewingCount, setViewingCount] = useState(0);
  const [visitingTodayCount, setVisitingTodayCount] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = Array.isArray(item.img) ? item.img : [item.img];
  const displayImages = images.filter(Boolean).length > 0 ? images.filter(Boolean) : [
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  ];
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateRandomViews = () => {
      setViewingCount(Math.floor(Math.random() * 14) + 2);
      setVisitingTodayCount(Math.floor(Math.random() * 9) + 1);
    };
    generateRandomViews();

    const interval = setInterval(() => {
      setViewingCount((prev) =>
        Math.max(1, Math.min(20, prev + Math.floor(Math.random() * 3) - 1))
      );
    }, Math.random() * 20000 + 10000);

    const todayInterval = setInterval(() => {
      setVisitingTodayCount((prev) =>
        Math.max(1, Math.min(9, prev + Math.floor(Math.random() * 3) - 1))
      );
    }, Math.random() * 180000 + 120000);

    return () => {
      clearInterval(interval);
      clearInterval(todayInterval);
    };
  }, []);

  useEffect(() => {
    if (displayImages.length > 1) {
      const imageInterval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
      }, 3000);
      return () => clearInterval(imageInterval);
    }
  }, [displayImages.length]);

  useEffect(() => {
    if (scrollRef.current && displayImages.length > 1) {
      const scrollTo = scrollRef.current.offsetWidth * currentImageIndex;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  }, [currentImageIndex, displayImages.length]);

  const handleClick = () => navigate(`/viewlisting/${item.id}`);

  const formatArea = (area: number) => {
    return area >= 10000 ? `${(area / 10000).toFixed(1)}K` : area.toString();
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
    return `₹${price.toLocaleString()}`;
  };

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-gray-200 cursor-pointer transform hover:-translate-y-1 flex flex-col md:flex-row"
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === "Enter" && handleClick()}
    >
      {/* Image Section - Top on mobile, Left on larger screens */}
      <div className="relative w-full md:w-3/5 h-56 sm:h-64 md:h-78 overflow-hidden rounded-t-2xl md:rounded-t-none md:rounded-l-2xl flex-shrink-0">
        <div
          ref={scrollRef}
          className="flex flex-row w-full h-full overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          style={{ scrollBehavior: 'smooth' }}
          onClick={e => e.stopPropagation()}
        >
          {displayImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`${item.title} - Image ${index + 1}`}
              className="w-full h-full object-cover flex-shrink-0 snap-center"
              style={{ minWidth: '100%', maxWidth: '100%' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
              }}
            />
          ))}
        </div>
        {/* Category Badge */}
        <div className="absolute top-4 left-4 z-30">
          <div className="backdrop-blur-md bg-yellow-400 text-black px-3 py-1.5 text-xs font-semibold shadow-lg">
            {item.category.toUpperCase()}
          </div>
        </div>
        {/* Image Indicators */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 right-4 flex gap-2 z-30">
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? "bg-white w-6"
                    : "bg-white/60 hover:bg-white/80 w-2"
                }`}
              />
            ))}
          </div>
        )}
        {/* Live Viewing Indicator */}
        <div className="absolute bottom-4 left-4 z-30">
          <div className="backdrop-blur-md bg-yellow-500/90 text-black px-3 py-1.5 text-xs font-semibold shadow-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
            <span className="font-medium">{viewingCount} viewing</span>
          </div>
        </div>
        {/* Visiting Today Counter */}
        <div className="absolute top-4 right-4 z-30">
          <div className="backdrop-blur-md bg-black/90 text-white px-3 py-1.5 text-xs font-medium shadow-lg flex items-center gap-2">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            <span>{visitingTodayCount} Visiting today</span>
          </div>
        </div>
      </div>

      {/* Content Section - Bottom on mobile, Right on larger screens */}
      <div className="w-full md:w-3/5 p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 md:space-y-5 flex flex-col justify-between">
        {/* Top Section - Price, Age, Title, Address */}
        <div className="space-y-3 sm:space-y-4">
          {/* Price and Age */}
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-3 sm:px-4 py-2 sm:py-2.5 font-bold text-base sm:text-lg shadow-lg">
                {formatPrice(item.price)}
              </div>
              {item.area && (
                <div className="text-right">
                  <span className="text-xs text-gray-500 block font-medium">
                    per sq ft
                  </span>
                  <div className="text-sm font-semibold text-gray-700">
                    ₹{Math.round(item.price / item.area)}
                  </div>
                </div>
              )}
            </div>
            {item.age !== undefined && (
              <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
                {item.age === 0 ? "🆕 New" : `${item.age}Y old`}
              </span>
            )}
          </div>

          {/* Title and Address */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors leading-tight break-words whitespace-normal">
              {item.title}
            </h2>
            <div className="flex items-center gap-2 text-gray-600">
              <svg
                className="w-4 h-4 text-yellow-500 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs sm:text-sm font-medium text-gray-700 break-words whitespace-normal">
                {item.address}
              </span>
            </div>
          </div>
        </div>

        {/* Middle Section - Features Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 bg-yellow-50 px-2 sm:px-3 py-2 sm:py-2.5 border border-yellow-200">
            <svg
              className="w-4 h-4 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
              />
            </svg>
            <span className="text-xs sm:text-sm font-semibold text-gray-800">
              {item.category === "pg" ? `${item.bedroom} Capacity` : `${item.bedroom} BHK`}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 px-2 sm:px-3 py-2 sm:py-2.5 border border-gray-200">
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
              />
            </svg>
            <span className="text-xs sm:text-sm font-semibold text-gray-800">
              {item.bathroom} Bath
            </span>
          </div>
          {item.area && (
            <div className="flex items-center gap-2 sm:gap-3 bg-yellow-50 px-2 sm:px-3 py-2 sm:py-2.5 border border-yellow-200">
              <svg
                className="w-4 h-4 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
              <span className="text-xs sm:text-sm font-semibold text-gray-800">
                {formatArea(item.area)} sq ft
              </span>
            </div>
          )}
          {item.balcony !== undefined && item.balcony > 0 && (
            <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 px-2 sm:px-3 py-2 sm:py-2.5 border border-gray-200">
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs sm:text-sm font-semibold text-gray-800">
                {item.balcony} Balcony
              </span>
            </div>
          )}
        </div>

        {/* Bottom Section - Tags and Button */}
        <div className="space-y-3 sm:space-y-4">
          {/* Tags and Features */}
          <div className="flex flex-wrap gap-2">
            {item.parking && (
              <span className="inline-flex items-center gap-1 sm:gap-2 bg-gray-800 text-white px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium shadow-sm">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z"
                  />
                </svg>
                Parking
              </span>
            )}
            {item.furnished && (
              <span className="inline-flex items-center bg-yellow-100 text-yellow-800 border border-yellow-300 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium shadow-sm">
                {item.furnished}
              </span>
            )}
            {item.amenities && item.amenities.length > 0 && (
              <span className="inline-flex items-center bg-blue-100 text-blue-800 border border-blue-300 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium shadow-sm">
                +{item.amenities.length} amenities
              </span>
            )}
          </div>

          {/* View Details Button */}
          <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg group-hover:shadow-xl transition-all duration-300">
            <span className="font-semibold text-xs sm:text-sm">
              View Details
            </span>
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;