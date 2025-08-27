// Updated Filter component
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface FilterProps {
  count?: number;
  onFilter: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  city: string;
  type: string;
  price: string;
  bedrooms: string;
  sort: string;
}

const Filter: React.FC<FilterProps> = ({
  count = 0,
  onFilter,
  initialFilters = {
    city: "",
    type: "",
    price: "",
    bedrooms: "",
    sort: "relevance",
  },
}) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Update local state when initialFilters change
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value,
    };
    setFilters(newFilters);
    // Call onFilter directly here
    onFilter(newFilters);
  };

  const handleSearch = () => {
    onFilter(filters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Heading with original styling */}
      <div>
        {count > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            {count} {count === 1 ? "property" : "properties"} found
          </p>
        )}
      </div>

      {/* Location Search */}
      <div className="mb-2">
        <div className="flex flex-col gap-0.5">
          <label htmlFor="city" className="text-md">
            Location
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={filters.city}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="City Location"
            className="w-full p-2.5 border border-gray-200 focus:ring-1 focus:ring-yellow-300 focus:border-yellow-300"
          />
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap justify-between gap-5">
        {/* Type Filter */}
        <div className="flex flex-col gap-0.5">
          <label htmlFor="type" className="text-md">
            Type
          </label>
          <select
            name="type"
            id="type"
            value={filters.type}
            onChange={handleInputChange}
            className="w-24 p-2.5 border border-gray-200 focus:ring-1 focus:ring-yellow-300 focus:border-yellow-300"
          >
            <option value="">all</option>
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
          </select>
        </div>

        {/* Price Range Filter */}
        <div className="flex flex-col gap-0.5">
          <label htmlFor="price" className="text-md">
            Price Range
          </label>
          <select
            name="price"
            id="price"
            value={filters.price}
            onChange={handleInputChange}
            className="w-32 p-2.5 border border-gray-200 focus:ring-1 focus:ring-yellow-300 focus:border-yellow-300"
          >
            <option value="">all</option>
            <option value="0-8000">Below ₹8,000</option>
            <option value="8000-10000">₹8,000 - ₹10,000</option>
            <option value="10000-25000">₹10,000 - ₹25,000</option>
            <option value="25000-50000">₹25,000 - ₹50,000</option>
            <option value="50000-100000">₹50,000 - ₹1 Lakh</option>
            <option value="100000-500000">₹1 Lakh - ₹5 Lakh</option>
            <option value="500000-1000000">₹5 Lakh - ₹10 Lakh</option>
            <option value="1000000-5000000">₹10 Lakh - ₹50 Lakh</option>
            <option value="5000000-10000000">₹50 Lakh - ₹1 Crore</option>
            <option value="10000000+">Above ₹1 Crore</option>
          </select>
        </div>

        {/* Bedrooms Filter */}
        <div className="flex flex-col gap-0.5">
          <label htmlFor="bedrooms" className="text-md">
            Bedrooms
          </label>
          <select
            name="bedrooms"
            id="bedrooms"
            value={filters.bedrooms}
            onChange={handleInputChange}
            className="w-24 p-2.5 border border-gray-200 focus:ring-1 focus:ring-yellow-300 focus:border-yellow-300"
          >
            <option value="">all</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4+</option>
          </select>
        </div>

        {/* Sort By Filter */}
        <div className="flex flex-col gap-0.5">
          <label htmlFor="sort" className="text-md">
            Sort by
          </label>
          <select
            name="sort"
            id="sort"
            value={filters.sort}
            onChange={handleInputChange}
            className="w-32 p-2.5 border border-gray-200 focus:ring-1 focus:ring-yellow-300 focus:border-yellow-300"
          >
            <option value="relevance">Relevance</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="date">Latest</option>
          </select>
        </div>

        {/* Search Button */}
        <div className="flex flex-col gap-0.5">
          <label className="text-xs invisible">Search</label>
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2.5 transition-colors"
          >
            <Search size={20} />
            <span>Search</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filter;
