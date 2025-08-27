import React, { useEffect, useState } from "react";
import PropertyCard from "./PropertyCard";
import { useNavigate } from "react-router-dom";
import instance from "../utils/Axios/Axios";
import { SkeletonLoader, LoadingButton } from "./ui/loading";

interface PropertyDetails {
  beds: number;
  baths: number;
  area: number;
}

interface Property {
  _id: string;
  title: string;
  image: string;
  tags: string[];
  location: string;
  price: string;
  details: PropertyDetails;
}

// API Property interface (from backend)
interface ApiProperty {
  category: string;
  _id: string;
  property_name: string;
  rate: number;
  bed: number;
  bathroom: number;
  city: string;
  state: string;
  images: string[];
  location: {
    type: string;
    coordinates: [number, number];
  };
}

const FeaturedProperty: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await instance.get("/property");

      // Transform API data to match PropertyCard interface
      const transformedProperties: Property[] = res.data.results
        .slice(0, 6) // Only take first 6 properties
        .map((apiProperty: ApiProperty) => ({
          _id: apiProperty._id, // Changed from 'id' to '_id'
          title: apiProperty.property_name,
          image: apiProperty.images?.[0],
          tags: [`${apiProperty.category}`, "Featured"], // You can customize this based on your needs
          location: `${apiProperty.city}, ${apiProperty.state}`,
          price: `₹${apiProperty.rate.toLocaleString()}`,
          details: {
            beds: apiProperty.bed,
            baths: apiProperty.bathroom,
            area: 400, // You might want to add area field to your API
          },
        }));

      setProperties(transformedProperties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      // Keep some fallback properties in case of API error
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Our <span className="text-yellow-400">Top Picks</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Carefully selected PGs and flats that combine comfort, location,
              and affordability — just for you.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <SkeletonLoader variant="card" count={6} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore Our <span className="text-yellow-400">Top Picks</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Carefully selected PGs and flats that combine comfort, location, and
            affordability — just for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.length > 0 ? (
            properties.map((property) => (
              <PropertyCard
                key={property._id}
                propertyId={property?._id}
                property={property}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">
                No properties available at the moment.
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <LoadingButton
            onClick={() => navigate("/viewlisting?city=all")}
            variant="primary"
            size="lg"
            className="bg-yellow-400 hover:bg-yellow-500"
          >
            View All Properties
          </LoadingButton>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProperty;
