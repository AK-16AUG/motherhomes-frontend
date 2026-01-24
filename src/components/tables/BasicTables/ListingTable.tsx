import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { useEffect, useState } from "react";
import instance from "../../../utils/Axios/Axios";
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

type LoadingState = "idle" | "loading" | "success" | "error";

interface Property {
  _id: string;
  property_name: string;
  description: string;
  rate: string;
  category: "rent" | "sale" | "pg";
  city: string;
  state: string;
  images: string[];
  furnishing_type: "Semi-furnished" | "Fully furnished" | "Raw";
  bed: number;
  bathroom: number;
  availability: boolean;
  status?: "Available" | "Unavailable" | "Occupied";
  createdAt: string;
  totalCapacity?: string;
  flat_no?: string;
}

const CATEGORY_BADGE_MAP = {
  rent: { color: "blue", label: "For Rent" },
  sale: { color: "yellow", label: "For Sale" },
  pg: { color: "green", label: "PG" },
} as const;

const FURNISHING_BADGE_MAP = {
  "Semi-furnished": { color: "purple", label: "Semi-furnished" },
  "Fully furnished": { color: "green", label: "Fully furnished" },
  Raw: { color: "gray", label: "Raw" },
} as const;

export default function ListingTable() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [state, setState] = useState<LoadingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [editingAvailabilityId, setEditingAvailabilityId] = useState<string | null>(null);
  const [availabilityEditValue, setAvailabilityEditValue] = useState<boolean>(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setState("loading");
        const response = await instance.get(`/property`);

        console.log("API Response:", response.data);

        if (Array.isArray(response.data)) {
          setProperties(response.data);
        } else if (response.data && Array.isArray(response.data.results)) {
          setProperties(response.data.results);
        } else {
          console.error("Expected array from API but got:", response.data);
          setProperties([]);
        }

        setState("success");
      } catch (error) {
        console.error("Error fetching properties:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load properties. Please try again later."
        );
        setState("error");
      }
    };

    fetchProperties();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatCurrency = (amount: string) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const getCategoryBadge = (category: Property["category"]) => {
    const badgeConfig = CATEGORY_BADGE_MAP[category] || {
      color: "gray",
      label: "Unknown",
    };
    return <Badge size="sm">{badgeConfig.label}</Badge>;
  };

  const getFurnishingBadge = (type: Property["furnishing_type"]) => {
    const badgeConfig = FURNISHING_BADGE_MAP[type] || {
      color: "gray",
      label: "Unknown",
    };
    return <Badge size="sm">{badgeConfig.label}</Badge>;
  };

  const getAvailabilityBadge = (available: boolean) => {
    return available ? (
      <Badge size="sm">Available</Badge>
    ) : (
      <Badge size="sm">Occupied</Badge>
    );
  };

  const handleStatusUpdate = async (propertyId: string, newAvailability: boolean) => {
    try {
      await instance.put(`/property/${propertyId}`, { availability: newAvailability });
      setProperties((prev) =>
        prev.map((property) =>
          property._id === propertyId
            ? { ...property, availability: newAvailability }
            : property
        )
      );
      toast.success("Availability updated");
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this property? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await instance.delete(`/property/${propertyId}`);
      setProperties((prev) =>
        prev.filter((property) => property._id !== propertyId)
      );
      toast.success("Property deleted successfully");
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error("Failed to delete property");
    }
  };

  if (state === "loading") {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {[...Array(10)].map((_, i) => (
                  <TableCell isHeader key={i}>
                    <div className="h-6 w-24 bg-gray-100 rounded animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {[...Array(10)].map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <div className="h-6 w-full bg-gray-100 rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500 gap-2">
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p>{error || "An unknown error occurred"}</p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-2">
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p>No Properties Found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="w-full overflow-x-auto">
        <Table
          aria-label="Properties list"
          className="text-gray-900 min-w-[900px]"
        >
          <TableHeader>
            <TableRow>
              <TableCell
                isHeader
                className="text-left px-5 py-3 text-gray-900 font-medium"
              >
                Property
              </TableCell>
              <TableCell
                isHeader
                className="text-left px-5 py-3 text-gray-900 font-medium"
              >
                Category
              </TableCell>
              <TableCell
                isHeader
                className="text-left px-5 py-3 text-gray-900 font-medium"
              >
                Rate
              </TableCell>
              <TableCell
                isHeader
                className="text-left px-5 py-3 text-gray-900 font-medium"
              >
                Location
              </TableCell>
              <TableCell
                isHeader
                className="text-left px-5 py-3 text-gray-900 font-medium"
              >
                Flat No
              </TableCell>
              <TableCell
                isHeader
                className="text-left px-5 py-3 text-gray-900 font-medium"
              >
                Details
              </TableCell>
              <TableCell
                isHeader
                className="text-left px-5 py-3 text-gray-900 font-medium"
              >
                Furnishing
              </TableCell>
              <TableCell
                isHeader
                className="text-left px-5 py-3 text-gray-900 font-medium"
              >
                Availability
              </TableCell>
              <TableCell
                isHeader
                className="text-left px-5 py-3 text-gray-900 font-medium"
              >
                Added On
              </TableCell>
              <TableCell
                isHeader
                className="text-left px-5 py-3 text-gray-900 font-medium"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {Array.isArray(properties) ? (
              properties.map((property) => (
                <TableRow
                  key={property._id}
                  className="hover:bg-gray-50"
                >
                  <TableCell className="text-left px-5 py-3 font-medium text-gray-900">
                    <Link
                      to={`/listing/${property._id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {property.property_name}
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {property.description}
                      </p>
                    </Link>
                  </TableCell>
                  <TableCell className="text-left px-5 py-3 text-gray-900">
                    {getCategoryBadge(property.category)}
                  </TableCell>
                  <TableCell className="text-left px-5 py-3 font-medium text-gray-900">
                    {formatCurrency(property.rate)}
                  </TableCell>
                  <TableCell className="text-left px-5 py-3 text-gray-900">
                    <div>
                      <span className="text-gray-900">
                        {property.city}
                      </span>
                      <span className="block text-gray-500">
                        {property.state}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-left px-5 py-3 text-gray-900">
                    <span className="text-sm text-gray-900">
                      {property.flat_no || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="text-left px-5 py-3 text-gray-900">
                    <div className="flex gap-2">
                      {property.category === "pg" ? (
                        <span className="text-sm text-gray-900">
                          {property.totalCapacity || "N/A"} Capacity
                        </span>
                      ) : (
                        <>
                          <span className="text-sm text-gray-900">
                            {property.bed} Beds
                          </span>
                          <span className="text-sm text-gray-900">
                            |
                          </span>
                          <span className="text-sm text-gray-900">
                            {property.bathroom} Baths
                          </span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-left px-5 py-3 text-gray-900">
                    {getFurnishingBadge(property.furnishing_type)}
                  </TableCell>
                  <TableCell className="text-left px-3 py-2 text-gray-900">
                    {editingAvailabilityId === property._id ? (
                      <select
                        value={availabilityEditValue ? "Available" : "Occupied"}
                        onChange={e => setAvailabilityEditValue(e.target.value === "Available")}
                        onBlur={async () => {
                          await handleStatusUpdate(property._id, availabilityEditValue);
                          setEditingAvailabilityId(null);
                        }}
                        className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      >
                        <option value="Available">Available</option>
                        <option value="Occupied">Occupied</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        {getAvailabilityBadge(property.availability)}
                        <button
                          onClick={() => {
                            setEditingAvailabilityId(property._id);
                            setAvailabilityEditValue(property.availability);
                          }}
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded transition-colors"
                          title="Edit availability"
                        >
                          <Pencil size={16} />
                        </button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-left px-5 py-3 text-gray-900">
                    {formatDate(property.createdAt)}
                  </TableCell>
                  <TableCell className="text-left px-5 py-3 text-gray-900">
                    <div className="flex gap-2">
                      <Link
                        to={`/edit-listing/${property._id}`}
                        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded transition-colors"
                        title="Edit property"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(property._id)}
                        className="p-1 text-gray-500 hover:text-red-600 hover:bg-gray-50 rounded transition-colors"
                        title="Delete property"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="text-center py-4">
                  No properties data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}