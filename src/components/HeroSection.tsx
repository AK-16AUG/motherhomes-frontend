import React, { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";

const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);

  // Sample hero images - replace with your actual image paths
  const heroImages = [
    "https://images.unsplash.com/photo-1705954797147-652784bc2484?q=80&w=1268&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1695959085986-f1370e18bc95?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1745487927734-6f1ae4a5dd32?q=80&w=1026&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1543225852-2bbf041818ce?q=80&w=1158&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ];

  // Rotating words for the tagline
  const rotatingWords = ["Safe", "Comfortable", "Hassle-Free"];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Word rotation functionality
  useEffect(() => {
    const wordInterval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2000); // Change word every 2 seconds

    return () => clearInterval(wordInterval);
  }, [rotatingWords.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroImages.length) % heroImages.length
    );
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const navigate = useNavigate();

  return (
    <div className="relative w-full overflow-hidden font-[montserrat]">
      {/* Image Slideshow Section - Full height */}
      <div className="relative h-[90vh] w-full">
        {/* Images */}
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={image}
              alt={`Hero slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Additional gradient overlay for even better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40"></div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/10 backdrop-blur-sm p-3 text-white/80 hover:bg-white/20 hover:text-white transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/10 backdrop-blur-sm p-3 text-white/80 hover:bg-white/20 hover:text-white transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all border-2 ${
                index === currentSlide
                  ? "bg-yellow-400 border-yellow-400"
                  : "bg-white/50 border-yellow-300 hover:bg-yellow-200 hover:border-yellow-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex mt-10 items-center justify-center z-10">
          <div className="text-center text-white px-4 max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Second Home with{" "}
              <span className="text-yellow-400">MotherHomes</span>
            </h1>

            {/* Animated Tagline */}
            <div className="text-2xl md:text-3xl font-semibold mb-8 h-12 flex items-center justify-center">
              <span className="text-yellow-400">–</span>
              <span className="mx-3">
                <span
                  key={currentWordIndex}
                  className="inline-block animate-pulse"
                >
                  {rotatingWords[currentWordIndex]}
                </span>
              </span>
              <span className="text-yellow-400">–</span>
            </div>

            <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Discover the perfect property that matches your lifestyle and
              budget. Explore thousands of homes, apartments, and commercial
              spaces.
            </p>

            {/* Explore More Button */}
            <button
              onClick={() => navigate("/viewlisting")}
              className="inline-flex items-center gap-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 px-8 py-4 text-white font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span>Explore More</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Section (empty - will be filled by other component) */}
      <div className="relative z-0 w-full bg-white">
        {/* Other component will render here */}
      </div>
    </div>
  );
};

export default HeroSection;
