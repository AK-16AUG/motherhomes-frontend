import React from "react";
import { ArrowRight } from "lucide-react";
import key from "../assets/contract.png";
import house from "../assets/house-location.png";
import trust from "../assets/trust.png";
import { useNavigate } from "react-router";

const Feature: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 font-[montserrat]">
      {/* Main Heading */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 dark:text-white">
          Why You Should <span className="text-yellow-400">Choose</span> Us
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover comfort, convenience, and care all in one place. At
          <span className="text-yellow-400"> MotherHome</span>, we ensure every
          flat or PG you choose feels like home.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-8 mx-auto w-16"></div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Feature 1 */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img src={house} alt="house" className="w-20" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white">
            Wide Range of Properties
          </h2>
          <p className="text-gray-600">
            Explore a variety of verified PGs and flats tailored to suit every
            need, from students to working professionals.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img src={key} alt="key" className="w-20" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white">
            Buy or Rent Homes
          </h2>
          <p className="text-gray-600">
            Whether you're renting or buying, we help you find the perfect
            place—quickly, easily, and at the best price.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img src={trust} alt="trust" className="w-20" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white">
            Trusted by Thousands
          </h2>
          <p className="text-gray-600">
            With a strong network and positive reviews, thousands trust
            MotherHome to make smart and safe housing choices.
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center">
        <button
          onClick={() => navigate("/services")}
          className="inline-flex items-center gap-2 bg-yellow-400 text-white px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors"
        >
          <span>Discover the MotherHome Advantage</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Feature;
