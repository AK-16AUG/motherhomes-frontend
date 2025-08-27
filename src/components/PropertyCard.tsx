import { BedDouble, Bath, Ruler, MapPin } from "lucide-react";
import { useNavigate } from "react-router";

interface PropertyDetails {
  beds: number;
  baths: number;
  area: number;
}

interface PropertyCardProps {
  propertyId: string;
  property: {
    image: string;
    title: string;
    location: string;
    tags: string[];
    price: string;
    details: PropertyDetails;
  };
}

const PropertyCard: React.FC<PropertyCardProps> = (prop) => {
  const { image, title, location, tags, price, details } = prop.property;
  const propertyId = prop.propertyId;
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/viewlisting/${propertyId}`)}
      className="relative w-full h-80 rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:scale-[1.03] transition-transform duration-300 ease-in-out"
    >
      {/* Background Image */}
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay for darkening effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />

      {/* Tags */}
      <div className="absolute top-3 left-3 z-20 flex gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className={`px-2 py-1 text-xs font-semibold rounded-xl ${
              tag === "FOR SALE"
                ? "bg-green-600 text-white"
                : tag === "FOR RENT"
                ? "bg-blue-600 text-white"
                : "bg-yellow-400 text-black"
            }`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 w-full z-20 p-4 text-white">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center text-sm mt-1">
          <MapPin className="w-4 h-4 mr-1" />
          {location}
        </div>

        {/* Features */}
        <div className="flex gap-3 items-center text-sm mt-4">
          <div className="flex items-center gap-1">
            <BedDouble className="w-4 h-4" />
            {details.beds}
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            {details.baths}
          </div>
          <div className="flex items-center gap-1">
            <Ruler className="w-4 h-4" />
            {details.area} sq ft
          </div>
        </div>

        {/* Price */}
        <div className="mt-4 text-lg font-bold">{price}</div>
      </div>
    </div>
  );
};

export default PropertyCard;
