import React, { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Review {
  author: string;
  role: string;
  avatar: string;
  text: string;
  rating: number;
}

const REVIEWS: Review[] = [
  {
    author: "Rahul Sharma",
    role: "Final Year, IIT Delhi",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
    text: "Finding a flat near campus was always a nightmare. This platform made it so easy. I found a verified place in Malviya Nagar within a day. No brokerage and genuine owners!",
    rating: 4.9,
  },
  {
    author: "Priya Patel",
    role: "Medical Student, AIIMS",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    text: "As a student moving from Gujarat, I was worried about safety and hidden costs. The virtual tours and verified listings gave me so much confidence. Best service for students!",
    rating: 4.8,
  },
  {
    author: "Ananya Iyer",
    role: "Masters in Economics, DU",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
    text: "The community features are great. Not only did I find a room, but I also found amazing flatmates who are also students. The whole process was transparent and smooth.",
    rating: 4.7,
  },
  {
    author: "Arjun Verma",
    role: "B.Tech Student, VIT",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
    text: "I've tried many apps, but this one is specifically tailored for what we students need. Cheap, near college, and reliable. Highly recommended for anyone coming to Noida or Delhi!",
    rating: 5.0,
  },
];

const CustomerReview: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? REVIEWS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === REVIEWS.length - 1 ? 0 : prev + 1));
  };

  const currentReview = REVIEWS[currentIndex];

  return (
    <section className="bg-[#111111] text-white py-20 px-4 font-[montserrat]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* Left Section */}
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 leading-snug font-[montserrat]">
            What Our <span className="text-yellow-400">Indian Students Say</span>
            <br />
            About Their New Homes
          </h2>

          <div className="flex flex-col sm:flex-row gap-6">
            <div>
              <p className="text-2xl font-bold">5000+</p>
              <p className="text-gray-400 text-sm mt-1">
                Students Found Their Homes
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold flex items-center gap-2">
                4.9
                <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
              </p>
              <p className="text-gray-400 text-sm mt-1">Average Student Rating</p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="relative bg-transparent text-left min-h-[300px] flex flex-col justify-center">
          {/* Quote icon */}
          <Quote className="absolute top-0 right-0 text-yellow-400/20 w-16 h-16 -z-0" />

          <div className="relative z-10">
            {/* Author Info */}
            <div className="flex items-center gap-4 mb-6">
              <img
                src={currentReview.avatar}
                alt={currentReview.author}
                className="w-14 h-14 rounded-full border-2 border-yellow-400 object-cover"
              />
              <div>
                <h4 className="font-semibold text-lg">{currentReview.author}</h4>
                <p className="text-yellow-400 text-sm">{currentReview.role}</p>
              </div>
            </div>

            {/* Review Text */}
            <p className="text-gray-300 text-lg italic leading-relaxed mb-8">
              "{currentReview.text}"
            </p>

            {/* Navigation and Rating */}
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <button
                  onClick={handlePrev}
                  className="p-3 rounded-full border border-gray-700 hover:border-yellow-400 hover:text-yellow-400 transition-all duration-300"
                  aria-label="Previous review"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-3 rounded-full border border-gray-700 hover:border-yellow-400 hover:text-yellow-400 transition-all duration-300"
                  aria-label="Next review"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.floor(currentReview.rating) ? "text-yellow-400" : "text-gray-600"}`} 
                    fill={i < Math.floor(currentReview.rating) ? "currentColor" : "none"}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-400">{currentReview.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerReview;
