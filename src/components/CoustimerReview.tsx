import React from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Review {
  author: string;
  role: string;
  avatar: string;
  text: string;
  rating: number;
  happyPeople: string;
}

const CustomerReview: React.FC = () => {
  const review: Review = {
    author: "Niharika",
    role: "Designer",
    avatar: "https://i.pravatar.cc/80?img=5",
    text: `I was able to find a verified flat in Noida within hours. The platform is simple, secure, and truly reliable. Highly recommended for anyone looking to rent without the hassle.`,
    rating: 4.88,
    happyPeople: "100+",
  };

  return (
    <section className="bg-[#111111] text-white py-20 px-4 font-[montserrat]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* Left Section */}
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 leading-snug font-[montserrat]">
            What Our <span className="text-yellow-400">Customers Say</span>
            <br />
            About Us
          </h2>

          <div className="flex flex-col sm:flex-row gap-6">
            <div>
              <p className="text-2xl font-bold">{review.happyPeople}</p>
              <p className="text-gray-400 text-sm mt-1">
                Users Found Their Homes
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold flex items-center gap-2">
                {review.rating}
                <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
              </p>
              <p className="text-gray-400 text-sm mt-1">Overall rating</p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="relative bg-transparent text-left">
          {/* Quote icon */}
          <Quote className="absolute top-0 right-0 text-yellow-400 w-8 h-8" />

          {/* Author Info */}
          <div className="flex items-center gap-4 mb-4">
            <img
              src={review.avatar}
              alt="Customer"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h4 className="font-semibold">{review.author}</h4>
              <p className="text-gray-400 text-sm">{review.role}</p>
            </div>
          </div>

          {/* Review Text */}
          <p className="text-gray-300 leading-relaxed mb-8">{review.text}</p>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button
              className="p-2 rounded-full border border-gray-700 hover:border-gray-500 transition-colors"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-full border border-gray-700 hover:border-gray-500 transition-colors"
              aria-label="Next review"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerReview;
